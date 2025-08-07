package ITProject.union.Dto.Ai;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class PdfSummaryResponse {
    private Long id;
    private String originalFileName;
    private String summary;
    private LocalDateTime createdAt;
}
