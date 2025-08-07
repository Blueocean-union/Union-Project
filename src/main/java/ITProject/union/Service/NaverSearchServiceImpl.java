package ITProject.union.Service;

import ITProject.union.Dto.NaverSearchResultDto;
import ITProject.union.Service.NaverSearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class NaverSearchServiceImpl implements NaverSearchService {

    private final RestTemplate restTemplate;

    @Value("${naver.client-id}")
    private String clientId;

    @Value("${naver.client-secret}")
    private String clientSecret;

    @Override
    public List<NaverSearchResultDto> search(String query, String target) {
        String url = UriComponentsBuilder
                .fromHttpUrl("https://openapi.naver.com/v1/search/" + target + ".json")
                .queryParam("query", query)
                .build()
                .encode()
                .toUriString();

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Naver-Client-Id", clientId);
        headers.set("X-Naver-Client-Secret", clientSecret);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
            List<Map<String, Object>> items = (List<Map<String, Object>>) response.getBody().get("items");

            List<NaverSearchResultDto> results = new ArrayList<>();
            for (Map<String, Object> item : items) {
                results.add(
                        NaverSearchResultDto.builder()
                                .title((String) item.get("title"))
                                .link((String) item.get("link"))
                                .description((String) item.get("description"))
                                .date((String) item.get("postdate")) // 블로그/뉴스만 있음
                                .source(target)
                                .build()
                );
            }

            return results;

        } catch (Exception e) {
            log.error("네이버 검색 API 호출 실패: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    private String encode(String query) {
        return java.net.URLEncoder.encode(query, java.nio.charset.StandardCharsets.UTF_8);
    }
}
