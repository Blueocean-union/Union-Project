package ITProject.union.Controller;

import ITProject.union.Dto.Ai.PdfSummaryResponse;
import ITProject.union.Service.Ai.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping("/pdfs/summary")
    public ResponseEntity<PdfSummaryResponse> summarizePdf(@RequestParam("file") MultipartFile file) {
        try {
            PdfSummaryResponse response = aiService.summarizePdf(file);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
