package ITProject.union.Dto.Ai;

import ITProject.union.Entity.Ai.TranscriptionStatus;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class AudioResultResponse {
    private Long id;
    private String rid;
    private TranscriptionStatus status; // DONE / PROCESSING / FAILED
    private String transcript;          // 전사 결과 (DONE일 때 채워짐)
    private String jsonFileName;        // transcript_{rid}.json (있으면)
    private String message;             // 실패/메모
    private LocalDateTime createdAt;    // 생성 시각
}
