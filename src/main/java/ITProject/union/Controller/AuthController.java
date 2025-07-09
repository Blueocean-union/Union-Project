package ITProject.union.Controller;

import ITProject.union.Entity.User;
import ITProject.union.Service.AuthService;
import ITProject.union.Dto.TokenReissueRequest;
import ITProject.union.Dto.TokenResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * 🔄 토큰 재발급
     * @param request { "refreshToken": "..." }
     */
    @PostMapping("/reissue")
    public ResponseEntity<TokenResponse> reissue(@RequestBody TokenReissueRequest request) {
        TokenResponse response = authService.reissueToken(request);
        return ResponseEntity.ok(response);
    }

    /**
     * 🚪 로그아웃: Refresh Token 삭제
     * @param user 인증된 사용자 (JWT 통해 가져옴)
     */
    @PostMapping("/logout")
    public ResponseEntity<String> logout(@AuthenticationPrincipal User user) {
        authService.logout(user);
        return ResponseEntity.ok("로그아웃 완료");
    }
}
