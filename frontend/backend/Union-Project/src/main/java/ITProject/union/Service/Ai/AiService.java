package ITProject.union.Service.Ai;

import ITProject.union.Dto.Ai.*;
import ITProject.union.Entity.Ai.*;
import ITProject.union.Mapper.Ai.*;
import ITProject.union.Repository.Ai.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 기존 PDF 요약 / 오디오 전사 + AI 퀴즈 생성 통합 서비스
 */
@Service
@RequiredArgsConstructor
public class AiService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper; // 없다면 @Configuration에서 @Bean 등록

    // ===== PDF 요약 =====
    private final PdfSummaryRepository pdfSummaryRepository;
    private final PdfSummaryMapper pdfSummaryMapper;

    // ===== 오디오 전사 =====
    private final AudioTranscriptionRepository audioTranscriptionRepository;
    private final AudioTranscriptionMapper audioTranscriptionMapper;

    // ===== AI 퀴즈 =====
    private final AiQuizBatchRepository aiQuizBatchRepository;
    private final AiQuizRepository aiQuizRepository;
    private final AiQuizMapper aiQuizMapper;

    /* =========================
       공통: FastAPI 엔드포인트
       ========================= */
    private static final String FASTAPI_BASE = "http://52.78.209.115:8000";
    private static final String EP_PDFS_SUMMARY = "/pdfs/summary";
    private static final String EP_PDFS_QUIZ = "/pdfs/quiz";
    private static final String EP_AUDIO_REQUEST = "/audio/request";
    private static final String EP_AUDIO_RESULT = "/audio/result/";

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
        String aiUrl = FASTAPI_BASE + EP_PDFS_SUMMARY;
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

        String aiUrl = FASTAPI_BASE + EP_AUDIO_REQUEST;
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

        String aiUrl = FASTAPI_BASE + EP_AUDIO_RESULT + rid;
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

    /* =========================
       4) PDF → AI 퀴즈 생성/저장/응답
       ========================= */
    @Transactional
    public AiQuizDynamicListResponseDto createQuizzesFromPdfs(
            MultipartFile[] files,
            PdfQuizRequestKeysDto keyNames,   // null 허용, null이면 defaults()
            String model,                     // 예: "gpt-4o-mini" (옵션)
            String requestIp                  // 요청자 IP (옵션)
    ) {
        final PdfQuizRequestKeysDto keys = (keyNames == null) ? PdfQuizRequestKeysDto.defaults() : keyNames;

        // 1) 배치 생성
        AiQuizBatch batch = AiQuizBatch.builder()
                .model(model)
                .requestIp(requestIp)
                .sourceFiles(joinFilenames(files))
                .listKey(keys.getListKey())
                .questionKey(keys.getQuestionKey())
                .difficultyKey(keys.getDifficultyKey())
                .option1Key(keys.getOption1Key())
                .option2Key(keys.getOption2Key())
                .option3Key(keys.getOption3Key())
                .option4Key(keys.getOption4Key())
                .answerExplanationKey(keys.getAnswerExplanationKey())
                .totalItems(0)
                .build();
        batch = aiQuizBatchRepository.save(batch);

        // 2) FastAPI 호출
        Map<String, Object> fastApiResponse = callFastApiQuiz(files, keys);

        // 3) 동적 키에서 리스트 꺼내기
        Object listObj = fastApiResponse.get(keys.getListKey());
        if (!(listObj instanceof List<?> listRaw)) {
            throw new IllegalStateException("FastAPI 응답 형식 오류: '" + keys.getListKey() + "' 리스트가 없습니다.");
        }

        // 4) 동적 아이템들 → 내부 표준 DTO
        List<AiQuizItemDto> items = parseDynamicItemsToDto(listRaw, keys);

        // 5) 저장 (동일 배치 내 중복만 차단)
        AiQuizBatch savedBatch = aiQuizBatchRepository.save(batch);

        List<AiQuiz> entities = items.stream()
                .map(dto -> aiQuizMapper.toEntity(dto, savedBatch))
                .collect(Collectors.toList());
        List<AiQuiz> saved = aiQuizRepository.saveAll(entities);

        // 6) 배치 카운트 갱신
        batch.setTotalItems(saved.size());
        aiQuizBatchRepository.save(batch);

        // 7) 응답: 동적 키 구조로 재직렬화
        List<Map<String, Object>> dynamicItems = saved.stream()
                .map(aiQuizMapper::toDto)
                .map(dto -> aiQuizMapper.toDynamicMap(dto, keys))
                .collect(Collectors.toList());

        return aiQuizMapper.toDynamicListResponse(keys.getListKey(), dynamicItems);
    }

    /* =========================
       5) 배치 요약 조회 (옵션)
       ========================= */
    public AiQuizBatchSummaryDto getQuizBatchSummary(Long batchId) {
        AiQuizBatch b = aiQuizBatchRepository.findById(batchId)
                .orElseThrow(() -> new NoSuchElementException("배치가 존재하지 않습니다: id=" + batchId));
        return aiQuizMapper.toBatchSummaryDto(b);
    }

    /* =========================
       내부 유틸
       ========================= */

    /** FastAPI `/pdfs/quiz` 호출 */
    private Map<String, Object> callFastApiQuiz(MultipartFile[] files, PdfQuizRequestKeysDto keys) {
        String url = FASTAPI_BASE + EP_PDFS_QUIZ;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

        // 파일들 추가 (필드명 "files")
        for (MultipartFile f : files) {
            if (f == null || f.isEmpty()) continue;
            try {
                body.add("files", new MultipartInputStreamFileResource(f.getInputStream(), f.getOriginalFilename()));
            } catch (Exception e) {
                // 파일 하나 실패해도 전체 중단
                throw new IllegalStateException("파일 읽기 실패: " + f.getOriginalFilename(), e);
            }
        }

        // key_names 문자열(JSON) 추가
        String keyNamesJson = toKeyNamesJson(keys);
        body.add("key_names", keyNamesJson);

        HttpEntity<MultiValueMap<String, Object>> req = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> resp = restTemplate.postForEntity(url, req, String.class);
            if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null) {
                throw new IllegalStateException("FastAPI 호출 실패: HTTP " + resp.getStatusCode());
            }
            // 응답 바디 → Map
            return objectMapper.readValue(resp.getBody(), new TypeReference<Map<String, Object>>() {});
        } catch (RestClientException e) {
            throw new IllegalStateException("FastAPI 연결 실패: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new IllegalStateException("FastAPI 응답 파싱 실패: " + e.getMessage(), e);
        }
    }

    /** 내부 표준 DTO로 파싱 */
    @SuppressWarnings("unchecked")
    private List<AiQuizItemDto> parseDynamicItemsToDto(List<?> listRaw, PdfQuizRequestKeysDto k) {
        List<AiQuizItemDto> result = new ArrayList<>();
        for (Object o : listRaw) {
            if (!(o instanceof Map<?, ?> m)) continue;
            Map<String, Object> map = (Map<String, Object>) m;

            String question = asStr(map.get(k.getQuestionKey()));
            String difficulty = asStr(map.get(k.getDifficultyKey()));
            String option1 = asStr(map.get(k.getOption1Key()));
            String option2 = asStr(map.get(k.getOption2Key()));
            String option3 = asStr(map.get(k.getOption3Key()));
            String option4 = asStr(map.get(k.getOption4Key()));
            String answer = asStr(map.get(k.getAnswerExplanationKey()));

            if (isBlank(question) || isBlank(difficulty) || isBlank(option1) || isBlank(option2)
                    || isBlank(option3) || isBlank(option4) || isBlank(answer)) {
                continue; // 방어적 스킵
            }

            result.add(AiQuizItemDto.builder()
                    .question(question)
                    .difficultyRaw(difficulty)
                    .option1(option1)
                    .option2(option2)
                    .option3(option3)
                    .option4(option4)
                    .answerExplanation(answer)
                    .build());
        }
        return result;
    }

    private String toKeyNamesJson(PdfQuizRequestKeysDto k) {
        try {
            Map<String, String> m = new LinkedHashMap<>();
            m.put("list_key", k.getListKey());
            m.put("question_key", k.getQuestionKey());
            m.put("difficulty_key", k.getDifficultyKey());
            m.put("option1_key", k.getOption1Key());
            m.put("option2_key", k.getOption2Key());
            m.put("option3_key", k.getOption3Key());
            m.put("option4_key", k.getOption4Key());
            m.put("answer_explanation_key", k.getAnswerExplanationKey());
            return objectMapper.writeValueAsString(m);
        } catch (Exception e) {
            // fallback
            return "{\"list_key\":\"quizzes\",\"question_key\":\"question\",\"difficulty_key\":\"difficulty\",\"option1_key\":\"option1\",\"option2_key\":\"option2\",\"option3_key\":\"option3\",\"option4_key\":\"option4\",\"answer_explanation_key\":\"answer_explanation\"}";
        }
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    private String asStr(Object v) {
        return (v == null) ? null : String.valueOf(v);
    }

    private String joinFilenames(MultipartFile[] files) {
        if (files == null || files.length == 0) return null;
        return Arrays.stream(files)
                .filter(Objects::nonNull)
                .map(MultipartFile::getOriginalFilename)
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.joining(","));
    }
}
