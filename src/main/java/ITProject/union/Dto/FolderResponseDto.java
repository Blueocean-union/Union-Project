package ITProject.union.Dto;

import java.util.List;

//하위 폴더 조회용
public record FolderResponseDto(
        Long id,
        String name,
        Long parentId,
        List<FolderResponseDto> subFolders
) {}
