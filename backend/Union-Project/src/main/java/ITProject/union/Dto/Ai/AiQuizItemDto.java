package ITProject.union.Dto.Ai;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class AiQuizItemDto {

    private Long id;                 // 저장 후 응답 시 포함 가능
    private Long batchId;

    private String question;
    private String difficultyRaw;    // 예: "3/5"
    private Integer difficultyLevel; // 1~5 (파싱 실패 시 null)

    private String option1;
    private String option2;
    private String option3;
    private String option4;

    private String answerExplanation;
}
