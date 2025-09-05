package ITProject.union.Controller;

import ITProject.union.Dto.Ai.AudioRequestResponse;
import ITProject.union.Dto.Ai.AudioResultResponse;
import ITProject.union.Dto.Ai.PdfSummaryResponse;
import ITProject.union.Service.Ai.AiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ITProject.union.Dto.Ai.AiQuizDynamicListResponseDto;
import ITProject.union.Dto.Ai.PdfQuizRequestKeysDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Tag(name = "Ai 기능 API")
public class AiController {

    private final AiService aiService;

    @Operation(summary = "pdf 요약")
    @PostMapping(
            value = "/pdfs/summary",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<PdfSummaryResponse> summarizePdf(@RequestPart("file") MultipartFile file) {
        System.out.println("🔥 PDF 요약 API 진입했음");
        try {
            PdfSummaryResponse response = aiService.summarizePdf(file);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @Operation(summary = "오디오 전사 요청 (RID 발급)")
    @PostMapping(
            value = "/audio/request",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<AudioRequestResponse> requestAudio(@RequestPart("file") MultipartFile file) {
        System.out.println("🎙️ 오디오 전사 요청 API 진입");
        try {
            AudioRequestResponse res = aiService.requestAudioTranscription(file);
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @Operation(summary = "오디오 전사 결과 조회 (RID로 상태/결과 확인)")
    @GetMapping("/audio/result/{rid}")
    public ResponseEntity<AudioResultResponse> getAudioResult(@PathVariable String rid) {
        System.out.println("🎧 오디오 전사 결과 조회 API 진입: rid=" + rid);
        try {
            AudioResultResponse res = aiService.getAudioTranscriptionResult(rid);
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @Operation(summary = "PDF들로 AI 퀴즈 생성 (FastAPI와 동일한 JSON 키 구조 반환)")
    @PostMapping(
            value = "/pdfs/quiz",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<AiQuizDynamicListResponseDto> createQuizzesFromPdfs(
            @RequestPart("files") MultipartFile[] files,
            // FastAPI와 호환: key_names 라고 보내도 되고, 프론트 명확성을 위해 keyNames도 허용
            @RequestPart(value = "keyNames", required = false) String keyNamesJson,
            @RequestParam(value = "model", required = false) String model,
            HttpServletRequest request
    ) {
        System.out.println("🧩 PDF → 퀴즈 생성 API 진입");
        try {
            // keyNames JSON 파싱 (없으면 기본값)
            PdfQuizRequestKeysDto keys;
            if (keyNamesJson == null || keyNamesJson.isBlank()) {
                keys = PdfQuizRequestKeysDto.defaults();
            } else {
                // { "list_key": "...", "question_key": "...", ... }
                ObjectMapper om = new ObjectMapper();
                keys = om.readValue(keyNamesJson, PdfQuizRequestKeysDto.class);
            }

            // 요청자 IP (배치 메타에 기록)
            String clientIp = request.getRemoteAddr();

            AiQuizDynamicListResponseDto res =
                    aiService.createQuizzesFromPdfs(files, keys, model, clientIp);

            return ResponseEntity.ok(res);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

}
    
