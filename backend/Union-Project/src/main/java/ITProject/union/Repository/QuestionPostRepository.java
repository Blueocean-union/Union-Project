package ITProject.union.Repository;

import ITProject.union.Entity.Category;
import ITProject.union.Entity.QuestionPost;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestionPostRepository extends JpaRepository<QuestionPost, Long> {
    List<QuestionPost> findByCategoryOrderByCreatedAtDesc(Category category);
}
