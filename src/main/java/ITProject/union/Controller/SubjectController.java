package ITProject.union.Controller;

import ITProject.union.Dto.SubjectRequestDto;
import ITProject.union.Dto.SubjectResponseDto;
import ITProject.union.Security.CustomUserDetails;
import ITProject.union.Service.SubjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subjects")
@RequiredArgsConstructor
public class SubjectController {

    private final SubjectService subjectService;

    // 과목 등록
    @PostMapping
    public ResponseEntity<Long> createSubject(@RequestBody SubjectRequestDto request,
                                              @AuthenticationPrincipal CustomUserDetails user) {
        Long id = subjectService.createSubject(user.getId(), request);
        return ResponseEntity.ok(id);
    }

    // 전체 과목 조회
    @GetMapping
    public ResponseEntity<List<SubjectResponseDto>> getSubjects(@AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(subjectService.getSubjects(user.getId()));
    }

    // 과목 수정
    @PutMapping("/{id}")
    public ResponseEntity<Void> updateSubject(@PathVariable Long id,
                                              @RequestBody SubjectRequestDto request,
                                              @AuthenticationPrincipal CustomUserDetails user) {
        subjectService.updateSubject(user.getId(), id, request);
        return ResponseEntity.ok().build();
    }

    // 과목 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubject(@PathVariable Long id,
                                              @AuthenticationPrincipal CustomUserDetails user) {
        subjectService.deleteSubject(user.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
