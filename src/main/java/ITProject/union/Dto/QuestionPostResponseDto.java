package ITProject.union.Dto;

import java.time.LocalDateTime;

public record QuestionPostResponseDto(
        Long id,
        String title,
        String content,
        String categoryName,
        String writerName,
        LocalDateTime createdAt
) {}
