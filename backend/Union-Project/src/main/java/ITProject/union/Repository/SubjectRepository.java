package ITProject.union.Repository;

import ITProject.union.Entity.Subject;
import ITProject.union.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SubjectRepository extends JpaRepository<Subject, Long> {

    // 사용자별 전체 과목 목록 조회
    List<Subject> findByUserId(Long userId);
    // 사용자별 과목 이름 중복 확인 (등록 시 중복 방지용)
    boolean existsByUserAndName(User user, String name);

    // 사용자 소유의 특정 과목 ID로 조회 (수정/삭제/조회 시 권한 검증용)
    Optional<Subject> findByIdAndUser(Long id, User user);
}
