package ITProject.union.Controller;

import ITProject.union.Dto.FolderRequestDto;
import ITProject.union.Dto.FolderResponseDto;
import ITProject.union.Entity.Folder;
import ITProject.union.Mapper.FolderMapper;
import ITProject.union.Service.FileSystemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/folders")
@Tag(name = "폴더 API")
public class FolderController {

    private final FileSystemService fileSystemService;

    @Operation(summary = "하위 폴더 생성")
    @PostMapping
    public ResponseEntity<Long> createFolder(@RequestBody FolderRequestDto request) {
        Long folderId = fileSystemService.createFolder(
                request.subjectId(),
                request.parentId(),
                request.name()
        );
        return ResponseEntity.ok(folderId);
    }

    @Operation(summary = "폴더 이름 수정")
    @PatchMapping("/{id}")
    public ResponseEntity<Void> renameFolder(@PathVariable Long id,
                                             @RequestParam String newName) {
        fileSystemService.renameFolder(id, newName);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "폴더 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFolder(@PathVariable Long id) {
        fileSystemService.deleteFolder(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "폴더 정보 조회")
    @GetMapping("/{id}")
    public ResponseEntity<FolderResponseDto> getFolder(@PathVariable Long id) {
        Folder folder = fileSystemService.getFolder(id);
        return ResponseEntity.ok(FolderMapper.toDto(folder));
    }
}
