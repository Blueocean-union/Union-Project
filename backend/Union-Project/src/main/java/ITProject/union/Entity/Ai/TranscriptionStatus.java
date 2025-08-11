package ITProject.union.Entity.Ai;

public enum TranscriptionStatus {
    REQUESTED,   // /audio/request 성공 직후
    PROCESSING,  // (옵션) 폴링 중 상태 표시
    DONE,        // /audio/result/{rid} 에서 전사 본문 확보
    FAILED       // 요청/조회 실패
}
