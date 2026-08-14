package com.next360.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import java.net.URI;

/**
 * AWS S3 client wiring.
 *
 * <p>Credentials come from {@code next360.s3.*} when set, otherwise from the default
 * AWS chain (IAM role, shared config, environment) so production can run key-less.
 */
@Configuration
public class S3Config {

    private static final Logger log = LoggerFactory.getLogger(S3Config.class);

    private final S3Properties props;

    public S3Config(S3Properties props) {
        this.props = props;
    }

    @Bean
    public S3Client s3Client() {
        var builder = S3Client.builder()
                .region(Region.of(props.getRegion()))
                .credentialsProvider(credentialsProvider())
                .serviceConfiguration(serviceConfiguration());

        if (!props.getEndpoint().isBlank()) {
            builder.endpointOverride(URI.create(props.getEndpoint()));
        }

        log.info("S3 client configured — bucket={}, region={}, staticCredentials={}",
                props.getBucket(), props.getRegion(), props.hasStaticCredentials());
        return builder.build();
    }

    @Bean
    public S3Presigner s3Presigner() {
        var builder = S3Presigner.builder()
                .region(Region.of(props.getRegion()))
                .credentialsProvider(credentialsProvider())
                .serviceConfiguration(serviceConfiguration());

        if (!props.getEndpoint().isBlank()) {
            builder.endpointOverride(URI.create(props.getEndpoint()));
        }

        return builder.build();
    }

    private AwsCredentialsProvider credentialsProvider() {
        if (props.hasStaticCredentials()) {
            return StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(props.getAccessKeyId(), props.getSecretAccessKey()));
        }
        return DefaultCredentialsProvider.create();
    }

    private S3Configuration serviceConfiguration() {
        return S3Configuration.builder()
                .pathStyleAccessEnabled(props.isPathStyleAccess())
                .build();
    }
}
