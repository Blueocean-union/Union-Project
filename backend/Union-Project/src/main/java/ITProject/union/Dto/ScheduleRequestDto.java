package ITProject.union.Dto;

import java.time.LocalDate;

public record ScheduleRequestDto(
        String title,
        String category,
        LocalDate startDate,
        LocalDate endDate,
        String description
) {}

