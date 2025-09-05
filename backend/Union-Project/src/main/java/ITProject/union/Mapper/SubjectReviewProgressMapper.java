package ITProject.union.Mapper;

import ITProject.union.Dto.SubjectReviewDto;
import ITProject.union.Entity.Subject;
import ITProject.union.Entity.User;
import ITProject.union.Entity.SubjectReviewProgress;

import java.time.LocalDateTime;

public class SubjectReviewProgressMapper {

    // CreateRequest → Entity
    public static SubjectReviewProgress toEntity(SubjectReviewDto.CreateRequest dto, User user, Subject subject) {
        return SubjectReviewProgress.builder()
                .user(user)
                .subject(subject)
                .targetCount(dto.getTargetCount())
                .currentCount(0)
                .lastReviewedAt(null)
                .completedAt(null)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    // Entity → Response DTO
    public static SubjectReviewDto.Response toDto(SubjectReviewProgress entity) {
        return SubjectReviewDto.Response.builder()
                .id(entity.getId())
                .userId(entity.getUser().getId())
                .subjectId(entity.getSubject().getId())
                .targetCount(entity.getTargetCount())
                .currentCount(entity.getCurrentCount())
                .completed(entity.isCompleted())
                .lastReviewedAt(entity.getLastReviewedAt())
                .completedAt(entity.getCompletedAt())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
