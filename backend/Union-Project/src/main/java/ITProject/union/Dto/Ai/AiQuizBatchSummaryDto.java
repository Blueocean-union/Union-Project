package ITProject.union.Dto.Ai;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class AiQuizBatchSummaryDto {

    private Long batchId;
    private LocalDateTime createdAt;

    private String model;
    private String requestIp;

    /** 업로드한 원본 파일명들 */
    private List<String> sourceFilenames;

    /** 커스텀 키 규격 (응답 재직렬화에도 사용) */
    private PdfQuizRequestKeysDto keys;

    private Integer totalItems;
}
