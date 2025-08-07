package ITProject.union.Dto;

import ITProject.union.Entity.Grade;

import java.time.LocalDateTime;

public record UserResponseDto(
        Long id,
        String email,
        String name,
        Grade grade,
        String major,
        String university,
        LocalDateTime createdAt,
        LocalDateTime lastLoginAt
) {}
