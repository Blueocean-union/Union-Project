package ITProject.union.Repository;

import ITProject.union.Entity.SubjectReviewProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SubjectReviewProgressRepository extends JpaRepository<SubjectReviewProgress, Long> {

    boolean existsByUser_IdAndSubject_Id(Long userId, Long subjectId);

    Optional<SubjectReviewProgress> findByUser_IdAndSubject_Id(Long userId, Long subjectId);

    List<SubjectReviewProgress> findAllByUser_Id(Long userId);
}
