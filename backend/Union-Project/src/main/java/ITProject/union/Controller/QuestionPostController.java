package ITProject.union.Controller;

import ITProject.union.Dto.QuestionPostRequestDto;
import ITProject.union.Dto.QuestionPostResponseDto;
import ITProject.union.Security.CustomUserDetails;
import ITProject.union.Service.QuestionPostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@Tag(name = "질문방 API")
public class QuestionPostController {

    private final QuestionPostService questionPostService;

    // 게시글 등록
    @PostMapping
    @Operation(summary="질문 등록")
    public ResponseEntity<Long> createPost(@RequestBody QuestionPostRequestDto request,
                                           @AuthenticationPrincipal CustomUserDetails user) {
        Long postId = questionPostService.createPost(user.getId(), request);
        return ResponseEntity.ok(postId);
    }

    // 카테고리별 게시글 목록 조회
    @GetMapping
    @Operation(summary="질문 목록 조회")
    public ResponseEntity<List<QuestionPostResponseDto>> getPostsByCategory(
            @RequestParam("categoryId") Long categoryId) {
        return ResponseEntity.ok(questionPostService.getPostsByCategory(categoryId));
    }

    // 게시글 상세 조회
    @GetMapping("/{id}")
    @Operation(summary="질문 상세 조회")
    public ResponseEntity<QuestionPostResponseDto> getPost(@PathVariable Long id) {
        return ResponseEntity.ok(questionPostService.getPostById(id));
    }

    // 게시글 수정
    @PutMapping("/{id}")
    @Operation(summary="질문 수정")
    public ResponseEntity<Void> updatePost(@PathVariable Long id,
                                           @RequestBody QuestionPostRequestDto request,
                                           @AuthenticationPrincipal CustomUserDetails user) {
        questionPostService.updatePost(user.getId(), id, request);
        return ResponseEntity.ok().build();
    }

    // 게시글 삭제
    @DeleteMapping("/{id}")
    @Operation(summary="질문 삭제")
    public ResponseEntity<Void> deletePost(@PathVariable Long id,
                                           @AuthenticationPrincipal CustomUserDetails user) {
        questionPostService.deletePost(user.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
