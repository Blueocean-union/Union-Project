package ITProject.union.Security;

import ITProject.union.Entity.OAuthProvider;
import ITProject.union.Entity.User;
import ITProject.union.Repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String sub = (String) oAuth2User.getAttributes().get("sub");

        User user = userRepository.findByProviderAndProviderId(OAuthProvider.GOOGLE, sub)
                .orElseThrow(() -> new RuntimeException("OAuth2 로그인 유저 DB 없음"));

        String accessToken = jwtTokenProvider.createAccessToken(user.getId());
        String refreshToken = jwtTokenProvider.createRefreshToken(user.getId());

        user.setRefreshToken(refreshToken);
        userRepository.save(user);
        // 클라이언트로 리디렉션 또는 JSON 응답
        response.sendRedirect("http://localhost:3000/oauth?accessToken=" + accessToken + "&refreshToken=" + refreshToken);
    }
}
