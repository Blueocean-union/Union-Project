package ITProject.union.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "comments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 댓글 본문
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    // 작성자
    @ManyToOne(fetch = FetchType.LAZY)
    private User user;

    // 어떤 질문글에 달렸는지
    @ManyToOne(fetch = FetchType.LAZY)
    private QuestionPost questionPost;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
