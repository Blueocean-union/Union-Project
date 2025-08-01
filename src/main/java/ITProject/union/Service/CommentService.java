package ITProject.union.Service;

import ITProject.union.Dto.CommentRequestDto;
import ITProject.union.Dto.CommentResponseDto;
import ITProject.union.Entity.Comment;
import ITProject.union.Entity.QuestionPost;
import ITProject.union.Entity.User;
import ITProject.union.Mapper.CommentMapper;
import ITProject.union.Repository.CommentRepository;
import ITProject.union.Repository.QuestionPostRepository;
import ITProject.union.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final QuestionPostRepository postRepository;
    private final UserRepository userRepository;

    @Transactional
    public Long createComment(Long userId, Long postId, CommentRequestDto request) {
        User user = getUser(userId);
        QuestionPost post = getPost(postId);

        Comment comment = CommentMapper.toEntity(request, user, post);
        commentRepository.save(comment);
        return comment.getId();
    }

    @Transactional(readOnly = true)
    public List<CommentResponseDto> getCommentsByPost(Long postId) {
        QuestionPost post = getPost(postId);

        return commentRepository.findByQuestionPostOrderByCreatedAtAsc(post).stream()
                .map(CommentMapper::toDto)
                .toList();
    }

    @Transactional
    public void updateComment(Long userId, Long commentId, CommentRequestDto request) {
        Comment comment = getComment(commentId);

        if (!comment.getUser().getId().equals(userId)) {
            throw new RuntimeException("수정 권한이 없습니다.");
        }

        comment.setContent(request.content());
        comment.setUpdatedAt(LocalDateTime.now());
    }

    @Transactional
    public void deleteComment(Long userId, Long commentId) {
        Comment comment = getComment(commentId);

        if (!comment.getUser().getId().equals(userId)) {
            throw new RuntimeException("삭제 권한이 없습니다.");
        }

        commentRepository.delete(comment);
    }

    // 유틸
    private User getUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("사용자 없음"));
    }

    private QuestionPost getPost(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("게시글 없음"));
    }

    private Comment getComment(Long id) {
        return commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("댓글 없음"));
    }
}
