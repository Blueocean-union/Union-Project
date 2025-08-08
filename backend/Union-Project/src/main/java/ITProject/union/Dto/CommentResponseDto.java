package ITProject.union.Dto;

import java.time.LocalDateTime;

public record CommentResponseDto(
        Long id,
        String content,
        String writerName,
        LocalDateTime createdAt
) {}
