package ITProject.union.Mapper;

import ITProject.union.Dto.FileItemDto;
import ITProject.union.Dto.FileUploadResponseDto;
import ITProject.union.Entity.FileItem;

public class FileItemMapper {

    public static FileItemDto toDto(FileItem entity) {
        return new FileItemDto(
                entity.getId(),
                entity.getOriginalFileName(),
                entity.getStoredFileName(),
                entity.getFileType(),
                entity.getFilePath(),
                entity.getUploadedAt()
        );
    }

    public static FileUploadResponseDto toUploadDto(FileItem entity) {
        return new FileUploadResponseDto(
                entity.getId(),
                entity.getOriginalFileName(),
                entity.getStoredFileName(),
                entity.getFileType(),
                entity.getFilePath()
        );
    }
}
