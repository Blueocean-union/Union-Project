package ITProject.union.Mapper.Ai;

import ITProject.union.Dto.Ai.AudioRequestResponse;
import ITProject.union.Dto.Ai.AudioResultResponse;
import ITProject.union.Entity.Ai.AudioTranscription;
import org.springframework.stereotype.Component;

@Component
public class AudioTranscriptionMapper {

    public AudioRequestResponse toRequestDto(AudioTranscription entity) {
        return AudioRequestResponse.builder()
                .id(entity.getId())
                .rid(entity.getRid())
                .originalFileName(entity.getOriginalFileName())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    public AudioResultResponse toResultDto(AudioTranscription entity) {
        return AudioResultResponse.builder()
                .id(entity.getId())
                .rid(entity.getRid())
                .status(entity.getStatus())
                .transcript(entity.getTranscript())
                .jsonFileName(entity.getJsonFileName())
                .message(entity.getMessage())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
