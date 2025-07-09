package ITProject.union.Service;

import ITProject.union.Entity.User;
import ITProject.union.Security.JwtTokenProvider;
import ITProject.union.Repository.UserRepository;
import ITProject.union.Dto.TokenReissueRequest;
import ITProject.union.Dto.TokenResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

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
     * ✅ 로그인 성공 시 Refresh Token 저장 (OAuth2SuccessHandler에서 호출)
     */
    public void saveRefreshToken(User user, String refreshToken) {
        user.setRefreshToken(refreshToken);
        userRepository.save(user);
    }
}
