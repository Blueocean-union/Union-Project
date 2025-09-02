package ITProject.union.Entity.Ai;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "ai_quiz_batch",
        indexes = {
                @Index(name = "idx_ai_quiz_batch_created_at", columnList = "created_at")
        })
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class AiQuizBatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 요청 시각 */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /** 사용한 모델명 (ex. gpt-4o-mini) */
    @Column(name = "model", length = 100)
    private String model;

    /** 클라이언트 IP 등 요청자 식별(선택) */
    @Column(name = "request_ip", length = 64)
    private String requestIp;

    /** 원본 파일명들(콤마 연결 또는 JSON 문자열) */
    @Column(name = "source_files", columnDefinition = "LONGTEXT")
    private String sourceFiles;

    /** FastAPI 응답에서 커스텀 키 규격 */
    @Column(name = "list_key", length = 64)
    private String listKey;

    @Column(name = "question_key", length = 64)
    private String questionKey;

    @Column(name = "difficulty_key", length = 64)
    private String difficultyKey;

    @Column(name = "option1_key", length = 64)
    private String option1Key;

    @Column(name = "option2_key", length = 64)
    private String option2Key;

    @Column(name = "option3_key", length = 64)
    private String option3Key;

    @Column(name = "option4_key", length = 64)
    private String option4Key;

    @Column(name = "answer_explanation_key", length = 64)
    private String answerExplanationKey;

    /** 생성된 총 문항 수(사후 업데이트) */
    @Column(name = "total_items")
    private Integer totalItems;
}
