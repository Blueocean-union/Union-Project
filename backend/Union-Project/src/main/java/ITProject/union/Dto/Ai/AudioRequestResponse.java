package ITProject.union.Dto.Ai;

import ITProject.union.Entity.Ai.TranscriptionStatus;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class AudioRequestResponse {
    private Long id;                 // 우리 DB id
    private String rid;              // AI서버에서 받은 요청 ID
    private TranscriptionStatus status; // REQUESTED 등
    private String originalFileName; // 업로드 파일명
    private LocalDateTime createdAt; // 생성 시각
}
