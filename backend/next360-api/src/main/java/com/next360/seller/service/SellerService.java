package com.next360.seller.service;

import com.next360.common.enums.UserRole;
import com.next360.common.exception.ResourceNotFoundException;
import com.next360.seller.dto.*;
import com.next360.seller.entity.SellerEntity;
import com.next360.seller.repository.SellerRepository;
import com.next360.user.entity.UserEntity;
import com.next360.user.entity.UserRoleEntity;
import com.next360.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Seller registration and profile management service.
 */
@Service
public class SellerService {

    private static final Logger log = LoggerFactory.getLogger(SellerService.class);

    private final SellerRepository sellerRepository;
    private final UserRepository userRepository;

    public SellerService(SellerRepository sellerRepository, UserRepository userRepository) {
        this.sellerRepository = sellerRepository;
        this.userRepository = userRepository;
    }

    /**
     * Register the current user as a seller.
     * Creates a seller profile and adds SELLER role.
     */
    @Transactional
    public SellerProfileResponse registerAsSeller(UUID userId, SellerRegistrationRequest request) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));

        // Check if already a seller
        if (sellerRepository.existsByUserId(userId)) {
            throw new IllegalStateException("You are already registered as a seller");
        }

        // Create seller entity
        SellerEntity seller = new SellerEntity();
        seller.setUser(user);
        seller.setBusinessName(request.getBusinessName());
        seller.setBusinessDescription(request.getBusinessDescription());
        seller.setBusinessAddress(request.getBusinessAddress());
        seller.setPhone(request.getPhone());
        seller.setEmail(request.getEmail());
        seller.setGstin(request.getGstin());
        seller.setPanNumber(request.getPanNumber());
        seller.setLocation(request.getLocation());

        seller = sellerRepository.save(seller);

        // Add SELLER role to user
        boolean hasSellerRole = user.getRoles().stream()
                .anyMatch(r -> r.getRole() == UserRole.SELLER);

        if (!hasSellerRole) {
            UserRoleEntity sellerRole = new UserRoleEntity(user, UserRole.SELLER);
            user.addRole(sellerRole);
            userRepository.save(user);
        }

        log.info("User {} registered as seller: {}", userId, seller.getId());
        return mapToProfileResponse(seller);
    }

    /**
     * Get the seller's own profile.
     */
    @Transactional(readOnly = true)
    public SellerProfileResponse getSellerProfile(UUID userId) {
        SellerEntity seller = findSellerByUserOrThrow(userId);
        return mapToProfileResponse(seller);
    }

    /**
     * Update seller's own business profile.
     */
    @Transactional
    public SellerProfileResponse updateSellerProfile(UUID userId, UpdateSellerRequest request) {
        SellerEntity seller = findSellerByUserOrThrow(userId);

        if (request.getBusinessName() != null) {
            seller.setBusinessName(request.getBusinessName());
        }
        if (request.getBusinessDescription() != null) {
            seller.setBusinessDescription(request.getBusinessDescription());
        }
        if (request.getBusinessAddress() != null) {
            seller.setBusinessAddress(request.getBusinessAddress());
        }
        if (request.getEmail() != null) {
            seller.setEmail(request.getEmail());
        }
        if (request.getLogoUrl() != null) {
            seller.setLogoUrl(request.getLogoUrl());
        }
        if (request.getBannerUrl() != null) {
            seller.setBannerUrl(request.getBannerUrl());
        }
        if (request.getLocation() != null) {
            seller.setLocation(request.getLocation());
        }

        seller = sellerRepository.save(seller);
        log.info("Seller profile updated for user {}", userId);
        return mapToProfileResponse(seller);
    }

    /**
     * Get public-facing seller profile (for buyers browsing).
     */
    @Transactional(readOnly = true)
    public PublicSellerResponse getPublicProfile(UUID sellerId) {
        SellerEntity seller = sellerRepository.findById(sellerId)
                .orElseThrow(() -> new ResourceNotFoundException("Seller", sellerId.toString()));

        return PublicSellerResponse.builder()
                .id(seller.getId())
                .businessName(seller.getBusinessName())
                .businessDescription(seller.getBusinessDescription())
                .logoUrl(seller.getLogoUrl())
                .bannerUrl(seller.getBannerUrl())
                .location(seller.getLocation())
                .rating(seller.getRating())
                .totalOrders(seller.getTotalOrders())
                .totalProducts(seller.getTotalProducts())
                .memberSince(seller.getCreatedAt())
                .build();
    }

    // ==================== Private Helpers ====================

    private SellerEntity findSellerByUserOrThrow(UUID userId) {
        return sellerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Seller", "userId=" + userId));
    }

    private SellerProfileResponse mapToProfileResponse(SellerEntity seller) {
        String userName = null;
        if (seller.getUser() != null) {
            userName = seller.getUser().getName();
        }

        return SellerProfileResponse.builder()
                .id(seller.getId())
                .userId(seller.getUser().getId())
                .userName(userName)
                .businessName(seller.getBusinessName())
                .businessDescription(seller.getBusinessDescription())
                .businessAddress(seller.getBusinessAddress())
                .gstin(seller.getGstin())
                .panNumber(seller.getPanNumber())
                .phone(seller.getPhone())
                .email(seller.getEmail())
                .logoUrl(seller.getLogoUrl())
                .bannerUrl(seller.getBannerUrl())
                .location(seller.getLocation())
                .status(seller.getStatus())
                .kycStatus(seller.getKycStatus())
                .rating(seller.getRating())
                .totalOrders(seller.getTotalOrders())
                .totalProducts(seller.getTotalProducts())
                .commissionPercentage(seller.getCommissionPercentage())
                .createdAt(seller.getCreatedAt())
                .updatedAt(seller.getUpdatedAt())
                .build();
    }
}
