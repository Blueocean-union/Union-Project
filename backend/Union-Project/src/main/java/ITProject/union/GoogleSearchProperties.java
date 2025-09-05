package ITProject.union;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "google.search")
@Getter
@Setter
public class GoogleSearchProperties {
    private String apiKey;
    private String cx;
    private DefaultProps defaultProps = new DefaultProps();
    @Getter @Setter
    public static class DefaultProps {
        private String gl;
        private String lr;
        private Integer num;
        private String safe;
    }
}
