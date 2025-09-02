package ITProject.union.Mapper;

import ITProject.union.Entity.User;
import ITProject.union.Dto.UserResponseDto;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    /**
     * Entity → DTO
     */
    public UserResponseDto toUserInfoDto(User user) {
        return new UserResponseDto(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getGrade(),
                user.getMajor(),
                user.getUniversity(),
                user.getCreatedAt(),
                user.getLastLoginAt()
        );
    }
}
