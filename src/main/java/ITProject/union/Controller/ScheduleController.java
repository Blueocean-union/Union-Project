package ITProject.union.Controller;

import ITProject.union.Dto.ScheduleRequestDto;
import ITProject.union.Dto.ScheduleResponseDto;
import ITProject.union.Security.CustomUserDetails;
import ITProject.union.Service.ScheduleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/schedules")
@RequiredArgsConstructor
@Tag(name = "일정 API")
public class ScheduleController {

    private final ScheduleService scheduleService;

    @PostMapping
    @Operation(summary="일정 추가")
    public ResponseEntity<Long> createSchedule(@RequestBody ScheduleRequestDto request,
                                               @AuthenticationPrincipal CustomUserDetails user) {
        Long id = scheduleService.createSchedule(user.getId(), request);
        return ResponseEntity.ok(id);
    }

    @GetMapping
    @Operation(summary="전체 일정 조회")
    public ResponseEntity<List<ScheduleResponseDto>> getAllSchedules(@AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(scheduleService.getAllSchedules(user.getId()));
    }

    @GetMapping("/{id}")
    @Operation(summary="일정 자세히 보기")
    public ResponseEntity<ScheduleResponseDto> getScheduleDetail(@PathVariable Long id,
                                                                 @AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(scheduleService.getScheduleById(user.getId(), id));
    }
    @PutMapping("/{id}")
    @Operation(summary="일정 수정")
    public ResponseEntity<Void> updateSchedule(@PathVariable Long id,
                                               @RequestBody ScheduleRequestDto request,
                                               @AuthenticationPrincipal CustomUserDetails user) {
        scheduleService.updateSchedule(user.getId(), id, request);
        return ResponseEntity.ok().build();
    }
    @DeleteMapping("/{id}")
    @Operation(summary="일정 삭제")
    public ResponseEntity<Void> deleteSchedule(@PathVariable Long id,
                                               @AuthenticationPrincipal CustomUserDetails user) {
        scheduleService.deleteSchedule(user.getId(), id);
        return ResponseEntity.noContent().build(); // 204 No Content
    }
    @PatchMapping("/{id}/complete")
    @Operation(summary="일정 완료 선택")
    public ResponseEntity<Void> toggleComplete(@PathVariable Long id,
                                               @AuthenticationPrincipal CustomUserDetails user) {
        scheduleService.toggleScheduleCompletion(user.getId(), id);
        return ResponseEntity.ok().build();
    }
    @GetMapping("/month")
    @Operation(summary="한달 일정 조회")
    public ResponseEntity<List<ScheduleResponseDto>> getSchedulesByMonth(
            @RequestParam("year") int year,
            @RequestParam("month") int month,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return ResponseEntity.ok(scheduleService.getSchedulesByMonth(user.getId(), year, month));
    }
    @GetMapping("/today")
    @Operation(summary="오늘 일정 조회")
    public ResponseEntity<List<ScheduleResponseDto>> getTodaySchedules(
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return ResponseEntity.ok(scheduleService.getTodaySchedules(user.getId()));
    }

}

