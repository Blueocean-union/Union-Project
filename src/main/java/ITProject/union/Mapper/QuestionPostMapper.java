package ITProject.union.Mapper;

import ITProject.union.Dto.QuestionPostRequestDto;
import ITProject.union.Dto.QuestionPostResponseDto;
import ITProject.union.Entity.Category;
import ITProject.union.Entity.QuestionPost;
import ITProject.union.Entity.User;

import java.time.LocalDateTime;

public class QuestionPostMapper {

    // 요청 DTO → Entity 변환 (등록용)
    public static QuestionPost toEntity(QuestionPostRequestDto dto, User user, Category category) {
        return QuestionPost.builder()
                .title(dto.title())
                .content(dto.content())
                .user(user)
                .category(category)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    // Entity → 응답 DTO 변환 (조회용)
    public static QuestionPostResponseDto toDto(QuestionPost post) {
        return new QuestionPostResponseDto(
                post.getId(),
                post.getTitle(),
                post.getContent(),
                post.getCategory().getName(),
                post.getUser().getName(), // 또는 getNickname()
                post.getCreatedAt()
        );
    }
}
