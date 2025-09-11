package ITProject.union.Dto.file;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public record DownloadUrlResponse(
        @NotBlank String url,                      // S3 GET presigned URL
        @Positive long expiresInSeconds
) {}
