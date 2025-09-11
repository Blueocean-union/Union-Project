package ITProject.union.Service;

import ITProject.union.Entity.FileItem;
import ITProject.union.Entity.Folder;
import ITProject.union.Entity.Subject;
import ITProject.union.Repository.FileItemRepository;
import ITProject.union.Repository.FolderRepository;
import ITProject.union.Repository.SubjectRepository;
import ITProject.union.Dto.file.*; // PresignUploadRequest, PresignUploadResponse, ConfirmUploadRequest, ConfirmUploadResponse, FileItemSummaryDto, FileListResponse, DownloadUrlResponse

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import software.amazon.awssdk.core.exception.SdkClientException;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectResponse;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 폴더 + 파일(S3 Presigned) 통합 서비스 (최종본)
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class FileSystemService {

    private final SubjectRepository subjectRepository;
    private final FolderRepository folderRepository;
    private final FileItemRepository fileItemRepository;

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    @Value("${aws.s3.bucket}")
    private String bucket;

    @Value("${app.s3.presign.expire-minutes:10}")
    private long presignExpireMinutes; // 기본 10분

    /* ===========================
     * 폴더 서비스 (기존 유지)
     * =========================== */

    // ✅ 하위 폴더 생성
    @Transactional
    public Long createFolder(Long parentId, String folderName) {
        Folder parent = folderRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("상위 폴더가 없습니다."));

        Folder folder = new Folder();
        folder.setName(folderName);
        folder.setParent(parent);
        folder.setCreatedAt(LocalDateTime.now());

        folderRepository.save(folder);
        return folder.getId();
    }

    @Transactional(readOnly = true)
    public Folder getFolder(Long folderId) {
        return folderRepository.findById(folderId)
                .orElseThrow(() -> new RuntimeException("폴더를 찾을 수 없습니다."));
    }

    // ✅ 폴더명 수정
    @Transactional
    public void renameFolder(Long folderId, String newName) {
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new RuntimeException("폴더 없음"));

        folder.setName(newName);
        folder.setUpdatedAt(LocalDateTime.now());
    }

    // ✅ 폴더 삭제
    @Transactional
    public void deleteFolder(Long folderId) {
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new RuntimeException("폴더 없음"));
        folderRepository.delete(folder); // cascade로 하위 포함 삭제
    }

    /* ===========================
     * 파일 서비스 (5개 기능)
     * =========================== */

    /**
     * 1) 업로드용 Presigned URL 발급 (클라이언트가 S3로 직접 PUT)
     */
    @Transactional(readOnly = true)
    public PresignUploadResponse presignUpload(PresignUploadRequest req, Long requesterUserId) {
        Folder folder = folderRepository.findById(req.folderId())
                .orElseThrow(() -> new RuntimeException("폴더 없음"));

        Long ownerUserId = getOwnerUserIdFromFolder(folder);
        ensureOwnership(ownerUserId, requesterUserId);

        Long subjectId = getSubjectIdFromFolder(folder);
        String safeName = sanitize(req.originalName());
        String objectKey = buildObjectKey(ownerUserId, subjectId, folder.getId(), safeName);

        PutObjectRequest putReq = PutObjectRequest.builder()
                .bucket(bucket)
                .key(objectKey)
                .contentType(req.contentType())
                .build();

        Duration expire = Duration.ofMinutes(presignExpireMinutes);
        PresignedPutObjectRequest presigned = s3Presigner.presignPutObject(r -> r
                .signatureDuration(expire)
                .putObjectRequest(putReq)
        );

        return new PresignUploadResponse(
                presigned.url().toString(),
                objectKey,
                expire.toSeconds()
        );
    }

    /**
     * 2) 업로드 확정 (메타데이터 저장)
     * - objectKey가 S3에 실제로 존재하는지 HEAD로 확인
     */
    @Transactional
    public ConfirmUploadResponse confirmUpload(ConfirmUploadRequest req, Long requesterUserId) {
        Folder folder = folderRepository.findById(req.folderId())
                .orElseThrow(() -> new RuntimeException("폴더 없음"));

        Long ownerUserId = getOwnerUserIdFromFolder(folder);
        ensureOwnership(ownerUserId, requesterUserId);

        // S3 존재 확인 (에러 시 예외)
        HeadObjectResponse head = headObjectOrThrow(bucket, req.objectKey());

        // 메타데이터 저장
        FileItem entity = new FileItem();
        entity.setOwnerUserId(ownerUserId);
        entity.setFolderId(req.folderId());
        entity.setBucket(bucket);
        entity.setObjectKey(req.objectKey());
        entity.setOriginalFileName(req.originalFileName());
        entity.setContentType(req.contentType());
        entity.setSize(req.size() != null ? req.size() : head.contentLength());
        entity.setCreatedAt(Instant.now());
        entity.setUpdatedAt(Instant.now());
        entity.setDeleted(false);
        entity.setDeletedAt(null);
        entity.setEtag(head.eTag());

        fileItemRepository.save(entity);
        return new ConfirmUploadResponse(entity.getId());
    }

    /**
     * 3) 목록(델타 포함). updatedAfter가 null이면 전체, 아니면 변경분만 반환
     */
    @Transactional(readOnly = true)
    public FileListResponse listFiles(Long folderId, Instant updatedAfter, Long requesterUserId) {
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new RuntimeException("폴더 없음"));

        Long ownerUserId = getOwnerUserIdFromFolder(folder);
        ensureOwnership(ownerUserId, requesterUserId);

        List<FileItem> items;
        if (updatedAfter == null) {
            items = fileItemRepository
                    .findByOwnerUserIdAndFolderIdOrderByUpdatedAtAsc(ownerUserId, folderId);
        } else {
            items = fileItemRepository
                    .findByOwnerUserIdAndFolderIdAndUpdatedAtAfterOrderByUpdatedAtAsc(ownerUserId, folderId, updatedAfter);
        }

        List<FileItemSummaryDto> dtos = items.stream()
                .map(FileSystemService::toDto)
                .collect(Collectors.toList());

        Instant nextSyncAt = Instant.now();
        return new FileListResponse(dtos, nextSyncAt);
    }

    /**
     * 4) 다운로드용 Presigned URL 발급 (클라이언트가 S3로 직접 GET)
     */
    @Transactional(readOnly = true)
    public DownloadUrlResponse getDownloadUrl(Long fileId, Long requesterUserId) {
        FileItem file = fileItemRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("파일을 찾을 수 없습니다."));

        Long ownerUserId = file.getOwnerUserId();
        ensureOwnership(ownerUserId, requesterUserId);

        String cd = "attachment; filename=\"" + contentDispositionFilename(file.getOriginalFileName()) + "\"";

        GetObjectRequest getReq = GetObjectRequest.builder()
                .bucket(file.getBucket())
                .key(file.getObjectKey())
                .responseContentDisposition(cd)
                .build();

        Duration expire = Duration.ofMinutes(presignExpireMinutes);
        PresignedGetObjectRequest presigned = s3Presigner.presignGetObject(r -> r
                .signatureDuration(expire)
                .getObjectRequest(getReq)
        );

        return new DownloadUrlResponse(presigned.url().toString(), expire.toSeconds());
    }

    /**
     * 5) 삭제(소프트 삭제) + S3 객체 삭제
     * - 소프트 삭제: 다른 기기에 삭제 전파를 위해 DB에 deleted=true 반영
     * - 실제 S3 삭제도 함께 수행(원하면 비동기/배치로 분리 가능)
     */
    @Transactional
    public void deleteFile(Long fileId, Long requesterUserId) {
        FileItem file = fileItemRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("파일을 찾을 수 없습니다."));

        Long ownerUserId = file.getOwnerUserId();
        ensureOwnership(ownerUserId, requesterUserId);

        // S3 삭제 (존재하지 않아도 예외 없이 지나가도록 안전 처리)
        try {
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(file.getBucket())
                    .key(file.getObjectKey())
                    .build());
        } catch (SdkClientException e) {
            log.warn("S3 delete warning (ignored): {}", e.getMessage());
        }

        // 소프트 삭제 플래그 + 타임스탬프 갱신
        file.setDeleted(true);
        file.setDeletedAt(Instant.now());
        file.setUpdatedAt(Instant.now());
        fileItemRepository.save(file);
    }

    /* ===========================
     * 내부 유틸 & 매퍼(toDto)
     * =========================== */

    private static FileItemSummaryDto toDto(FileItem e) {
        return new FileItemSummaryDto(
                e.getId(),
                e.getFolderId(),
                e.getOriginalFileName(),
                e.getContentType(),
                e.getSize(),
                e.getUpdatedAt(),
                e.isDeleted()
        );
    }

    private Long getOwnerUserIdFromFolder(Folder folder) {
        // 프로젝트 엔티티에 맞게 조정: 예) folder.getSubject().getUser().getId()
        Subject subject = folder.getSubject();
        if (subject == null || subject.getUser() == null) {
            throw new RuntimeException("폴더의 소유자 정보를 확인할 수 없습니다.");
        }
        return subject.getUser().getId();
    }

    private Long getSubjectIdFromFolder(Folder folder) {
        Subject subject = folder.getSubject();
        if (subject == null || subject.getId() == null) {
            throw new RuntimeException("폴더의 과목(subject) 정보를 확인할 수 없습니다.");
        }
        return subject.getId();
    }

    private void ensureOwnership(Long ownerUserId, Long requesterUserId) {
        if (!Objects.equals(ownerUserId, requesterUserId)) {
            throw new RuntimeException("권한 없음");
        }
    }

    private String buildObjectKey(Long ownerUserId, Long subjectId, Long folderId, String safeName) {
        return "user/%d/subject/%d/folder/%d/%s_%s".formatted(
                ownerUserId, subjectId, folderId, UUID.randomUUID(), safeName
        );
    }

    private String sanitize(String filename) {
        if (filename == null) return "noname";
        // 경로 분리자 제거 + 큰따옴표 회피
        String v = filename.replace("\\", "_").replace("/", "_").replace("\"", "'");
        // 너무 길면 잘라내기
        if (v.length() > 180) v = v.substring(0, 180);
        return v;
    }

    private String contentDispositionFilename(String original) {
        // 간단 처리 (브라우저 호환 개선 가능)
        String fallback = original.replace("\"", "'");
        String encoded = URLEncoder.encode(original, StandardCharsets.UTF_8)
                .replaceAll("\\+", "%20");
        // RFC5987 형식까지 쓰려면 filename* 추가
        return fallback + "\"; filename*=UTF-8''" + encoded;
    }

    private HeadObjectResponse headObjectOrThrow(String bucket, String objectKey) {
        try {
            return s3Client.headObject(HeadObjectRequest.builder()
                    .bucket(bucket)
                    .key(objectKey)
                    .build());
        } catch (NoSuchKeyException e) {
            throw new RuntimeException("S3에 업로드된 파일을 찾을 수 없습니다. objectKey=" + objectKey);
        } catch (SdkClientException e) {
            throw new RuntimeException("S3 확인 중 오류: " + e.getMessage());
        }
    }
}
