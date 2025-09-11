package ITProject.union.Dto.file;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public record PresignUploadResponse(
        @NotBlank String url,                      // S3 PUT presigned URL
        @NotBlank String objectKey,                // confirm 시 사용
        @Positive long expiresInSeconds
) {}