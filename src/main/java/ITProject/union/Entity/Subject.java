package ITProject.union.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "subjects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 과목 이름 (예: 자료구조, 소프트웨어공학)
    @Column(nullable = false, length = 50)
    private String name;

    // 사용자별 과목 구분
    @ManyToOne(fetch = FetchType.LAZY)
    private User user;

    // 색상 태그 (예: #F1C40F)
    private String color;

    // 즐겨찾기 여부 (기본값 false)
    @Builder.Default
    private Boolean isFavorite = false;

    private LocalDateTime createdAt;

//    // 자료, 퀴즈, 요약 등과의 관계는 필요 시 추가
//    @OneToMany(mappedBy = "subject", cascade = CascadeType.ALL)
//    private List<StudyMaterial> materials;
//
//    @OneToMany(mappedBy = "subject", cascade = CascadeType.ALL)
//    private List<Quiz> quizzes;
//
//    @OneToMany(mappedBy = "subject", cascade = CascadeType.ALL)
//    private List<PdfSummary> summaries;
}
