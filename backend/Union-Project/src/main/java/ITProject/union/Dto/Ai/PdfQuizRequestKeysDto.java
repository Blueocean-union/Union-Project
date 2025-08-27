package ITProject.union.Dto.Ai;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class PdfQuizRequestKeysDto {

    // 각 키는 공백 없이 영숫자/언더스코어만 허용 (원하면 정규식 완화 가능)
    private static final String KEY_REGEX = "^[A-Za-z0-9_]+$";
    private static final String MSG = "키 이름은 공백 없는 영숫자/언더스코어만 허용됩니다.";

    @JsonProperty("list_key")
    @NotBlank @Pattern(regexp = KEY_REGEX, message = MSG)
    private String listKey;

    @JsonProperty("question_key")
    @NotBlank @Pattern(regexp = KEY_REGEX, message = MSG)
    private String questionKey;

    @JsonProperty("difficulty_key")
    @NotBlank @Pattern(regexp = KEY_REGEX, message = MSG)
    private String difficultyKey;

    @JsonProperty("option1_key")
    @NotBlank @Pattern(regexp = KEY_REGEX, message = MSG)
    private String option1Key;

    @JsonProperty("option2_key")
    @NotBlank @Pattern(regexp = KEY_REGEX, message = MSG)
    private String option2Key;

    @JsonProperty("option3_key")
    @NotBlank @Pattern(regexp = KEY_REGEX, message = MSG)
    private String option3Key;

    @JsonProperty("option4_key")
    @NotBlank @Pattern(regexp = KEY_REGEX, message = MSG)
    private String option4Key;

    @JsonProperty("answer_explanation_key")
    @NotBlank @Pattern(regexp = KEY_REGEX, message = MSG)
    private String answerExplanationKey;

    /** 기본값 셋팅용 팩토리 */
    public static PdfQuizRequestKeysDto defaults() {
        return PdfQuizRequestKeysDto.builder()
                .listKey("quizzes")
                .questionKey("question")
                .difficultyKey("difficulty")
                .option1Key("option1")
                .option2Key("option2")
                .option3Key("option3")
                .option4Key("option4")
                .answerExplanationKey("answer_explanation")
                .build();
    }
}
