package ITProject.union.Service.Ai;

import ITProject.union.Dto.Ai.PdfSummaryResponse;
import ITProject.union.Dto.Ai.AudioRequestResponse;
import ITProject.union.Dto.Ai.AudioResultResponse;
import ITProject.union.Entity.Ai.PdfSummary;
import ITProject.union.Entity.Ai.AudioTranscription;
import ITProject.union.Mapper.Ai.PdfSummaryMapper;
import ITProject.union.Mapper.Ai.AudioTranscriptionMapper;
import ITProject.union.Repository.Ai.PdfSummaryRepository;
import ITProject.union.Repository.Ai.AudioTranscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AiService {

    private final RestTemplate restTemplate;

    // ===== PDF 요약 =====
    private final PdfSummaryRepository pdfSummaryRepository;
    private final PdfSummaryMapper pdfSummaryMapper;

    // ===== 오디오 전사 =====
    private final AudioTranscriptionRepository audioTranscriptionRepository;
    private final AudioTranscriptionMapper audioTranscriptionMapper;

    /* =========================
       1) PDF 요약
       ========================= */
    public PdfSummaryResponse summarizePdf(MultipartFile file) throws Exception {
        // 1. AI 서버로 요청 준비
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("files", new MultipartInputStreamFileResource(file.getInputStream(), file.getOriginalFilename()));

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        // 2. AI 서버 요청
        String aiUrl = "http://52.78.209.115:8000/pdfs/summary"; // 실제 AI 서버 주소로 교체 가능
        System.out.println("📡 FastAPI로 전송: " + aiUrl);
        System.out.println("요청 파일: " + file.getOriginalFilename());
        ResponseEntity<Map> response = restTemplate.postForEntity(aiUrl, requestEntity, Map.class);
        System.out.println("AI 응답 코드: " + response.getStatusCode());
        System.out.println("AI 응답 바디: " + response.getBody());
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

    /* =========================
       2) 오디오 전사 - 요청 (RID 발급)
       ========================= */
    public AudioRequestResponse requestAudioTranscription(MultipartFile file) throws Exception {
        // FastAPI: POST /audio/request, key = "file"
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new MultipartInputStreamFileResource(file.getInputStream(), file.getOriginalFilename()));

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        String aiUrl = "http://52.78.209.115:8000/audio/request";
        System.out.println("📡 FastAPI로 전송(오디오 요청): " + aiUrl);
        System.out.println("요청 파일: " + file.getOriginalFilename());

        ResponseEntity<Map> resp = restTemplate.postForEntity(aiUrl, requestEntity, Map.class);
        System.out.println("AI 응답 코드: " + resp.getStatusCode());
        System.out.println("AI 응답 바디: " + resp.getBody());

        if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null || !resp.getBody().containsKey("rid")) {
            throw new RuntimeException("AI 전사 요청 실패: " + resp);
        }

        String rid = String.valueOf(resp.getBody().get("rid"));

        // DB 저장 (REQUESTED)
        AudioTranscription saved = audioTranscriptionRepository.save(
                AudioTranscription.ofRequested(
                        rid,
                        file.getOriginalFilename(),
                        file.getContentType(),
                        file.getSize()
                )
        );

        // 요청 응답 DTO 반환
        return audioTranscriptionMapper.toRequestDto(saved);
    }

    /* ======================================
       3) 오디오 전사 - 결과 조회 (200/202 처리)
       ====================================== */
    public AudioResultResponse getAudioTranscriptionResult(String rid) {
        AudioTranscription entity = audioTranscriptionRepository.findByRid(rid)
                .orElseThrow(() -> new IllegalArgumentException("RID가 존재하지 않습니다: " + rid));

        String aiUrl = "http://52.78.209.115:8000/audio/result/" + rid;
        System.out.println("📡 FastAPI로 전송(오디오 결과): " + aiUrl);

        try {
            ResponseEntity<Map> resp = restTemplate.getForEntity(aiUrl, Map.class);
            System.out.println("AI 응답 코드: " + resp.getStatusCode());
            System.out.println("AI 응답 바디: " + resp.getBody());

            if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null && resp.getBody().containsKey("text")) {
                // 완료(200): { "text": "...", "json_saved": "transcript_{rid}.json" }
                String text = (String) resp.getBody().get("text");
                String jsonSaved = resp.getBody().containsKey("json_saved") ? String.valueOf(resp.getBody().get("json_saved")) : null;

                entity.markDone(text, jsonSaved); // 엔티티 메서드 필요
                entity = audioTranscriptionRepository.save(entity);
                return audioTranscriptionMapper.toResultDto(entity);
            }

            if (resp.getStatusCode() == HttpStatus.ACCEPTED) {
                // 진행중(202): { "message": "아직 처리 중..." }
                String msg = (resp.getBody() != null && resp.getBody().get("message") != null)
                        ? String.valueOf(resp.getBody().get("message"))
                        : "처리 중";
                entity.markProcessing(msg); // 엔티티 메서드 필요
                entity = audioTranscriptionRepository.save(entity);
                return audioTranscriptionMapper.toResultDto(entity);
            }

            // 기타 상태는 실패 처리
            entity.markFailed("예상치 못한 상태 코드: " + resp.getStatusCode());
            entity = audioTranscriptionRepository.save(entity);
            return audioTranscriptionMapper.toResultDto(entity);

        } catch (HttpStatusCodeException e) {
            String msg = e.getResponseBodyAsString();
            entity.markFailed((msg != null && !msg.isBlank()) ? msg : e.getMessage());
            entity = audioTranscriptionRepository.save(entity);
            return audioTranscriptionMapper.toResultDto(entity);
        }
    }
}
