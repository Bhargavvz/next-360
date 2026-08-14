package com.next360.common.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

/**
 * Registry of objects this API has put into S3.
 *
 * <p>Without it there is no way to tell who owns an object key, so any authenticated
 * user could delete or read anyone else's upload. Ownership checks read from here.
 */
@Entity
@Table(name = "uploads")
@Getter
@Setter
@NoArgsConstructor
public class UploadEntity extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "object_key", nullable = false, unique = true, length = 500)
    private String objectKey;

    @Column(name = "folder", nullable = false, length = 50)
    private String folder;

    @Column(name = "content_type", length = 100)
    private String contentType;

    @Column(name = "size_bytes")
    private Long sizeBytes;

    /** False for kyc/certificate objects, which are only served via presigned URLs. */
    @Column(name = "is_public", nullable = false)
    private boolean isPublic = true;
}
