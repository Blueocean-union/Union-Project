package ITProject.union.Service;

import ITProject.union.Dto.ScheduleRequestDto;
import ITProject.union.Dto.ScheduleResponseDto;
import ITProject.union.Entity.Schedule;
import ITProject.union.Entity.User;
import ITProject.union.Mapper.ScheduleMapper;
import ITProject.union.Repository.ScheduleRepository;
import ITProject.union.Repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final UserRepository userRepository;

    public Long createSchedule(Long userId, ScheduleRequestDto request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자 없음"));

        Schedule schedule = Schedule.builder()
                .user(user)
                .title(request.title())
                .category(request.category())
                .startDate(request.startDate())
                .endDate(request.endDate())
                .description(request.description())
                .createdAt(LocalDateTime.now())
                .build();

        scheduleRepository.save(schedule);
        return schedule.getId();
    }

    public List<ScheduleResponseDto> getAllSchedules(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자 없음"));

        return scheduleRepository.findByUserOrderByStartDateAsc(user).stream()
                .map(ScheduleMapper::toDto)
                .toList();
    }
    public ScheduleResponseDto getScheduleById(Long userId, Long scheduleId) {
        Schedule schedule = scheduleRepository.findByIdAndUserId(scheduleId, userId)
                .orElseThrow(() -> new RuntimeException("해당 일정을 찾을 수 없습니다."));

        return ScheduleMapper.toDto(schedule); // or 직접 DTO 생성
    }
    @Transactional
    public void updateSchedule(Long userId, Long scheduleId, ScheduleRequestDto request) {
        Schedule schedule = scheduleRepository.findByIdAndUserId(scheduleId, userId)
                .orElseThrow(() -> new RuntimeException("해당 일정이 없거나 권한이 없습니다."));

        schedule.setTitle(request.title());
        schedule.setCategory(request.category());
        schedule.setStartDate(request.startDate());
        schedule.setEndDate(request.endDate());
        schedule.setDescription(request.description());
    }
    @Transactional
    public void deleteSchedule(Long userId, Long scheduleId) {
        Schedule schedule = scheduleRepository.findByIdAndUserId(scheduleId, userId)
                .orElseThrow(() -> new RuntimeException("해당 일정을 찾을 수 없거나 권한이 없습니다."));

        scheduleRepository.delete(schedule);
    }

    @Transactional
    public void toggleScheduleCompletion(Long userId, Long scheduleId) {
        Schedule schedule = scheduleRepository.findByIdAndUserId(scheduleId, userId)
                .orElseThrow(() -> new RuntimeException("해당 일정이 없거나 권한이 없습니다."));

        schedule.setIsCompleted(!Boolean.TRUE.equals(schedule.getIsCompleted()));
    }
    public List<ScheduleResponseDto> getSchedulesByMonth(Long userId, int year, int month) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자 없음"));

        LocalDate startOfMonth = LocalDate.of(year, month, 1);
        LocalDate endOfMonth = startOfMonth.withDayOfMonth(startOfMonth.lengthOfMonth());

        List<Schedule> schedules = scheduleRepository.findSchedulesByMonth(user, startOfMonth, endOfMonth);

        return schedules.stream()
                .map(ScheduleMapper::toDto)
                .toList();
    }
    public List<ScheduleResponseDto> getTodaySchedules(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자 없음"));

        LocalDate today = LocalDate.now();

        List<Schedule> schedules = scheduleRepository.findTodaySchedules(user, today);

        return schedules.stream()
                .map(ScheduleMapper::toDto)
                .toList();
    }


}
