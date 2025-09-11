package ITProject.union.Dto.file;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public record FileItemSummaryDto(
        @NotNull Long id,
        @NotNull Long folderId,
        @NotBlank String originalFileName,
        @NotBlank String contentType,
        @NotNull Long size,
        @NotNull @JsonFormat(shape = JsonFormat.Shape.STRING)
        Instant updatedAt,
        @NotNull Boolean deleted
) {}
