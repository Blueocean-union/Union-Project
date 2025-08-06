package ITProject.union.Dto;

//폴더 생성용
public record FolderRequestDto(
        Long subjectId,
        Long parentId,
        String name
) {}
