package ITProject.union.Controller;

import ITProject.union.Dto.NaverSearchResultDto;
import ITProject.union.Service.NaverSearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
@Tag(name = "검색 API")
public class NaverSearchController {

    private final NaverSearchService naverSearchService;

    //네이버검색
    @GetMapping("/naver")
    @Operation(summary="검색 결과")
    public List<NaverSearchResultDto> search(
            @RequestParam String query,
            @RequestParam(defaultValue = "blog") String target
    ) {
        return naverSearchService.search(query, target);
    }
}
