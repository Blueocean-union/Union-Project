package ITProject.union.Repository;

import ITProject.union.Entity.FileItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FileItemRepository extends JpaRepository<FileItem, Long> {

    // 특정 폴더에 속한 파일 목록 조회
    List<FileItem> findByFolderId(Long folderId);

    // 중복된 파일명 확인용 (optional)
    Optional<FileItem> findByStoredFileName(String storedFileName);
}
