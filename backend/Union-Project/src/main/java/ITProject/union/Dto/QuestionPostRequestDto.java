package ITProject.union.Dto;

public record QuestionPostRequestDto(
        String title,
        String content,
        Long categoryId
) {}
