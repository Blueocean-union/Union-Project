package ITProject.union.Entity;

import com.fasterxml.jackson.annotation.JsonRawValue;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "pdf_annotations",
        uniqueConstraints = @UniqueConstraint(columnNames = {"file_id"})
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class PdfAnnotation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 기존 파일 엔티티 명칭에 맞춰 변경 (예: FileEntity, StoredFile 등)
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "file_id", nullable = false)
    private FileItem file;

    // 전체 필기 JSON 스냅샷 (프론트의 annotations 배열 그대로 저장)
    // MySQL 8.x: JSON 타입 권장. 호환성 필요 시 LONGTEXT 사용.
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "data", columnDefinition = "json", nullable = false)
    @JsonRawValue
    private String data;

    // 클라이언트에게 알려주는 논리버전 (저장시 +1)
    @Column(name = "version", nullable = false)
    private Integer version;

    @Version
    private Long entityVersion; // 낙관적 락 (동시성 보호용)

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
