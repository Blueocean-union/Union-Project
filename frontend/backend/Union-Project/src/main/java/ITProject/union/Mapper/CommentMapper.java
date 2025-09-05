package ITProject.union.Mapper;

import ITProject.union.Dto.CommentRequestDto;
import ITProject.union.Dto.CommentResponseDto;
import ITProject.union.Entity.Comment;
import ITProject.union.Entity.QuestionPost;
import ITProject.union.Entity.User;

import java.time.LocalDateTime;

public class CommentMapper {

    // 요청 DTO → Entity 변환 (등록용)
    public static Comment toEntity(CommentRequestDto dto, User user, QuestionPost post) {
        return Comment.builder()
                .content(dto.content())
                .user(user)
                .questionPost(post)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    // Entity → 응답 DTO 변환 (조회용)
    public static CommentResponseDto toDto(Comment comment) {
        return new CommentResponseDto(
                comment.getId(),
                comment.getContent(),
                comment.getUser().getName(),
                comment.getCreatedAt()
        );
    }
}
