package ITProject.union.Controller;

import ITProject.union.Dto.file.*;
import ITProject.union.Service.FileSystemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Tag(name = "파일 API", description = "파일 업로드/동기화/다운로드/삭제 관련 API")
public class FileController {

    private final FileSystemService fileSystemService;

    @Operation(summary = "업로드 Presigned URL 발급",
            description = "S3에 직접 PUT 업로드 할 수 있는 presigned URL을 발급합니다. "
                    + "요청자가 해당 폴더의 소유자가 아니면 권한 오류가 발생합니다.")
    @PostMapping("/presign")
    public PresignUploadResponse presignUpload(
            @RequestBody PresignUploadRequest req,
            @AuthenticationPrincipal(expression = "id")
            @Parameter(hidden = true) Long userId
    ) {
        return fileSystemService.presignUpload(req, userId);
    }

    @Operation(summary = "업로드 확정",
            description = "클라이언트가 presigned URL로 업로드 완료 후, "
                    + "서버 DB에 메타데이터를 저장합니다.")
    @PostMapping("/confirm")
    public ConfirmUploadResponse confirmUpload(
            @RequestBody ConfirmUploadRequest req,
            @AuthenticationPrincipal(expression = "id")
            @Parameter(hidden = true) Long userId
    ) {
        return fileSystemService.confirmUpload(req, userId);
    }

    @Operation(summary = "폴더 내 파일 목록 조회",
            description = "특정 폴더 내 파일 목록을 조회합니다. "
                    + "`updatedAfter` 파라미터를 주면 해당 시점 이후 변경된 파일만 반환하여 동기화에 활용할 수 있습니다.")
    @GetMapping("/folder/{folderId}")
    public FileListResponse listFiles(
            @PathVariable Long folderId,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            @Parameter(description = "이 시각 이후 변경된 파일만 조회 (ISO 8601 형식, 예: 2025-09-11T05:10:00Z)")
            Instant updatedAfter,
            @AuthenticationPrincipal(expression = "id")
            @Parameter(hidden = true) Long userId
    ) {
        return fileSystemService.listFiles(folderId, updatedAfter, userId);
    }

    @Operation(summary = "다운로드 Presigned URL 발급",
            description = "파일 단건을 다운로드할 수 있는 presigned GET URL을 발급합니다.")
    @GetMapping("/{fileId}/download-url")
    public DownloadUrlResponse getDownloadUrl(
            @PathVariable Long fileId,
            @AuthenticationPrincipal(expression = "id")
            @Parameter(hidden = true) Long userId
    ) {
        return fileSystemService.getDownloadUrl(fileId, userId);
    }
    @PatchMapping("/{fileId}/rename")
    @Operation(summary = "파일 이름 수정",
            description = "파일의 원본 이름을 수정합니다.")
    public void renameFile(
            @PathVariable Long fileId,
            @RequestParam String newName,
            @AuthenticationPrincipal(expression = "id")
            @Parameter(hidden = true) Long userId
    ) {
        fileSystemService.renameFile(fileId, newName, userId);
    }

    @Operation(summary = "파일 삭제",
            description = "파일을 소프트 삭제(DB에 deleted=true로 표시)하고, "
                    + "실제 S3 객체도 삭제합니다. "
                    + "삭제 이벤트는 다른 기기에 동기화됩니다.")
    @DeleteMapping("/{fileId}")
    public void deleteFile(
            @PathVariable Long fileId,
            @AuthenticationPrincipal(expression = "id")
            @Parameter(hidden = true) Long userId
    ) {
        fileSystemService.deleteFile(fileId, userId);
    }
}
