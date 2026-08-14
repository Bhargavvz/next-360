package com.next360.admin.service;

import com.next360.admin.dto.AdminStatsResponse;
import com.next360.admin.dto.VerificationDecisionRequest;
import com.next360.common.enums.*;
import com.next360.common.exception.ResourceNotFoundException;
import com.next360.product.dto.CertificateResponse;
import com.next360.product.dto.ProductCardResponse;
import com.next360.product.entity.CertificateEntity;
import com.next360.product.entity.ProductEntity;
import com.next360.product.entity.ProductImageEntity;
import com.next360.product.repository.CertificateRepository;
import com.next360.product.repository.ProductRepository;
import com.next360.product.service.CertificateService;
import com.next360.seller.dto.KycResponse;
import com.next360.seller.entity.SellerEntity;
import com.next360.seller.entity.SellerKycEntity;
import com.next360.seller.repository.SellerKycRepository;
import com.next360.seller.repository.SellerRepository;
import com.next360.seller.service.KycService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

/**
 * Admin verification workflows for certificates, KYC, sellers, and products.
 * This is the trust engine of Next360.
 */
@Service
public class AdminVerificationService {

    private static final Logger log = LoggerFactory.getLogger(AdminVerificationService.class);

    private final CertificateRepository certificateRepository;
    private final CertificateService certificateService;
    private final SellerKycRepository kycRepository;
    private final KycService kycService;
    private final SellerRepository sellerRepository;
    private final ProductRepository productRepository;

    public AdminVerificationService(CertificateRepository certificateRepository,
                                     CertificateService certificateService,
                                     SellerKycRepository kycRepository,
                                     KycService kycService,
                                     SellerRepository sellerRepository,
                                     ProductRepository productRepository) {
        this.certificateRepository = certificateRepository;
        this.certificateService = certificateService;
        this.kycRepository = kycRepository;
        this.kycService = kycService;
        this.sellerRepository = sellerRepository;
        this.productRepository = productRepository;
    }

    // ==================== Dashboard Stats ====================

    @Transactional(readOnly = true)
    public AdminStatsResponse getAdminStats() {
        return AdminStatsResponse.builder()
                .pendingCertificates(certificateRepository.findByStatus(CertificateStatus.PENDING, Pageable.unpaged()).getTotalElements())
                .pendingKyc(kycRepository.countByStatus(KycStatus.PENDING))
                .pendingSellers(sellerRepository.countByStatus(SellerStatus.PENDING))
                .pendingProducts(productRepository.findByStatus(ProductStatus.PENDING, Pageable.unpaged()).getTotalElements())
                .totalSellers(sellerRepository.count())
                .totalProducts(productRepository.count())
                .approvedProducts(productRepository.findByStatus(ProductStatus.APPROVED, Pageable.unpaged()).getTotalElements())
                .build();
    }

    // ==================== Certificate Review ====================

    @Transactional(readOnly = true)
    public Page<CertificateResponse> getPendingCertificates(Pageable pageable) {
        return certificateRepository.findByStatus(CertificateStatus.PENDING, pageable)
                .map(certificateService::mapToResponse);
    }

    @Transactional
    public CertificateResponse reviewCertificate(UUID certId, VerificationDecisionRequest decision, String adminName) {
        CertificateEntity cert = certificateRepository.findById(certId)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate", certId.toString()));

        if (decision.getApproved()) {
            cert.setStatus(CertificateStatus.APPROVED);
            cert.setVerifiedAt(Instant.now());
            cert.setVerifiedBy(adminName);
            cert.setRejectionReason(null);
            log.info("Certificate {} APPROVED by {}", certId, adminName);
        } else {
            cert.setStatus(CertificateStatus.REJECTED);
            cert.setRejectionReason(decision.getReason());
            cert.setVerifiedAt(Instant.now());
            cert.setVerifiedBy(adminName);
            log.info("Certificate {} REJECTED by {}: {}", certId, adminName, decision.getReason());
        }

        cert = certificateRepository.save(cert);

        // Recompute isVerifiedOrganic for the product
        certificateService.updateVerifiedOrganic(cert.getProduct().getId());

        return certificateService.mapToResponse(cert);
    }

