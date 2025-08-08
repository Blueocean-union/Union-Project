package ITProject.union.Dto;

public record SubjectRequestDto(
        String name,         // 과목 이름
        String color,        // 과목 색상 태그 (예: "#FFCC00")
        Boolean isFavorite   // 즐겨찾기 여부
) {}
