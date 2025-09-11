package ITProject.union.Dto.file;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record ConfirmUploadRequest(
        @NotNull Long folderId,
        @NotBlank String objectKey,                // presign 때 받은 키
        @NotBlank String originalFileName,         // 화면에 보일 이름
        @NotBlank String contentType,
        @Positive Long size
) {}