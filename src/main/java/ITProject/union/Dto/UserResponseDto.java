package ITProject.union.Dto;

import java.time.LocalDateTime;

public record UserResponseDto(
        Long id,
        String email,
        String name,
        String grade,
        String major,
        String university,
        LocalDateTime createdAt,
        LocalDateTime lastLoginAt
) {}
