package ITProject.union;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3ClientBuilder;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import java.net.URI;
import java.util.Optional;

@Configuration
public class AwsS3Config {

    @Bean
    public S3Client s3Client(
            @Value("${aws.region}") String region,
            @Value("${aws.s3.endpoint:}") Optional<String> endpoint // 일반적으로 빈 값(=AWS 공식 엔드포인트 자동 사용)
    ) {
        S3ClientBuilder builder = S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(DefaultCredentialsProvider.create());

        // 로컬/특수 엔드포인트(예: MinIO, LocalStack) 쓰는 경우에만 설정
        endpoint.filter(s -> !s.isBlank())
                .ifPresent(url -> builder.endpointOverride(URI.create(url)));

        return builder.build();
    }

    @Bean
    public S3Presigner s3Presigner(
            @Value("${aws.region}") String region,
            @Value("${aws.s3.endpoint:}") Optional<String> endpoint
    ) {
        S3Presigner.Builder builder = S3Presigner.builder()
                .region(Region.of(region))
                .credentialsProvider(DefaultCredentialsProvider.create());

        endpoint.filter(s -> !s.isBlank())
                .ifPresent(url -> builder.endpointOverride(URI.create(url)));

        return builder.build();
    }
}