    // ==================== KYC Review ====================

    @Transactional(readOnly = true)
    public Page<KycResponse> getPendingKyc(Pageable pageable) {
        // We need pending KYC across all sellers
        return kycRepository.findAll(pageable)
                .map(kycService::mapToResponse);
    }

    @Transactional
    public KycResponse reviewKyc(UUID kycId, VerificationDecisionRequest decision, String adminName) {
        SellerKycEntity kyc = kycRepository.findById(kycId)
                .orElseThrow(() -> new ResourceNotFoundException("KYC Document", kycId.toString()));

        if (decision.getApproved()) {
            kyc.setStatus(KycStatus.APPROVED);
            kyc.setVerifiedAt(Instant.now());
            kyc.setVerifiedBy(adminName);
            kyc.setRejectionReason(null);
            log.info("KYC {} APPROVED by {}", kycId, adminName);
        } else {
            kyc.setStatus(KycStatus.REJECTED);
            kyc.setRejectionReason(decision.getReason());
            kyc.setVerifiedAt(Instant.now());
            kyc.setVerifiedBy(adminName);
            log.info("KYC {} REJECTED by {}: {}", kycId, adminName, decision.getReason());
        }

        kyc = kycRepository.save(kyc);

        // Recompute seller's overall KYC status
        kycService.updateSellerKycStatus(kyc.getSeller().getId());

        return kycService.mapToResponse(kyc);
    }

    // ==================== Seller Review ====================

    @Transactional(readOnly = true)
    public Page<SellerEntity> getPendingSellers(Pageable pageable) {
        return sellerRepository.findByStatus(SellerStatus.PENDING, pageable);
    }

    @Transactional
    public void reviewSeller(UUID sellerId, VerificationDecisionRequest decision, String adminName) {
        SellerEntity seller = sellerRepository.findById(sellerId)
                .orElseThrow(() -> new ResourceNotFoundException("Seller", sellerId.toString()));

        if (decision.getApproved()) {
            seller.setStatus(SellerStatus.APPROVED);
            log.info("Seller {} APPROVED by {}", sellerId, adminName);
        } else {
            seller.setStatus(SellerStatus.REJECTED);
            log.info("Seller {} REJECTED by {}: {}", sellerId, adminName, decision.getReason());
        }

        sellerRepository.save(seller);

        // Recompute isVerifiedOrganic for all seller's products
        productRepository.findBySellerId(seller.getId(), Pageable.unpaged())
                .forEach(product -> certificateService.updateVerifiedOrganic(product.getId()));
    }

    // ==================== Product Review ====================

    @Transactional(readOnly = true)
    public Page<ProductCardResponse> getPendingProducts(Pageable pageable) {
        return productRepository.findByStatus(ProductStatus.PENDING, pageable)
                .map(this::mapProductToCard);
    }

    private ProductCardResponse mapProductToCard(ProductEntity product) {
        String primaryImage = product.getImages().stream()
                .filter(ProductImageEntity::isPrimary)
                .findFirst()
                .map(ProductImageEntity::getUrl)
                .orElse(product.getImages().isEmpty() ? null : product.getImages().get(0).getUrl());
        return ProductCardResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .imageUrl(primaryImage)
                .price(product.getPrice())
                .mrp(product.getMrp())
                .rating(product.getRating())
                .reviewCount(product.getReviewCount())
                .verifiedOrganic(product.isVerifiedOrganic())
                .sellerName(product.getSeller() != null ? product.getSeller().getBusinessName() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .inStock(product.getStock() > 0)
                .productType(product.getProductType())
                .build();
    }

    @Transactional
    public void reviewProduct(UUID productId, VerificationDecisionRequest decision, String adminName) {
        ProductEntity product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", productId.toString()));

        if (decision.getApproved()) {
            product.setStatus(ProductStatus.APPROVED);
            log.info("Product {} APPROVED by {}", productId, adminName);
        } else {
            product.setStatus(ProductStatus.REJECTED);
            log.info("Product {} REJECTED by {}: {}", productId, adminName, decision.getReason());
        }

        productRepository.save(product);

        // Recompute isVerifiedOrganic
        certificateService.updateVerifiedOrganic(productId);
    }
}
