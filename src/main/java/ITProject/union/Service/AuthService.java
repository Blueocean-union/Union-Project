package ITProject.union.Service;

import ITProject.union.Dto.SigninRequest;
import ITProject.union.Dto.SignupRequest;
import ITProject.union.Dto.TokenReissueRequest;
import ITProject.union.Dto.TokenResponse;
import ITProject.union.Entity.Grade;
import ITProject.union.Entity.OAuthProvider;
import ITProject.union.Entity.User;
import ITProject.union.Repository.UserRepository;
import ITProject.union.Security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * 📝 회원가입
     */
    public void signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 사용 중인 이메일입니다.");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .grade(Grade.BASIC)
                .provider(OAuthProvider.GOOGLE)
                .build();

        userRepository.save(user);
    }

    /**
     * 🔑 로그인 (Access + Refresh 토큰 발급)
     */
    public TokenResponse signin(SigninRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "이메일 또는 비밀번호가 잘못되었습니다."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "이메일 또는 비밀번호가 잘못되었습니다.");
        }

        String accessToken = jwtTokenProvider.createAccessToken(user.getId());
        String refreshToken = jwtTokenProvider.createRefreshToken(user.getId());

        user.setRefreshToken(refreshToken);
        userRepository.save(user);

        return new TokenResponse(accessToken, refreshToken);
    }

    /**
     * 🔄 Refresh Token 기반 토큰 재발급
     */
    public TokenResponse reissueToken(TokenReissueRequest request) {
        String refreshToken = request.getRefreshToken();

        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "유효하지 않은 리프레시 토큰");
        }

        Long userId = jwtTokenProvider.getUserIdFromToken(refreshToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자 없음"));

        if (!refreshToken.equals(user.getRefreshToken())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "토큰 불일치");
        }

        String newAccessToken = jwtTokenProvider.createAccessToken(user.getId());
        String newRefreshToken = jwtTokenProvider.createRefreshToken(user.getId());

        user.setRefreshToken(newRefreshToken);
        userRepository.save(user);

        return new TokenResponse(newAccessToken, newRefreshToken);
    }

    /**
     * 🚪 로그아웃 처리: Refresh Token 제거
     */
    public void logout(User user) {
        user.setRefreshToken(null);
        userRepository.save(user);
    }


    /**
     * ✅ 로그인 성공 시 Refresh Token 저장 (OAuth2SuccessHandler 등에서 호출할 수 있음)
     */
    public void saveRefreshToken(User user, String refreshToken) {
        user.setRefreshToken(refreshToken);
        userRepository.save(user);
    }
}
