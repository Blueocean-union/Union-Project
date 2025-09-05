package ITProject.union.Entity;

import ITProject.union.Entity.User;
import ITProject.union.Entity.Subject;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Entity
@Table(
        name = "subject_review_progress",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_user_subject",
                        columnNames = {"user_id", "subject_id"}
                )
        },
        indexes = {
                @Index(name = "idx_subject_review_user", columnList = "user_id"),
                @Index(name = "idx_subject_review_subject", columnList = "subject_id")
        }
)
@EntityListeners(AuditingEntityListener.class)
public class SubjectReviewProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 진행 주체: 사용자 */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_review_user"))
    private User user;

    /** 대상: 과목 */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_review_subject"))
    private Subject subject;

    /** 목표 회독 수 (예: 3회, 5회…) */
    @Min(1)
    @Column(name = "target_count", nullable = false)
    private int targetCount;

    /** 현재 회독 수 (버튼 누를 때마다 +1) */
    @Min(0)
    @Column(name = "current_count", nullable = false)
    private int currentCount;

    /** 마지막으로 회독 카운트를 올린 시각 */
    @Column(name = "last_reviewed_at")
    private LocalDateTime lastReviewedAt;

    /** 목표 달성 시각 (currentCount >= targetCount 가 되는 순간 기록) */
    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    /** 생성/수정 감사필드 */
    @CreatedDate
    @Column(name = "created_at", updatable = false, nullable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /** 도메인 메서드들 */

    /**
     * 회독 +1 (사용자 버튼 클릭 시 호출)
     * - currentCount를 1 올리고 lastReviewedAt 갱신
     * - 목표 달성 시 completedAt 최초 1회 기록
     * - 목표를 넘더라도 비즈니스 정책상 더 올리게 할지 막을지는 선택 가능
     *   기본은 '넘치게 허용'하지만, 막고 싶다면 조건으로 return만 하도록 변경 가능
     */
    public void increment() {
        // 만약 목표 초과를 막고 싶으면 주석 해제:
        // if (isCompleted()) return;

        this.currentCount += 1;
        this.lastReviewedAt = LocalDateTime.now();

        if (this.completedAt == null && isCompleted()) {
            this.completedAt = this.lastReviewedAt;
        }
    }

    /** 목표 달성 여부 */
    public boolean isCompleted() {
        return this.currentCount >= this.targetCount;
    }

    /** 목표 회독 변경 (예: 사용자가 목표를 재설정) */
    public void changeTarget(int newTargetCount) {
        if (newTargetCount < 1) {
            throw new IllegalArgumentException("목표 회독 수는 1 이상이어야 합니다.");
        }
        this.targetCount = newTargetCount;

        // 목표를 낮춰서 이미 달성 상태가 되었다면 완료시각 보정
        if (this.completedAt == null && isCompleted()) {
            this.completedAt = LocalDateTime.now();
        }
        // 목표를 올려서 미달성이 되었다면 완료시각 제거(정책 선택 사항)
        if (!isCompleted()) {
            this.completedAt = null;
        }
    }

    /** 진행도 초기화(필요 시) */
    public void resetProgress() {
        this.currentCount = 0;
        this.lastReviewedAt = null;
        this.completedAt = null;
    }
}
