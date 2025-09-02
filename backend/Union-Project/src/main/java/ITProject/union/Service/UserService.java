package ITProject.union.Service;

import ITProject.union.Entity.User;
import ITProject.union.Mapper.UserMapper;
import ITProject.union.Dto.UserResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserMapper userMapper;

    public UserResponseDto getMyInfo(User user) {
        return userMapper.toUserInfoDto(user);
    }
}
