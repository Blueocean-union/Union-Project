package ITProject.union.Repository;

import ITProject.union.Entity.FileItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface FileItemRepository extends JpaRepository<FileItem, Long> {

    // 단건 + 소유자 검증
    Optional<FileItem> findByIdAndOwnerUserId(Long id, Long ownerUserId);

    // 폴더 내 목록 (페이지네이션)
    Page<FileItem> findByOwnerUserIdAndFolderIdAndDeletedFalseOrderByUpdatedAtDesc(
            Long ownerUserId, Long folderId, Pageable pageable
    );

    // 델타(변경분) 조회: updatedAfter 이후 변경(신규/수정/삭제 포함)
    List<FileItem> findByOwnerUserIdAndFolderIdAndUpdatedAtAfterOrderByUpdatedAtAsc(
            Long ownerUserId, Long folderId, Instant updatedAfter
    );

    // 폴더 전체(초기 싱크 시)
    List<FileItem> findByOwnerUserIdAndFolderIdOrderByUpdatedAtAsc(
            Long ownerUserId, Long folderId
    );

    // S3 키 중복 방지/확인 (확정 전후 검증용)
    boolean existsByBucketAndObjectKey(String bucket, String objectKey);

    // 소프트 삭제(업데이트 타임스탬프까지 함께)
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
           update FileItem f set
             f.deleted = true,
             f.deletedAt = :now,
             f.updatedAt = :now
           where f.id = :id and f.ownerUserId = :ownerUserId
           """)
    int softDelete(@Param("id") Long id,
                   @Param("ownerUserId") Long ownerUserId,
                   @Param("now") Instant now);
}
