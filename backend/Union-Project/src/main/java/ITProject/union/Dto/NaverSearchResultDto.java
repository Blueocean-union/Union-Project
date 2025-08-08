package ITProject.union.Dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NaverSearchResultDto {

    private String title;       // 글 제목 (HTML 태그 포함될 수 있음)
    private String link;        // 실제 링크 URL
    private String description; // 요약 내용

    // 선택적으로 추가 가능한 필드들
    private String source;      // 예: "blog", "news", "web" 등
    private String date;        // 게시 날짜 (예: 20250801 형식, 뉴스나 블로그에서만 사용)
}
