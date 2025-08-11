package ITProject.union.Entity.Ai;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Entity
@Table(
        name = "audio_transcription",
        uniqueConstraints = @UniqueConstraint(name = "uk_audio_transcription_rid", columnNames = "rid"),
        indexes = {
                @Index(name = "idx_audio_tr_created_at", columnList = "created_at"),
                @Index(name = "idx_audio_tr_status", columnList = "status"),
                @Index(name = "idx_audio_tr_rid", columnList = "rid")
        }
)
public class AudioTranscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * AI 서버에서 발급한 요청 ID
     */
    @Column(name = "rid", nullable = false, length = 100)
    private String rid;

    @Column(name = "original_file_name", nullable = false, length = 255)
    private String originalFileName;

    /**
     * MIME 타입 (e.g., audio/mpeg, audio/wav)
     */
    @Column(name = "mime_type", length = 100)
    private String mimeType;

    @Column(name = "size_bytes")
    private Long sizeBytes;

    /**
     * 처리 상태
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private TranscriptionStatus status;

    /**
     * 전사 결과 본문
     */
    @Column(name = "transcript", columnDefinition = "LONGTEXT")
    private String transcript;

    /**
     * AI 서버에서 저장한 JSON 파일명 (예: transcript_{rid}.json)
     */
    @Column(name = "json_file_name", length = 255)
    private String jsonFileName;

    /**
     * 오류 메시지 또는 상태 메모
     */
    @Column(name = "message", length = 1000)
    private String message;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;


    /**
     * 최초 요청 시 간편 생성자
     */
    public static AudioTranscription ofRequested(
            String rid,
            String originalFileName,
            String mimeType,
            Long sizeBytes
    ) {
        return AudioTranscription.builder()
                .rid(rid)
                .originalFileName(originalFileName)
                .mimeType(mimeType)
                .sizeBytes(sizeBytes)
                .status(TranscriptionStatus.REQUESTED)
                .build();
    }

    /** 진행/완료 상태 업데이트 편의 메서드 */
    public void markProcessing(String message) {
        this.status = TranscriptionStatus.PROCESSING;
        this.message = message;
    }

    public void markDone(String transcript, String jsonFileName) {
        this.status = TranscriptionStatus.DONE;
        this.transcript = transcript;
        this.jsonFileName = jsonFileName;
        this.message = null;
    }

    public void markFailed(String message) {
        this.status = TranscriptionStatus.FAILED;
        this.message = message;
    }
}