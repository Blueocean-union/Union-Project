package ITProject.union.Repository;

import ITProject.union.Entity.PdfAnnotation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PdfAnnotationRepository extends JpaRepository<PdfAnnotation, Long> {
    Optional<PdfAnnotation> findByFile_Id(Long fileId);
    boolean existsByFile_Id(Long fileId);
}
