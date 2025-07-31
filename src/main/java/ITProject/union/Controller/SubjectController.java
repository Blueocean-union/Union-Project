package ITProject.union.Controller;

import ITProject.union.Dto.SubjectRequestDto;
import ITProject.union.Dto.SubjectResponseDto;
import ITProject.union.Security.CustomUserDetails;
import ITProject.union.Service.SubjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subjects")
@RequiredArgsConstructor
@Tag(name = "과목 API")
public class SubjectController {

    private final SubjectService subjectService;

    // 과목 등록
    @PostMapping
    @Operation(summary="과목 추가")
    public ResponseEntity<Long> createSubject(@RequestBody SubjectRequestDto request,
                                              @AuthenticationPrincipal CustomUserDetails user) {
        Long id = subjectService.createSubject(user.getId(), request);
        return ResponseEntity.ok(id);
    }

    // 전체 과목 조회
    @GetMapping
    @Operation(summary="전체 과목 조회")
    public ResponseEntity<List<SubjectResponseDto>> getSubjects(@AuthenticationPrincipal CustomUserDetails user) {
        System.out.println("👉 로그인한 사용자 ID: " + user.getId());
        return ResponseEntity.ok(subjectService.getSubjects(user.getId()));
    }

    // 과목 수정
    @PutMapping("/{id}")
    @Operation(summary="과목 수정")
    public ResponseEntity<Void> updateSubject(@PathVariable Long id,
                                              @RequestBody SubjectRequestDto request,
                                              @AuthenticationPrincipal CustomUserDetails user) {
        subjectService.updateSubject(user.getId(), id, request);
        return ResponseEntity.ok().build();
    }

    // 과목 삭제
    @DeleteMapping("/{id}")
    @Operation(summary="과목 삭제")
    public ResponseEntity<Void> deleteSubject(@PathVariable Long id,
                                              @AuthenticationPrincipal CustomUserDetails user) {
        subjectService.deleteSubject(user.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
