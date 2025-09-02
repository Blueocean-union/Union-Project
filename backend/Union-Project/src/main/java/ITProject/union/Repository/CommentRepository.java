package ITProject.union.Repository;

import ITProject.union.Entity.Comment;
import ITProject.union.Entity.QuestionPost;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByQuestionPostOrderByCreatedAtAsc(QuestionPost questionPost);
}
