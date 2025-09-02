package ITProject.union.Repository.Ai;

import ITProject.union.Entity.Ai.AiQuizBatch;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AiQuizBatchRepository extends JpaRepository<AiQuizBatch, Long> {

    // 필요 시: 최근 배치 조회, 모델별 필터 등 메서드 확장 가능
}
