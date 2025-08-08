package ITProject.union.Service.Ai;


import ITProject.union.Dto.Ai.PdfSummaryResponse;
import ITProject.union.Entity.Ai.PdfSummary;
import ITProject.union.Mapper.Ai.PdfSummaryMapper;
import ITProject.union.Repository.Ai.PdfSummaryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AiService {

    private final RestTemplate restTemplate;
    private final PdfSummaryRepository pdfSummaryRepository;
    private final PdfSummaryMapper pdfSummaryMapper;

    public PdfSummaryResponse summarizePdf(MultipartFile file) throws Exception {
        // 1. AI 서버로 요청 준비
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new MultipartInputStreamFileResource(file.getInputStream(), file.getOriginalFilename()));

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        // 2. AI 서버 요청
        String aiUrl = "http://127.0.0.1:8000/pdf/summary"; // 실제 AI 서버 주소로 교체

        ResponseEntity<Map> response = restTemplate.postForEntity(aiUrl, requestEntity, Map.class);

        if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null || !response.getBody().containsKey("summary")) {
            throw new RuntimeException("AI 서버 응답 오류: " + response);
        }

        String summary = (String) response.getBody().get("summary");

        // 3. DB 저장
        PdfSummary saved = pdfSummaryRepository.save(PdfSummary.builder()
                .originalFileName(file.getOriginalFilename())
                .summary(summary)
                .build());

        // 4. DTO 반환
        return pdfSummaryMapper.toDto(saved);
    }
}
