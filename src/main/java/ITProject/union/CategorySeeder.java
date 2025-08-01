package ITProject.union;

import ITProject.union.Entity.Category;
import ITProject.union.Repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class CategorySeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    @Override
    public void run(String... args) {
        if (categoryRepository.count() == 0) {
            List<String> categories = List.of(
                    "IT/테크",
                    "사회/정치",
                    "경영/경제",
                    "법학",
                    "언어",
                    "전기/전자"
            );

            for (String name : categories) {
                categoryRepository.save(Category.builder().name(name).build());
            }
        }
    }
}
