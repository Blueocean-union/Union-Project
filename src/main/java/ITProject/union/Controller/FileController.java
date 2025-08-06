package ITProject.union.Controller;

import ITProject.union.Dto.FileItemDto;
import ITProject.union.Entity.FileItem;
import ITProject.union.Service.FileSystemService;
import ITProject.union.Mapper.FileItemMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/files")
@Tag(name = "파일 API")
public class FileController {

    private final FileSystemService fileSystemService;

    @Operation(summary = "파일 업로드")
    @PostMapping
    public ResponseEntity<Long> uploadFile(@RequestParam Long folderId,
                                           @RequestParam MultipartFile file) throws Exception {
        Long fileId = fileSystemService.uploadFile(folderId, file);
        return ResponseEntity.ok(fileId);
    }

    @Operation(summary = "폴더 내 파일 목록 조회")
    @GetMapping("/folder/{folderId}")
    public ResponseEntity<List<FileItemDto>> getFiles(@PathVariable Long folderId) {
        List<FileItem> files = fileSystemService.getFiles(folderId);
        List<FileItemDto> dtos = files.stream()
                .map(FileItemMapper::toDto)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @Operation(summary = "파일 다운로드")
    @GetMapping("/{fileId}/download")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long fileId) throws UnsupportedEncodingException {
        FileItem file = fileSystemService.getFileById(fileId);
        FileSystemResource resource = new FileSystemResource(new File(file.getFilePath()));

        String encodedName = URLEncoder.encode(file.getOriginalFileName(), StandardCharsets.UTF_8)
                .replaceAll("\\+", "%20");

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + encodedName + "\"")
                .body(resource);
    }

    @Operation(summary = "파일 삭제")
    @DeleteMapping("/{fileId}")
    public ResponseEntity<Void> deleteFile(@PathVariable Long fileId) {
        fileSystemService.deleteFile(fileId);
        return ResponseEntity.ok().build();
    }
}
