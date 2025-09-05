package ITProject.union.Dto;

import jakarta.validation.constraints.NotBlank;

public record GoogleSearchRequest(
        @NotBlank String q,
        Integer start,        // 1~100 (10개씩 페이지)
        Integer num,          // 1~10
        String gl,            // KR, US ...
        String lr,            // lang_ko, lang_en ...
        String safe,          // active|off
        String siteSearch,    // 특정 도메인만
        String dateRestrict,  // d[number], w[number], m[number], y[number] ex) d7
        String searchType     // "image"면 이미지 검색
) {}
