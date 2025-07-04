package ITProject.union.Repository;

import ITProject.union.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // 이메일로 사용자 조회 (로그인 및 중복 체크에 사용)
    Optional<User> findByEmail(String email);

    // 이메일 존재 여부 확인
    boolean existsByEmail(String email);
}

