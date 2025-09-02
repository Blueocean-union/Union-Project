package ITProject.union.Repository.Ai;

import ITProject.union.Entity.Ai.AudioTranscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AudioTranscriptionRepository extends JpaRepository<AudioTranscription, Long> {
    Optional<AudioTranscription> findByRid(String rid);
    boolean existsByRid(String rid);
}
