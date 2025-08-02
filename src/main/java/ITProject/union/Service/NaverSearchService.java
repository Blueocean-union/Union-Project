package ITProject.union.Service;

import ITProject.union.Dto.NaverSearchResultDto;
import java.util.List;

public interface NaverSearchService {
    List<NaverSearchResultDto> search(String query, String target);
}
