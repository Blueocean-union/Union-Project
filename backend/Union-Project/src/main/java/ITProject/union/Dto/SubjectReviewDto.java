package ITProject.union.Dto;

import lombok.*;

import java.time.LocalDateTime;

public class SubjectReviewDto {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CreateRequest {
        private Long userId;      // 인증 주입이면 생략 가능
        private Long subjectId;
        private int targetCount;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ChangeTargetRequest {
        private int targetCount;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ResetRequest {
        private boolean confirm; // true 일 때만 초기화
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
        private Long id;
        private Long userId;
        private Long subjectId;
        private int targetCount;
        private int currentCount;
        private boolean completed;
        private LocalDateTime lastReviewedAt;
        private LocalDateTime completedAt;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
