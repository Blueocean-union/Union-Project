package ITProject.union.Security;

import lombok.Data;

@Data
public class TokenReissueRequest {
    private String refreshToken;
}
