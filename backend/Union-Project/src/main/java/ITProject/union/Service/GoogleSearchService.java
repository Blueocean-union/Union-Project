package ITProject.union.Service;

import ITProject.union.Dto.GoogleSearchRequest;
import ITProject.union.Dto.GoogleSearchResponse;
import ITProject.union.GoogleSearchProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
@RequiredArgsConstructor
public class GoogleSearchService {

    private final WebClient googleSearchWebClient;
    private final GoogleSearchProperties props;
    @Cacheable(value = "googleSearch", key = "#req") // ✅ record의 equals/hashCode를 키로 사용
    public GoogleSearchResponse search(GoogleSearchRequest req) {
        var num = (req.num() == null) ? props.getDefaultProps().getNum() : req.num();
        var gl  = (req.gl()  == null) ? props.getDefaultProps().getGl()  : req.gl();
        var lr  = (req.lr()  == null) ? props.getDefaultProps().getLr()  : req.lr();
        var safe= (req.safe()== null) ? props.getDefaultProps().getSafe(): req.safe();

        return googleSearchWebClient.get()
                .uri(uriBuilder -> {
                    var b = uriBuilder
                            .path("/customsearch/v1")
                            .queryParam("key", props.getApiKey())
                            .queryParam("cx", props.getCx())
                            .queryParam("q", req.q())
                            .queryParam("num", Math.min(Math.max(num, 1), 10))
                            .queryParam("gl", gl)
                            .queryParam("lr", lr)
                            .queryParam("safe", safe);

                    if (req.start() != null)      b.queryParam("start", req.start());
                    if (req.siteSearch() != null) b.queryParam("siteSearch", req.siteSearch());
                    if (req.dateRestrict() != null) b.queryParam("dateRestrict", req.dateRestrict());
                    if (req.searchType() != null) b.queryParam("searchType", req.searchType());
                    return b.build();
                })
                .retrieve()
                .onStatus(HttpStatusCode::is4xxClientError, r ->
                        r.bodyToMono(String.class).map(body -> new RuntimeException("Google 4xx: " + body)))
                .onStatus(HttpStatusCode::is5xxServerError, r ->
                        r.bodyToMono(String.class).map(body -> new RuntimeException("Google 5xx: " + body)))
                .bodyToMono(GoogleSearchResponse.class)
                .block();
    }
}
