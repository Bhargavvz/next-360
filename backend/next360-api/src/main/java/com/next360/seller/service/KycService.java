package com.next360.seller.service;

import com.next360.common.enums.KycStatus;
import com.next360.common.exception.ResourceNotFoundException;
import com.next360.seller.dto.KycResponse;
import com.next360.seller.dto.KycUploadRequest;
import com.next360.seller.entity.SellerEntity;
import com.next360.seller.entity.SellerKycEntity;
import com.next360.seller.repository.SellerKycRepository;
import com.next360.seller.repository.SellerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Seller KYC document management.
 */
@Service
public class KycService {

    private static final Logger log = LoggerFactory.getLogger(KycService.class);

    private final SellerKycRepository kycRepository;
    private final SellerRepository sellerRepository;

    public KycService(SellerKycRepository kycRepository, SellerRepository sellerRepository) {
        this.kycRepository = kycRepository;
        this.sellerRepository = sellerRepository;
    }

    /**
     * Upload a KYC document.
     */
    @Transactional
    public KycResponse uploadKycDocument(UUID userId, KycUploadRequest request) {
        SellerEntity seller = sellerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Seller", "userId=" + userId));

        SellerKycEntity kyc = new SellerKycEntity();
        kyc.setSeller(seller);
        kyc.setDocumentType(request.getDocumentType());
        kyc.setDocumentUrl(request.getDocumentUrl());
        kyc.setStatus(KycStatus.PENDING);

        kyc = kycRepository.save(kyc);

        // Update seller KYC status to PENDING if NOT_SUBMITTED
        if (KycStatus.NOT_SUBMITTED.equals(seller.getKycStatus())) {
            seller.setKycStatus(KycStatus.PENDING);
            sellerRepository.save(seller);
        }

        log.info("KYC document uploaded for seller {}: {} ({})", seller.getId(), kyc.getId(), request.getDocumentType());
        return mapToResponse(kyc);
    }

    /**
     * Get all KYC documents for the seller.
     */
    @Transactional(readOnly = true)
    public List<KycResponse> getMyKycDocuments(UUID userId) {
        SellerEntity seller = sellerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Seller", "userId=" + userId));
        return kycRepository.findBySellerId(seller.getId()).stream()
                .map(this::mapToResponse)
                .toList();
    }

    /**
     * Recompute seller's overall KYC status based on individual document statuses.
     */
    @Transactional
    public void updateSellerKycStatus(UUID sellerId) {
        SellerEntity seller = sellerRepository.findById(sellerId)
                .orElseThrow(() -> new ResourceNotFoundException("Seller", sellerId.toString()));

        List<SellerKycEntity> docs = kycRepository.findBySellerId(sellerId);

        if (docs.isEmpty()) {
            seller.setKycStatus(KycStatus.NOT_SUBMITTED);
        } else {
            boolean allApproved = docs.stream().allMatch(d -> KycStatus.APPROVED.equals(d.getStatus()));
            boolean anyRejected = docs.stream().anyMatch(d -> KycStatus.REJECTED.equals(d.getStatus()));
            boolean anyPending = docs.stream().anyMatch(d -> KycStatus.PENDING.equals(d.getStatus()));

            if (allApproved) {
                seller.setKycStatus(KycStatus.APPROVED);
            } else if (anyRejected) {
                seller.setKycStatus(KycStatus.REJECTED);
            } else if (anyPending) {
                seller.setKycStatus(KycStatus.PENDING);
            }
        }

        sellerRepository.save(seller);
        log.info("Seller {} KYC status updated to {}", sellerId, seller.getKycStatus());
    }

    public KycResponse mapToResponse(SellerKycEntity kyc) {
        return KycResponse.builder()
                .id(kyc.getId())
                .documentType(kyc.getDocumentType())
                .documentUrl(kyc.getDocumentUrl())
                .status(kyc.getStatus())
                .rejectionReason(kyc.getRejectionReason())
                .uploadedAt(kyc.getUploadedAt())
                .verifiedAt(kyc.getVerifiedAt())
                .verifiedBy(kyc.getVerifiedBy())
                .build();
    }
}
