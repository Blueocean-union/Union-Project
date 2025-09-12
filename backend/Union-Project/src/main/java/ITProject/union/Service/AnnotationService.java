package ITProject.union.Service;

import ITProject.union.Dto.AnnotationGetResponse;
import ITProject.union.Dto.AnnotationSaveRequest;
import ITProject.union.Entity.FileItem;
import ITProject.union.Entity.PdfAnnotation;
import ITProject.union.Repository.FileItemRepository;
import ITProject.union.Repository.PdfAnnotationRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AnnotationService {

    private final PdfAnnotationRepository pdfAnnotationRepository;
    private final FileItemRepository fileRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public AnnotationGetResponse getAnnotations(Long fileId) {
        return pdfAnnotationRepository.findByFile_Id(fileId)
                .map(pa -> new AnnotationGetResponse(
                        readList(pa.getData()),
                        pa.getVersion(),
                        pa.getUpdatedAt()
                ))
                .orElseGet(() -> new AnnotationGetResponse(
                        Collections.emptyList(), 0, null
                ));
    }

    @Transactional
    public AnnotationGetResponse saveAnnotations(Long fileId, AnnotationSaveRequest request, Long currentUserId) {
        // (선택) 파일 소유권/접근권한 검증
        FileItem file = fileRepository.findById(fileId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 파일 ID: " + fileId));
        // ex) if (!file.isOwner(currentUserId)) throw ...

        String json = writeJson(request.annotations());
        LocalDateTime now = LocalDateTime.now();

        PdfAnnotation entity = pdfAnnotationRepository.findByFile_Id(fileId)
                .map(existing -> {
                    // (선택) 클라이언트 버전 충돌 체크
                    if (request.clientVersion() != null &&
                            !request.clientVersion().equals(existing.getVersion())) {
                        // 단순 덮어쓰기 대신 병합/오류 처리할 수 있음
                        // 여기서는 덮어쓰기 허용 (필요 시 예외 발생시키기)
                    }
                    existing.setData(json);
                    existing.setVersion(existing.getVersion() + 1);
                    existing.setUpdatedAt(now);
                    return existing;
                })
                .orElseGet(() -> PdfAnnotation.builder()
                        .file(file)
                        .data(json)
                        .version(1)
                        .createdAt(now)
                        .updatedAt(now)
                        .build()
                );

        PdfAnnotation saved = pdfAnnotationRepository.save(entity);

        return new AnnotationGetResponse(
                request.annotations(),
                saved.getVersion(),
                saved.getUpdatedAt()
        );
    }

    // --- helpers ---

    private String writeJson(List<Object> annotations) {
        try {
            return objectMapper.writeValueAsString(annotations);
        } catch (Exception e) {
            throw new IllegalArgumentException("annotations 직렬화 실패", e);
        }
    }

    @SuppressWarnings("unchecked")
    private List<Object> readList(String json) {
        try {
            return objectMapper.readValue(json, List.class);
        } catch (Exception e) {
            throw new IllegalStateException("annotations 역직렬화 실패", e);
        }
    }
}
