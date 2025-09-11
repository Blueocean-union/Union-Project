package ITProject.union.Dto.file;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record PresignUploadRequest(
        @NotNull Long folderId,
        @NotBlank String originalName,              // 클라이언트 표시용 원본명
        @NotBlank String contentType,              // 예: application/pdf
        @Positive Long size                        // 바이트
) {}