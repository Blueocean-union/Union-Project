package ITProject.union.Mapper.Ai;

import ITProject.union.Dto.Ai.PdfSummaryResponse;
import ITProject.union.Entity.Ai.PdfSummary;
import org.springframework.stereotype.Component;

@Component
public class PdfSummaryMapper {

    public PdfSummaryResponse toDto(PdfSummary entity) {
        return PdfSummaryResponse.builder()
                .id(entity.getId())
                .originalFileName(entity.getOriginalFileName())
                .summary(entity.getSummary())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
