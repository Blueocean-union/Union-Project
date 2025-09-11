package ITProject.union.Dto.file;

import jakarta.validation.constraints.NotNull;

public record ConfirmUploadResponse(
        @NotNull Long fileId
) {}
