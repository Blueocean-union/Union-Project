package ITProject.union.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String name; // 예: "IT/테크", "금융/경제"

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL)
    private List<QuestionPost> posts;
}
