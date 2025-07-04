package ITProject.union.Security;

import ITProject.union.Entity.User;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

@Getter
public class CustomUserDetails implements UserDetails {

    private final User user;

    public CustomUserDetails(User user) {
        this.user = user;
    }

    // 사용자 권한 (단일 role 필드 사용 시)
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singleton(() -> "ROLE_" + user.getGrade()); // 예: ROLE_BASIC, ROLE_PRO
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getEmail(); // email이 로그인 ID
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // 계정 만료 여부 (true = 만료 아님)
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // 계정 잠금 여부 (true = 잠기지 않음)
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // 자격 증명 만료 여부
    }

    @Override
    public boolean isEnabled() {
        return true; // 계정 활성화 여부
    }

    // 사용자 ID 등 추가 필드 꺼내기
    public Long getId() {
        return user.getId();
    }

    public String getGrade() {
        return user.getGrade();
    }

    public String getName() {
        return user.getName();
    }

    public String getMajor() {
        return user.getMajor();
    }
}
