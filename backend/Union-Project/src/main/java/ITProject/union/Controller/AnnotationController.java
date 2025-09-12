package ITProject.union.Controller;

import ITProject.union.Dto.AnnotationGetResponse;
import ITProject.union.Dto.AnnotationSaveRequest;
import ITProject.union.Service.AnnotationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/annotations")
@RequiredArgsConstructor
@Tag(name = "PDF Annotation API")
public class AnnotationController {

    private final AnnotationService annotationService;

    @Operation(summary = "필기 조회")
    @GetMapping("/{fileId}")
    public ResponseEntity<AnnotationGetResponse> get(@PathVariable Long fileId) {
        return ResponseEntity.ok(annotationService.getAnnotations(fileId));
    }

    @Operation(summary = "필기 저장(전체 스냅샷 업서트)")
    @PostMapping("/{fileId}")
    public ResponseEntity<AnnotationGetResponse> save(
            @PathVariable Long fileId,
            @RequestBody AnnotationSaveRequest request
            // @AuthenticationPrincipal CustomUser user
    ) {
        Long currentUserId = null; // 실제 인증 연동 시 user.getId()
        return ResponseEntity.ok(annotationService.saveAnnotations(fileId, request, currentUserId));
    }
}
