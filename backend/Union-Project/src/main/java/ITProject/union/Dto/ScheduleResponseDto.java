package ITProject.union.Dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record ScheduleResponseDto(
        Long id,
        String title,
        String category,
        LocalDate startDate,
        LocalDate endDate,
        String description,
        Boolean isCompleted,
        LocalDateTime createdAt

) {}

