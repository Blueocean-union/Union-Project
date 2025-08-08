package ITProject.union.Controller;

import ITProject.union.Dto.Ai.PdfSummaryResponse;
import ITProject.union.Service.Ai.AiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
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
    @PostMapping("/pdf/summary")
    public ResponseEntity<PdfSummaryResponse> summarizePdf(@RequestParam("file") MultipartFile file) {
        System.out.println("🔥🔥🔥 PDF 요약 API 진입했음");
        try {
            PdfSummaryResponse response = aiService.summarizePdf(file);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
