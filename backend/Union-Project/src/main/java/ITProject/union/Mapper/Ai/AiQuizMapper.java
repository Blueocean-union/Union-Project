package ITProject.union.Mapper.Ai;

import ITProject.union.Dto.Ai.*;
import ITProject.union.Entity.Ai.AiQuiz;
import ITProject.union.Entity.Ai.AiQuizBatch;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Component
public class AiQuizMapper {

    /* -------------------- AiQuiz <-> AiQuizItemDto -------------------- */

    public AiQuizItemDto toDto(AiQuiz e) {
        if (e == null) return null;
        return AiQuizItemDto.builder()
                .id(e.getId())
                .batchId(e.getBatch() != null ? e.getBatch().getId() : null)
                .question(e.getQuestion())
                .difficultyRaw(e.getDifficultyRaw())
                .difficultyLevel(e.getDifficultyLevel())
                .option1(e.getOption1())
                .option2(e.getOption2())
                .option3(e.getOption3())
                .option4(e.getOption4())
                .answerExplanation(e.getAnswerExplanation())
                .build();
    }

    public List<AiQuizItemDto> toDtoList(List<AiQuiz> entities) {
        if (entities == null) return List.of();
        return entities.stream().map(this::toDto).collect(Collectors.toList());
    }

    /** dto -> entity (연관 batch는 인자로 받는다) */
    public AiQuiz toEntity(AiQuizItemDto d, AiQuizBatch batch) {
        if (d == null) return null;
        return AiQuiz.builder()
                .batch(batch)
                .question(d.getQuestion())
                .difficultyRaw(d.getDifficultyRaw())
                .option1(d.getOption1())
                .option2(d.getOption2())
                .option3(d.getOption3())
                .option4(d.getOption4())
                .answerExplanation(d.getAnswerExplanation())
                // difficultyLevel, contentHash는 @PrePersist에서 계산
                .build();
    }

    /* -------------------- AiQuizBatch -> Summary DTO -------------------- */

    public AiQuizBatchSummaryDto toBatchSummaryDto(AiQuizBatch b) {
        if (b == null) return null;
        return AiQuizBatchSummaryDto.builder()
                .batchId(b.getId())
                .createdAt(b.getCreatedAt())
                .model(b.getModel())
                .requestIp(b.getRequestIp())
                .sourceFilenames(splitSourceFiles(b.getSourceFiles()))
                .keys(PdfQuizRequestKeysDto.builder()
                        .listKey(nullToDefault(b.getListKey(), "quizzes"))
                        .questionKey(nullToDefault(b.getQuestionKey(), "question"))
                        .difficultyKey(nullToDefault(b.getDifficultyKey(), "difficulty"))
                        .option1Key(nullToDefault(b.getOption1Key(), "option1"))
                        .option2Key(nullToDefault(b.getOption2Key(), "option2"))
                        .option3Key(nullToDefault(b.getOption3Key(), "option3"))
                        .option4Key(nullToDefault(b.getOption4Key(), "option4"))
                        .answerExplanationKey(nullToDefault(b.getAnswerExplanationKey(), "answer_explanation"))
                        .build())
                .totalItems(b.getTotalItems())
                .build();
    }

    private List<String> splitSourceFiles(String raw) {
        if (raw == null || raw.isBlank()) return List.of();
        // 콤마-구분 방식 가정. JSON 문자열이면 서비스에서 파싱 후 넣어줘도 됨.
        return Arrays.stream(raw.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    private String nullToDefault(String v, String def) {
        return (v == null || v.isBlank()) ? def : v;
    }

    /* -------------------- 동적 키 변환 (FastAPI 응답 형식 맞춤) -------------------- */

    /** 내부 표준 DTO → 동적 키 Map (컨트롤러/서비스에서 모아 리스트로 포장) */
    public Map<String, Object> toDynamicMap(AiQuizItemDto dto, PdfQuizRequestKeysDto k) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put(k.getQuestionKey(), dto.getQuestion());
        m.put(k.getDifficultyKey(), dto.getDifficultyRaw());
        m.put(k.getOption1Key(), dto.getOption1());
        m.put(k.getOption2Key(), dto.getOption2());
        m.put(k.getOption3Key(), dto.getOption3());
        m.put(k.getOption4Key(), dto.getOption4());
        m.put(k.getAnswerExplanationKey(), dto.getAnswerExplanation());
        return m;
    }

    /** 동적 리스트 응답 DTO 생성: { list_key : [ {...}, {...} ] }로 직렬화됨 */
    public AiQuizDynamicListResponseDto toDynamicListResponse(String listKey,
                                                              List<Map<String, Object>> items) {
        return AiQuizDynamicListResponseDto.builder()
                .listKey(listKey)
                .items(items)
                .build();
    }
}
