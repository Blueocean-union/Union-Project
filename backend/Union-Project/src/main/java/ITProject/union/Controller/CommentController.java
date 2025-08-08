package ITProject.union.Controller;

import ITProject.union.Dto.CommentRequestDto;
import ITProject.union.Dto.CommentResponseDto;
import ITProject.union.Security.CustomUserDetails;
import ITProject.union.Service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    // 댓글 등록 (POST /api/comments?postId=3)
    @PostMapping
    public ResponseEntity<Long> createComment(@RequestParam("postId") Long postId,
                                              @RequestBody CommentRequestDto request,
                                              @AuthenticationPrincipal CustomUserDetails user) {
        Long commentId = commentService.createComment(user.getId(), postId, request);
        return ResponseEntity.ok(commentId);
    }

    // 게시글 댓글 목록 조회
    @GetMapping
    public ResponseEntity<List<CommentResponseDto>> getComments(@RequestParam("postId") Long postId) {
        return ResponseEntity.ok(commentService.getCommentsByPost(postId));
    }

    // 댓글 수정
    @PutMapping("/{id}")
    public ResponseEntity<Void> updateComment(@PathVariable Long id,
                                              @RequestBody CommentRequestDto request,
                                              @AuthenticationPrincipal CustomUserDetails user) {
        commentService.updateComment(user.getId(), id, request);
        return ResponseEntity.ok().build();
    }

    // 댓글 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id,
                                              @AuthenticationPrincipal CustomUserDetails user) {
        commentService.deleteComment(user.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
