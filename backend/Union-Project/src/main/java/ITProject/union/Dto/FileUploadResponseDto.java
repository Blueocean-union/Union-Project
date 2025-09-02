package ITProject.union.Dto;

//파일 업로드 성공시 응답용
public record FileUploadResponseDto(
        Long fileId,
        String originalFileName,
        String storedFileName,
        String fileType,
        String filePath
) {}
