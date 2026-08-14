package com.next360.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * S3 storage settings (prefix {@code next360.s3}).
 */
@Component
@ConfigurationProperties(prefix = "next360.s3")
public class S3Properties {

    private String bucket = "next360-uploads";
    private String region = "ap-south-1";
    private String accessKeyId = "";
    private String secretAccessKey = "";

    /** S3-compatible endpoint override (MinIO/LocalStack). Blank means real AWS. */
    private String endpoint = "";

    /** Required by most S3-compatible servers. */
    private boolean pathStyleAccess = false;

    /** CDN origin used to build public URLs, e.g. {@code https://cdn.next360.in}. */
    private String publicBaseUrl = "";

    private int presignUploadTtlSeconds = 600;
    private int presignDownloadTtlSeconds = 3600;
    private long maxFileSizeBytes = 10L * 1024 * 1024;

    /** Folders whose objects must never be exposed via a public URL. */
    private List<String> privateFolders = List.of("kyc", "certificates");

    public boolean hasStaticCredentials() {
        return accessKeyId != null && !accessKeyId.isBlank()
                && secretAccessKey != null && !secretAccessKey.isBlank();
    }

    public boolean isPrivateFolder(String folder) {
        return privateFolders != null && privateFolders.contains(folder);
    }

    public String getBucket() { return bucket; }
    public void setBucket(String bucket) { this.bucket = bucket; }

    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }

    public String getAccessKeyId() { return accessKeyId; }
    public void setAccessKeyId(String accessKeyId) { this.accessKeyId = accessKeyId; }

    public String getSecretAccessKey() { return secretAccessKey; }
    public void setSecretAccessKey(String secretAccessKey) { this.secretAccessKey = secretAccessKey; }

    public String getEndpoint() { return endpoint; }
    public void setEndpoint(String endpoint) { this.endpoint = endpoint; }

    public boolean isPathStyleAccess() { return pathStyleAccess; }
    public void setPathStyleAccess(boolean pathStyleAccess) { this.pathStyleAccess = pathStyleAccess; }

    public String getPublicBaseUrl() { return publicBaseUrl; }
    public void setPublicBaseUrl(String publicBaseUrl) { this.publicBaseUrl = publicBaseUrl; }

    public int getPresignUploadTtlSeconds() { return presignUploadTtlSeconds; }
    public void setPresignUploadTtlSeconds(int presignUploadTtlSeconds) { this.presignUploadTtlSeconds = presignUploadTtlSeconds; }

    public int getPresignDownloadTtlSeconds() { return presignDownloadTtlSeconds; }
    public void setPresignDownloadTtlSeconds(int presignDownloadTtlSeconds) { this.presignDownloadTtlSeconds = presignDownloadTtlSeconds; }

    public long getMaxFileSizeBytes() { return maxFileSizeBytes; }
    public void setMaxFileSizeBytes(long maxFileSizeBytes) { this.maxFileSizeBytes = maxFileSizeBytes; }

    public List<String> getPrivateFolders() { return privateFolders; }
    public void setPrivateFolders(List<String> privateFolders) { this.privateFolders = privateFolders; }
}
