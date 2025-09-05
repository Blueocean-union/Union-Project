package ITProject.union.Dto;

import java.util.List;
public record GoogleSearchResponse(
        UrlInfo url,
        Queries queries,
        SearchInformation searchInformation,
        List<SearchItem> items
) {
    public record UrlInfo(String type, String template) {}
    public record Queries(List<Page> request, List<Page> nextPage) {
        public record Page(String title, String totalResults, int startIndex, int count) {}
    }
    public record SearchInformation(
            double searchTime,
            String formattedSearchTime,
            String totalResults,
            String formattedTotalResults
    ) {}
    public record SearchItem(
            String kind,
            String title,
            String htmlTitle,
            String link,
            String displayLink,
            String snippet,
            String htmlSnippet,
            String cacheId,
            String formattedUrl
            // 이미지 검색 시에는 pagemap/thumbnail 등 추가 필드 고려 가능
    ) {}
}
