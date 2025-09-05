package ITProject.union.Service;

import ITProject.union.Dto.SubjectReviewDto;
import ITProject.union.Entity.Subject;
import ITProject.union.Entity.User;
import ITProject.union.Entity.SubjectReviewProgress;
import ITProject.union.Mapper.SubjectReviewProgressMapper;
import ITProject.union.Repository.SubjectRepository;
import ITProject.union.Repository.UserRepository;
import ITProject.union.Repository.SubjectReviewProgressRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SubjectReviewProgressService {

    private final SubjectReviewProgressRepository progressRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;

    /** 생성 (중복 조합 방지) */
    @Transactional
    public SubjectReviewDto.Response create(SubjectReviewDto.CreateRequest req) {
        User user = userRepository.findById(req.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + req.getUserId()));
        Subject subject = subjectRepository.findById(req.getSubjectId())
                .orElseThrow(() -> new EntityNotFoundException("Subject not found: " + req.getSubjectId()));

        if (progressRepository.existsByUser_IdAndSubject_Id(user.getId(), subject.getId())) {
            throw new IllegalStateException("이미 해당 사용자/과목 진행 상태가 존재합니다.");
        }

        SubjectReviewProgress entity = SubjectReviewProgressMapper.toEntity(req, user, subject);
        SubjectReviewProgress saved = progressRepository.save(entity);
        return SubjectReviewProgressMapper.toDto(saved);
    }

    /** 회독 +1 (버튼 클릭) */
    @Transactional
    public SubjectReviewDto.Response increment(Long userId, Long subjectId) {
        SubjectReviewProgress entity = progressRepository.findByUser_IdAndSubject_Id(userId, subjectId)
                .orElseThrow(() -> new EntityNotFoundException("진행 상태가 존재하지 않습니다. 먼저 생성하세요."));
        entity.increment(); // 도메인 메서드
        return SubjectReviewProgressMapper.toDto(entity);
    }

    /** 목표 변경 */
    @Transactional
    public SubjectReviewDto.Response changeTarget(Long id, SubjectReviewDto.ChangeTargetRequest req) {
        SubjectReviewProgress entity = progressRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Progress not found: " + id));
        entity.changeTarget(req.getTargetCount());
        return SubjectReviewProgressMapper.toDto(entity);
    }

    /** 초기화 */
    @Transactional
    public SubjectReviewDto.Response reset(Long id) {
        SubjectReviewProgress entity = progressRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Progress not found: " + id));
        entity.resetProgress();
        return SubjectReviewProgressMapper.toDto(entity);
    }

    /** 사용자별 목록 */
    public List<SubjectReviewDto.Response> listByUser(Long userId) {
        return progressRepository.findAllByUser_Id(userId)
                .stream()
                .map(SubjectReviewProgressMapper::toDto)
                .toList();
    }
}
