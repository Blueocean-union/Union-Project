package ITProject.union.Dto;

import java.util.List;

public record AnnotationSaveRequest(
        List<Object> annotations, // 프론트가 보내는 배열 그대로 매핑 (Map<String,Object>로 바꿔도 OK)
        Integer clientVersion     // 선택: 낙관적 병합용. 없으면 무시.
) {}