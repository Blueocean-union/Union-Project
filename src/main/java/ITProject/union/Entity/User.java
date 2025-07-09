package ITProject.union.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String email;

    @Column(nullable = false, length = 100)
    private String password; // 암호화 저장 (BCrypt)

    @Column(nullable = false, length = 30)
    private String name;

    @Column(nullable = false, length = 10)
    private String grade; // BASIC, PRO

    private String major;

    private String university;

    private LocalDateTime createdAt;

    private LocalDateTime lastLoginAt;


    // OAuth2.0 연동을 위한 추가 필드
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private OAuthProvider provider; // GOOGLE

    @Column(nullable = false, unique = true, length = 100)
    private String providerId; // Google 고유 식별자 (sub 값)

    @Column(length = 512)
    private String refreshToken;
//    // 관계 매핑 예시 (일정, 학습기록, 퀴즈 등)
//    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
//    private List<Schedule> schedules;
//
//    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
//    private List<Quiz> quizzes;
//
//    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
//    private List<StudyRecord> studyRecords;
//
//    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
//    private List<Question> questions;
//
//    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
//    private List<Answer> answers;
}

