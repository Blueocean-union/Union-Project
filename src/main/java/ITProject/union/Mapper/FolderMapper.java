package ITProject.union.Mapper;

import ITProject.union.Dto.FolderResponseDto;
import ITProject.union.Entity.Folder;

import java.util.List;
import java.util.stream.Collectors;

public class FolderMapper {

    public static FolderResponseDto toDto(Folder entity) {
        return new FolderResponseDto(
                entity.getId(),
                entity.getName(),
                entity.getParent() != null ? entity.getParent().getId() : null,
                entity.getSubFolders().stream()
                        .map(FolderMapper::toDto)
                        .collect(Collectors.toList())
        );
    }
}
