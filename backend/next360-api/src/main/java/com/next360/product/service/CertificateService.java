package com.next360.product.service;

import com.next360.common.enums.CertificateStatus;
import com.next360.common.exception.ResourceNotFoundException;
import com.next360.product.dto.CertificateRequest;
import com.next360.product.dto.CertificateResponse;
import com.next360.product.entity.CertificateEntity;
import com.next360.product.entity.ProductEntity;
import com.next360.product.repository.CertificateRepository;
import com.next360.product.repository.ProductRepository;
import com.next360.seller.entity.SellerEntity;
import com.next360.seller.repository.SellerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Certificate upload and trust verification service.
 * Central to Next360's trust-first identity.
 */
@Service
public class CertificateService {

    private static final Logger log = LoggerFactory.getLogger(CertificateService.class);

    private final CertificateRepository certificateRepository;
    private final ProductRepository productRepository;
    private final SellerRepository sellerRepository;

    public CertificateService(CertificateRepository certificateRepository,
                              ProductRepository productRepository,
                              SellerRepository sellerRepository) {
        this.certificateRepository = certificateRepository;
        this.productRepository = productRepository;
        this.sellerRepository = sellerRepository;
    }

    /**
     * Upload a certificate for a product (seller must own the product).
     */
    @Transactional
    public CertificateResponse uploadCertificate(UUID userId, CertificateRequest request) {
        SellerEntity seller = sellerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Seller", "userId=" + userId));

        ProductEntity product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", request.getProductId().toString()));

        // Ownership check
        if (!product.getSeller().getId().equals(seller.getId())) {
            throw new IllegalArgumentException("Product does not belong to this seller");
        }

        // Validate dates
        if (request.getExpiryDate().isBefore(request.getIssueDate())) {
            throw new IllegalArgumentException("Expiry date must be after issue date");
        }

        CertificateEntity cert = new CertificateEntity();
        cert.setCertificateNumber(request.getCertificateNumber());
        cert.setCertificationBody(request.getCertificationBody());
        cert.setSeller(seller);
        cert.setProduct(product);
        cert.setIssueDate(request.getIssueDate());
        cert.setExpiryDate(request.getExpiryDate());
        cert.setDocumentUrl(request.getDocumentUrl());
        cert.setStatus(CertificateStatus.PENDING);

        cert = certificateRepository.save(cert);
        log.info("Certificate uploaded for product {}: {}", product.getId(), cert.getId());
        return mapToResponse(cert);
    }

    /**
     * Get all certificates for a product (public).
     */
    @Transactional(readOnly = true)
    public List<CertificateResponse> getProductCertificates(UUID productId) {
        return certificateRepository.findByProductId(productId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    /**
     * Get all certificates for the seller's own products.
     */
    @Transactional(readOnly = true)
    public List<CertificateResponse> getSellerCertificates(UUID userId) {
        SellerEntity seller = sellerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Seller", "userId=" + userId));
        return certificateRepository.findBySellerId(seller.getId()).stream()
                .map(this::mapToResponse)
                .toList();
    }

    /**
     * Recompute isVerifiedOrganic for a product based on trust rules:
     * ORGANIC type + APPROVED product + APPROVED seller + APPROVED cert + not expired
     */
    @Transactional
    public void updateVerifiedOrganic(UUID productId) {
        ProductEntity product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", productId.toString()));

        boolean isVerified = com.next360.common.enums.ProductType.ORGANIC.equals(product.getProductType())
                && com.next360.common.enums.ProductStatus.APPROVED.equals(product.getStatus())
                && com.next360.common.enums.SellerStatus.APPROVED.equals(product.getSeller().getStatus())
                && certificateRepository.findByProductId(productId).stream()
                    .anyMatch(c -> CertificateStatus.APPROVED.equals(c.getStatus())
                            && c.getExpiryDate().isAfter(LocalDate.now()));

        product.setVerifiedOrganic(isVerified);
        productRepository.save(product);
        log.info("Product {} isVerifiedOrganic={}", productId, isVerified);
    }

    public CertificateResponse mapToResponse(CertificateEntity cert) {
        return CertificateResponse.builder()
                .id(cert.getId())
                .certificateNumber(cert.getCertificateNumber())
                .certificationBody(cert.getCertificationBody())
                .issueDate(cert.getIssueDate())
                .expiryDate(cert.getExpiryDate())
                .documentUrl(cert.getDocumentUrl())
                .status(cert.getStatus())
                .verifiedAt(cert.getVerifiedAt())
                .verifiedBy(cert.getVerifiedBy())
                .rejectionReason(cert.getRejectionReason())
                .revocationReason(cert.getRevocationReason())
                .productId(cert.getProduct().getId())
                .productName(cert.getProduct().getName())
                .productSlug(cert.getProduct().getSlug())
                .sellerId(cert.getSeller().getId())
                .sellerBusinessName(cert.getSeller().getBusinessName())
                .createdAt(cert.getCreatedAt())
                .build();
    }
}
