package ITProject.union.Service;

import ITProject.union.Entity.FileItem;
import ITProject.union.Entity.Folder;
import ITProject.union.Entity.Subject;
import ITProject.union.Repository.FileItemRepository;
import ITProject.union.Repository.FolderRepository;
import ITProject.union.Repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileSystemService {

    private final SubjectRepository subjectRepository;
    private final FolderRepository folderRepository;
    private final FileItemRepository fileItemRepository;

    private final String BASE_PATH = "/uploads"; // 로컬 저장 경로

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

    // ✅ 파일 업로드
    @Transactional
    public Long uploadFile(Long folderId, MultipartFile file) throws IOException {
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new RuntimeException("폴더 없음"));

        String uuid = UUID.randomUUID().toString();
        String originalName = file.getOriginalFilename();
        String extension = originalName.substring(originalName.lastIndexOf("."));
        String storedFileName = uuid + "_" + originalName;
        String filePath = BASE_PATH + "/" + folder.getSubject().getId() + "/" + folder.getId();

        // 디렉토리 생성
        File dir = new File(filePath);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        // 파일 저장
        File dest = new File(dir, storedFileName);
        file.transferTo(dest);

        FileItem fileItem = new FileItem();
        fileItem.setOriginalFileName(originalName);
        fileItem.setStoredFileName(storedFileName);
        fileItem.setFileType(extension);
        fileItem.setFilePath(filePath + "/" + storedFileName);
        fileItem.setFolder(folder);
        fileItem.setUploadedAt(LocalDateTime.now());

        fileItemRepository.save(fileItem);
        return fileItem.getId();
    }

    // ✅ 특정 폴더 내 파일 목록 조회
    @Transactional(readOnly = true)
    public List<FileItem> getFiles(Long folderId) {
        return fileItemRepository.findByFolderId(folderId);
    }

    @Transactional(readOnly = true)
    public FileItem getFileById(Long fileId) {
        return fileItemRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("파일을 찾을 수 없습니다."));
    }

    @Transactional
    public void deleteFile(Long fileId) {
        FileItem file = fileItemRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("파일을 찾을 수 없습니다."));

        File physicalFile = new File(file.getFilePath());
        if (physicalFile.exists()) {
            physicalFile.delete(); // 실제 파일 삭제
        }

        fileItemRepository.delete(file); // DB 삭제
    }

}
