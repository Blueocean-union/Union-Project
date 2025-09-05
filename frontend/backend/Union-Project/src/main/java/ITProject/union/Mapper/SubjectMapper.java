package ITProject.union.Mapper;

import ITProject.union.Dto.SubjectRequestDto;
import ITProject.union.Dto.SubjectResponseDto;
import ITProject.union.Entity.Subject;
import ITProject.union.Entity.User;

import java.time.LocalDateTime;

public class SubjectMapper {

    public static Subject toEntity(SubjectRequestDto dto, User user) {
        return Subject.builder()
                .user(user)
                .name(dto.name())
                .color(dto.color())
                .isFavorite(dto.isFavorite() != null && dto.isFavorite())
                .createdAt(LocalDateTime.now())
                .build();
    }

    public static SubjectResponseDto toDto(Subject subject) {
        return new SubjectResponseDto(
                subject.getId(),
                subject.getName(),
                subject.getColor(),
                subject.getIsFavorite(),
                subject.getCreatedAt()
        );
    }
}
