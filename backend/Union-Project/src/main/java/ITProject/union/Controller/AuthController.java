package ITProject.union.Controller;

import ITProject.union.Dto.SigninRequest;
import ITProject.union.Dto.SignupRequest;
import ITProject.union.Dto.TokenReissueRequest;
import ITProject.union.Dto.TokenResponse;
import ITProject.union.Entity.User;
import ITProject.union.Security.CustomUserDetails;
import ITProject.union.Service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "회원인증 API")
public class AuthController {

    private final AuthService authService;

    /**
     * 📝 회원가입
     */
    @PostMapping("/signup")
    @Operation(summary="회원가입")
    public ResponseEntity<String> signup(@RequestBody SignupRequest request) {
        authService.signup(request);
        return ResponseEntity.ok("회원가입 완료");
    }

    /**
     * 🔑 로그인: AccessToken + RefreshToken 발급
     */
    @PostMapping("/signin")
    @Operation(summary="로그인")
    public ResponseEntity<TokenResponse> signin(@RequestBody SigninRequest request) {
        TokenResponse response = authService.signin(request);
        return ResponseEntity.ok(response);
    }

    /**
     * 🔄 토큰 재발급
     */
    @PostMapping("/reissue")
    @Operation(summary="토큰재발급")
    public ResponseEntity<TokenResponse> reissue(@RequestBody TokenReissueRequest request) {
        TokenResponse response = authService.reissueToken(request);
        return ResponseEntity.ok(response);
    }

    /**
     * 🚪 로그아웃: Refresh Token 삭제
     */
    @PostMapping("/logout")
    @Operation(summary="로그아웃")
    public ResponseEntity<String> logout(@AuthenticationPrincipal CustomUserDetails userDetails) {
        authService.logout(userDetails.getUser());
        return ResponseEntity.ok("로그아웃 완료");
    }

}
