package ITProject.union.Service;

import ITProject.union.Dto.SubjectRequestDto;
import ITProject.union.Dto.SubjectResponseDto;
import ITProject.union.Entity.Folder;
import ITProject.union.Entity.Subject;
import ITProject.union.Entity.User;
import ITProject.union.Mapper.SubjectMapper;
import ITProject.union.Repository.FolderRepository;
import ITProject.union.Repository.SubjectRepository;
import ITProject.union.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SubjectService {

    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;
    private final FolderRepository folderRepository;

    @Transactional
    public Long createSubject(Long userId, SubjectRequestDto request) {
        User user = getUser(userId);

        if (subjectRepository.existsByUserAndName(user, request.name())) {
            throw new RuntimeException("이미 등록된 과목입니다.");
        }

        Subject subject = SubjectMapper.toEntity(request, user);
        subjectRepository.save(subject);

        // ✅ 루트 폴더 생성
        Folder rootFolder = new Folder();
        rootFolder.setName("/");
        rootFolder.setSubject(subject);
        rootFolder.setParent(null);
        rootFolder.setCreatedAt(LocalDateTime.now());
        folderRepository.save(rootFolder);

        return subject.getId();
    }

    @Transactional(readOnly = true)
    public List<SubjectResponseDto> getSubjects(Long userId) {
        return subjectRepository.findByUserId(userId).stream()
                .map(SubjectMapper::toDto)
                .toList();
    }

    @Transactional
    public void updateSubject(Long userId, Long subjectId, SubjectRequestDto request) {
        User user = getUser(userId);

        Subject subject = subjectRepository.findByIdAndUser(subjectId, user)
                .orElseThrow(() -> new RuntimeException("과목을 찾을 수 없습니다."));

        subject.setName(request.name());
        subject.setColor(request.color());
        subject.setIsFavorite(request.isFavorite() != null && request.isFavorite());
    }

    @Transactional
    public void deleteSubject(Long userId, Long subjectId) {
        User user = getUser(userId);

        Subject subject = subjectRepository.findByIdAndUser(subjectId, user)
                .orElseThrow(() -> new RuntimeException("과목을 찾을 수 없습니다."));

        subjectRepository.delete(subject);
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자 없음"));
    }
}
