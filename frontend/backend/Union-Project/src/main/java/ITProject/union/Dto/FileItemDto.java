package ITProject.union.Dto;

import java.time.LocalDateTime;

//파일 목록 조회용
public record FileItemDto(
        Long id,
        String originalFileName,
        String storedFileName,
        String fileType,
        String filePath,
        LocalDateTime uploadedAt
) {}
