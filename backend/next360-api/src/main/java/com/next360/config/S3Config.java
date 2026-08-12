package com.next360.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

/**
 * AWS S3 configuration — creates the S3Client and S3Presigner beans.
 */
@Configuration
public class S3Config {

    @Value("${AWS_ACCESS_KEY_ID:}")
    private String accessKeyId;

    @Value("${AWS_SECRET_ACCESS_KEY:}")
    private String secretAccessKey;

    @Value("${AWS_REGION:ap-south-1}")
    private String region;

    @Bean
    public S3Client s3Client() {
        if (accessKeyId.isBlank() || secretAccessKey.isBlank()) {
            // Fallback to default credential chain (IAM roles, env vars, etc.)
            return S3Client.builder()
                    .region(Region.of(region))
                    .build();
        }

        return S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKeyId, secretAccessKey)))
                .build();
    }

    @Bean
    public S3Presigner s3Presigner() {
        if (accessKeyId.isBlank() || secretAccessKey.isBlank()) {
            return S3Presigner.builder()
                    .region(Region.of(region))
                    .build();
        }

        return S3Presigner.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKeyId, secretAccessKey)))
                .build();
    }
}
