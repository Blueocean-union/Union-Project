package ITProject.union.Controller;

import ITProject.union.Dto.UserResponseDto;
import ITProject.union.Entity.User;
import ITProject.union.Security.CustomUserDetails;
import ITProject.union.Service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "유저 API")
public class UserController {

    private final UserService userService;

    /**
     * 🙋 내 정보 조회
     */
    @GetMapping("/me")
    @Operation(summary="내 정보 조회")
    public ResponseEntity<UserResponseDto> getMyInfo(@AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(userService.getMyInfo(user.getUser()));
    }
}
