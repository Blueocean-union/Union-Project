package ITProject.union.Mapper;


import ITProject.union.Dto.file.FileItemSummaryDto;
import ITProject.union.Entity.FileItem;

import java.util.List;
import java.util.stream.Collectors;

public class FileItemMapper {

    // 단일 엔티티 -> DTO
    public static FileItemSummaryDto toDto(FileItem entity) {
        if (entity == null) {
            return null;
        }
        return new FileItemSummaryDto(
                entity.getId(),
                entity.getFolderId(),
                entity.getOriginalFileName(),
                entity.getContentType(),
                entity.getSize(),
                entity.getUpdatedAt(),
                entity.isDeleted()
        );
    }

    // 리스트 -> DTO 리스트
    public static List<FileItemSummaryDto> toDtoList(List<FileItem> entities) {
        if (entities == null) {
            return List.of();
        }
        return entities.stream()
                .map(FileItemMapper::toDto)
                .collect(Collectors.toList());
    }
}
