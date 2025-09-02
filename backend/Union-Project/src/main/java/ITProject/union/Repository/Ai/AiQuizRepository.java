package ITProject.union.Repository.Ai;

import ITProject.union.Entity.Ai.AiQuiz;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AiQuizRepository extends JpaRepository<AiQuiz, Long>, JpaSpecificationExecutor<AiQuiz> {

    /* 배치 기준 조회 */
    List<AiQuiz> findByBatch_Id(Long batchId);
    Page<AiQuiz> findByBatch_Id(Long batchId, Pageable pageable);

    /* 중복 방지용 체크 (동일 배치에서 질문+보기 해시 중복 여부) */
    boolean existsByBatch_IdAndContentHash(Long batchId, String contentHash);

    /* 난이도 필터링 */
    Page<AiQuiz> findByBatch_IdAndDifficultyLevelBetween(Long batchId, Integer min, Integer max, Pageable pageable);

    /* 간단 키워드 검색 (LIKE) — MySQL 인덱스 고려하여 필요 시 FULLTEXT로 대체 */
    @Query("""
        SELECT q FROM AiQuiz q
        WHERE q.batch.id = :batchId
          AND (LOWER(q.question) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(q.answerExplanation) LIKE LOWER(CONCAT('%', :keyword, '%')))
        """)
    Page<AiQuiz> searchInBatch(@Param("batchId") Long batchId,
                               @Param("keyword") String keyword,
                               Pageable pageable);
}
