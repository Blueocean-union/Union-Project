package ITProject.union.Mapper;

import ITProject.union.Dto.ScheduleResponseDto;
import ITProject.union.Entity.Schedule;

public class ScheduleMapper {

    public static ScheduleResponseDto toDto(Schedule s) {
        return new ScheduleResponseDto(
                s.getId(),
                s.getTitle(),
                s.getCategory(),
                s.getStartDate(),
                s.getEndDate(),
                s.getDescription(),
                s.getIsCompleted(),
                s.getCreatedAt()
        );
    }

    // 필요하면 toEntity도 구현 가능
}
