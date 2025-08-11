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

}
    
