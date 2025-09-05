package ITProject.union.Service;

import ITProject.union.Dto.QuestionPostRequestDto;
import ITProject.union.Dto.QuestionPostResponseDto;
import ITProject.union.Entity.Category;
import ITProject.union.Entity.QuestionPost;
import ITProject.union.Entity.User;
import ITProject.union.Mapper.QuestionPostMapper;
import ITProject.union.Repository.CategoryRepository;
import ITProject.union.Repository.QuestionPostRepository;
import ITProject.union.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class QuestionPostService {

    private final QuestionPostRepository questionPostRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    @Transactional
    public Long createPost(Long userId, QuestionPostRequestDto request) {
        User user = getUser(userId);
        Category category = getCategory(request.categoryId());

        QuestionPost post = QuestionPostMapper.toEntity(request, user, category);
        questionPostRepository.save(post);

        return post.getId();
    }

    @Transactional(readOnly = true)
    public List<QuestionPostResponseDto> getPostsByCategory(Long categoryId) {
        Category category = getCategory(categoryId);

        return questionPostRepository.findByCategoryOrderByCreatedAtDesc(category).stream()
                .map(QuestionPostMapper::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public QuestionPostResponseDto getPostById(Long postId) {
        QuestionPost post = questionPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("해당 게시글을 찾을 수 없습니다."));
        return QuestionPostMapper.toDto(post);
    }

    @Transactional
    public void updatePost(Long userId, Long postId, QuestionPostRequestDto request) {
        QuestionPost post = questionPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("게시글이 존재하지 않습니다."));

        if (!post.getUser().getId().equals(userId)) {
            throw new RuntimeException("수정 권한이 없습니다.");
        }

        post.setTitle(request.title());
        post.setContent(request.content());
        post.setUpdatedAt(java.time.LocalDateTime.now());

        if (!post.getCategory().getId().equals(request.categoryId())) {
            Category newCategory = getCategory(request.categoryId());
            post.setCategory(newCategory);
        }
    }

    @Transactional
    public void deletePost(Long userId, Long postId) {
        QuestionPost post = questionPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("게시글이 존재하지 않습니다."));

        if (!post.getUser().getId().equals(userId)) {
            throw new RuntimeException("삭제 권한이 없습니다.");
        }

        questionPostRepository.delete(post);
    }

    // 유틸
    private User getUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("사용자 없음"));
    }

    private Category getCategory(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("카테고리 없음"));
    }
}
