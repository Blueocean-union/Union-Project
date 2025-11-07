package ITProject.union.Controller;

import ITProject.union.Dto.CommentRequestDto;
import ITProject.union.Dto.CommentResponseDto;
import ITProject.union.Security.CustomUserDetails;
import ITProject.union.Service.CommentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
@Tag(name = "답변 API")
public class CommentController {

    private final CommentService commentService;

    @Operation(summary="답변 등록")
    @PostMapping
    public ResponseEntity<Long> createComment(@RequestParam("postId") Long postId,
                                              @RequestBody CommentRequestDto request,
                                              @AuthenticationPrincipal CustomUserDetails user) {
        Long commentId = commentService.createComment(user.getId(), postId, request);
        return ResponseEntity.ok(commentId);
    }

    @Operation(summary="답변 조회")
    @GetMapping
    public ResponseEntity<List<CommentResponseDto>> getComments(@RequestParam("postId") Long postId) {
        return ResponseEntity.ok(commentService.getCommentsByPost(postId));
    }

    @Operation(summary="답변 수정")
    @PutMapping("/{id}")
    public ResponseEntity<Void> updateComment(@PathVariable Long id,
                                              @RequestBody CommentRequestDto request,
                                              @AuthenticationPrgit check-ignore -v package-lock.json
                                                          incipal CustomUserDetails user) {
        commentService.updateComment(user.getId(), id, request);
        return ResponseEntity.ok().build();
    }

    @Operation(summary="답변 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id,
                                              @AuthenticationPrincipal CustomUserDetails user) {
        commentService.deleteComment(user.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
