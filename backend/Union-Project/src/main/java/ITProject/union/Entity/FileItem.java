package ITProject.union.Entity;


import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Comment;

import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "file_item",
        indexes = {
                @Index(name = "idx_fileitem_folder", columnList = "folder_id"),
                @Index(name = "idx_fileitem_owner", columnList = "owner_user_id"),
                @Index(name = "idx_fileitem_updated", columnList = "updated_at"),
                @Index(name = "idx_fileitem_deleted", columnList = "deleted")
        },
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_fileitem_bucket_key", columnNames = {"bucket", "object_key"})
        }
)
public class FileItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 파일 소유자(계정 기준). 폴더-과목-사용자를 통해 유추 가능하더라도, 쿼리 성능을 위해 비정규화 보관 권장 */
    @Column(name = "owner_user_id", nullable = false)
    @Comment("파일 소유자(계정) ID")
    private Long ownerUserId;

    /** 폴더 ID (Folder 엔티티를 이미 쓰고 있다면 ManyToOne으로 교체 가능) */
    @Column(name = "folder_id", nullable = false)
    @Comment("소속 폴더 ID")
    private Long folderId;

    /** S3 버킷 */
    @Column(name = "bucket", nullable = false, length = 128)
    private String bucket;

    /** S3 오브젝트 키 (예: user/{uid}/folder/{fid}/{uuid}_{safeName}.pdf) */
    @Column(name = "object_key", nullable = false, length = 1024)
    private String objectKey;

    /** 원본 파일명(다운로드 표시용) */
    @Column(name = "original_file_name", nullable = false, length = 512)
    private String originalFileName;

    /** MIME 타입 (예: application/pdf) */
    @Column(name = "content_type", nullable = false, length = 128)
    private String contentType;

    /** 바이트 크기 */
    @Column(name = "size_bytes", nullable = false)
    private Long size;

    /** 생성/수정/삭제(소프트) 관련 메타 */
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "deleted", nullable = false)
    private boolean deleted;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    /** 선택: 무결성/동기화 보조 정보 */
    @Column(name = "etag", length = 128)
    private String etag;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.contentType == null) this.contentType = "application/octet-stream";
        if (this.deleted == false && this.deletedAt != null) this.deletedAt = null;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    /** 편의 메서드 */
    public void markDeleted() {
        this.deleted = true;
        this.deletedAt = Instant.now();
    }
}

