package ITProject.union.Controller;

import ITProject.union.Dto.GoogleSearchRequest;
import ITProject.union.Dto.GoogleSearchResponse;
import ITProject.union.Service.GoogleSearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
@Tag(name = "Google Search API")
public class GoogleSearchController {

    private final GoogleSearchService googleSearchService;

    @Operation(summary = "구글 검색 프록시")
    @GetMapping
    public ResponseEntity<GoogleSearchResponse> search(
            @Valid GoogleSearchRequest req
    ) {
        return ResponseEntity.ok(googleSearchService.search(req));
    }
}
