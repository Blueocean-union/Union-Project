package ITProject.union.Dto;

import java.time.LocalDateTime;
import java.util.List;

public record AnnotationGetResponse(
        List<Object> annotations,
        Integer version,
        LocalDateTime updatedAt
) {}
