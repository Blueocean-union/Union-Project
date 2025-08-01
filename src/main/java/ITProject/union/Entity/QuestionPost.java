package ITProject.union.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "question_posts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 제목
    @Column(nullable = false, length = 100)
    private String title;

    // 본문
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    // 카테고리 (질문 게시판 구분)
    @ManyToOne(fetch = FetchType.LAZY)
    private Category category;

    // 작성자
    @ManyToOne(fetch = FetchType.LAZY)
    private User user;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "questionPost", cascade = CascadeType.ALL)
    private List<Comment> comments;
}
