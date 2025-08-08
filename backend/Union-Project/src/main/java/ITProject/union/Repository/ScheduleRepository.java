package ITProject.union.Repository;

import ITProject.union.Entity.Schedule;
import ITProject.union.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    List<Schedule> findByUserOrderByStartDateAsc(User user);
    Optional<Schedule> findByIdAndUserId(Long scheduleId, Long userId);
    @Query("SELECT s FROM Schedule s " +
            "WHERE s.user = :user " +
            "AND s.endDate >= :startOfMonth " +
            "AND s.startDate <= :endOfMonth")
    List<Schedule> findSchedulesByMonth(@Param("user") User user,
                                        @Param("startOfMonth") LocalDate startOfMonth,
                                        @Param("endOfMonth") LocalDate endOfMonth);
    @Query("SELECT s FROM Schedule s " +
            "WHERE s.user = :user " +
            "AND :today BETWEEN s.startDate AND s.endDate")
    List<Schedule> findTodaySchedules(@Param("user") User user,
                                      @Param("today") LocalDate today);

}

