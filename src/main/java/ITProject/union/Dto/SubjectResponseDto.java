package ITProject.union.Dto;

import java.time.LocalDateTime;

public record SubjectResponseDto(
        Long id,
        String name,
        String color,
        Boolean isFavorite,
        LocalDateTime createdAt
) {}
