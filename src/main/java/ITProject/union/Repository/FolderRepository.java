package ITProject.union.Repository;

import ITProject.union.Entity.Folder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FolderRepository extends JpaRepository<Folder, Long> {

    // 특정 과목의 루트 폴더 찾기 (parent == null)
    List<Folder> findBySubjectIdAndParentIsNull(Long subjectId);

    // 특정 폴더의 하위 폴더 목록
    List<Folder> findByParentId(Long parentId);
}
