package ITProject.union.Controller;

import ITProject.union.Dto.SubjectReviewDto;
import ITProject.union.Service.SubjectReviewProgressService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/study/reviews")
@Tag(name = "회독 카운트 API")
public class SubjectReviewProgressController {

    private final SubjectReviewProgressService service;

    @Operation(summary = "진행 생성")
    @PostMapping
    public ResponseEntity<SubjectReviewDto.Response> create(@RequestBody SubjectReviewDto.CreateRequest req) {
        return ResponseEntity.ok(service.create(req));
    }

    @Operation(summary = "회독 +1 (버튼)")
    @PostMapping("/{userId}/{subjectId}/increment")
    public ResponseEntity<SubjectReviewDto.Response> increment(
            @PathVariable Long userId,
            @PathVariable Long subjectId
    ) {
        return ResponseEntity.ok(service.increment(userId, subjectId));
    }

    @Operation(summary = "목표 회독 변경")
    @PatchMapping("/{id}/target")
    public ResponseEntity<SubjectReviewDto.Response> changeTarget(
            @PathVariable Long id,
            @RequestBody SubjectReviewDto.ChangeTargetRequest req
    ) {
        return ResponseEntity.ok(service.changeTarget(id, req));
    }

    @Operation(summary = "진행도 초기화 (0으로)")
    @PostMapping("/{id}/reset")
    public ResponseEntity<SubjectReviewDto.Response> reset(@PathVariable Long id) {
        return ResponseEntity.ok(service.reset(id));
    }

    @Operation(summary = "사용자별 진행 목록")
    @GetMapping("/users/{userId}")
    public ResponseEntity<List<SubjectReviewDto.Response>> listByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(service.listByUser(userId));
    }
}
