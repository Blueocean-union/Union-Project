package ITProject.union.Dto.Ai;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class AiQuizDynamicListResponseDto {

    @JsonIgnore
    private String listKey;

    /**
     * 각 아이템은 이미 동적 키로 변환된 Map 형태여야 한다.
     * (컨버팅은 Service/Mapper에서 PdfQuizRequestKeysDto를 참조해 수행)
     */
    @JsonIgnore
    private List<Map<String, Object>> items;

    @JsonAnyGetter
    public Map<String, Object> asMap() {
        Map<String, Object> m = new HashMap<>();
        m.put(listKey, items);
        return m;
    }
}
