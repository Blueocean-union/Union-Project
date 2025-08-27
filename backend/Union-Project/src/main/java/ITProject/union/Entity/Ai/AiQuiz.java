package ITProject.union.Entity.Ai;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_quiz",
        uniqueConstraints = {
                // 동일 배치 내 중복 문제 방지 (질문+보기 해시)
                @UniqueConstraint(name = "uk_ai_quiz_batch_hash", columnNames = {"batch_id", "content_hash"})
        },
        indexes = {
                @Index(name = "idx_ai_quiz_batch_id", columnList = "batch_id"),
                @Index(name = "idx_ai_quiz_created_at", columnList = "created_at"),
                @Index(name = "idx_ai_quiz_difficulty_level", columnList = "difficulty_level")
        })
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class AiQuiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 어떤 요청(배치)로 생성되었는지 */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "batch_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_ai_quiz_batch"))
    private AiQuizBatch batch;

    /** 질문 본문 */
    @Column(name = "question", nullable = false, columnDefinition = "LONGTEXT")
    private String question;

    /** 난이도 원문 (예: "3/5") */
    @Column(name = "difficulty_raw", length = 16, nullable = false)
    private String difficultyRaw;

    /** 난이도 정규화(1~5), 파싱 실패 시 null */
    @Column(name = "difficulty_level")
    private Integer difficultyLevel;

    /** 보기 1~4 */
    @Column(name = "option1", nullable = false, columnDefinition = "LONGTEXT")
    private String option1;

    @Column(name = "option2", nullable = false, columnDefinition = "LONGTEXT")
    private String option2;

    @Column(name = "option3", nullable = false, columnDefinition = "LONGTEXT")
    private String option3;

    @Column(name = "option4", nullable = false, columnDefinition = "LONGTEXT")
    private String option4;

    /** 정답 + 해설 */
    @Column(name = "answer_explanation", nullable = false, columnDefinition = "LONGTEXT")
    private String answerExplanation;

    /** 중복 방지를 위한 해시 (질문+보기 기준) */
    @Column(name = "content_hash", length = 64, nullable = false)
    private String contentHash;

    /** 생성 시각 */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /** 저장 전 난이도 파싱 + 해시 생성 */
    @PrePersist
    @PreUpdate
    private void onPersist() {
        this.difficultyLevel = parseDifficultyToLevel(this.difficultyRaw);
        this.contentHash = computeHash();
    }

    /** "3/5" → 3 */
    private Integer parseDifficultyToLevel(String raw) {
        if (raw == null) return null;
        // "3/5", " 2 / 5 " 등 유연하게 대응
        String digits = raw.trim().split("/")[0].replaceAll("[^0-9]", "");
        if (digits.isEmpty()) return null;
        try {
            int v = Integer.parseInt(digits);
            if (v < 1 || v > 5) return null;
            return v;
        } catch (NumberFormatException e) {
            return null;
        }
    }

    /** 질문+보기로 고유 해시 생성(SHA-256, 64 hex) */
    private String computeHash() {
        String base = String.join("\n",
                safe(question), safe(option1), safe(option2), safe(option3), safe(option4)
        );
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(base.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(digest.length * 2);
            for (byte b : digest) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            // 이론상 거의 없음. 혹시 모를 예외 시 길이 제한 내로 fallback
            return Integer.toHexString(base.hashCode());
        }
    }

    private String safe(String s) {
        return s == null ? "" : s.trim();
    }
}
