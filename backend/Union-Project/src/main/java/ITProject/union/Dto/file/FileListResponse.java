package ITProject.union.Dto.file;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.List;

public record FileListResponse(
        @NotNull List<FileItemSummaryDto> items,
        @NotNull @JsonFormat(shape = JsonFormat.Shape.STRING)
        Instant nextSyncAt
) {}