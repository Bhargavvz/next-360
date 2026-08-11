package com.next360.user.service;

import com.next360.common.enums.UserRole;
import com.next360.common.exception.ResourceNotFoundException;
import com.next360.user.dto.*;
import com.next360.user.entity.AddressEntity;
import com.next360.user.entity.UserEntity;
import com.next360.user.entity.UserRoleEntity;
import com.next360.user.repository.AddressRepository;
import com.next360.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * User profile and address management service.
 */
@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);
    private static final int MAX_ADDRESSES = 10;

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;

    public UserService(UserRepository userRepository, AddressRepository addressRepository) {
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
    }

    // ==================== Profile ====================

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(UUID userId) {
        UserEntity user = findUserOrThrow(userId);
        return mapToProfileResponse(user);
    }

    @Transactional
    public UserProfileResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        UserEntity user = findUserOrThrow(userId);

        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }

        user = userRepository.save(user);
        log.info("Profile updated for user {}", userId);
        return mapToProfileResponse(user);
    }

    // ==================== Addresses ====================

    @Transactional(readOnly = true)
    public List<AddressResponse> getAddresses(UUID userId) {
        return addressRepository.findByUserId(userId).stream()
                .map(this::mapToAddressResponse)
                .toList();
    }

    @Transactional
    public AddressResponse addAddress(UUID userId, AddressRequest request) {
        UserEntity user = findUserOrThrow(userId);

        long count = addressRepository.countByUserId(userId);
        if (count >= MAX_ADDRESSES) {
            throw new IllegalStateException("Maximum of " + MAX_ADDRESSES + " addresses allowed");
        }

        AddressEntity address = new AddressEntity();
        applyAddressFields(address, request);
        address.setUser(user);

        // Auto-set as default if this is the first address
        if (count == 0) {
            address.setDefault(true);
        } else if (request.isDefault()) {
            clearDefaultAddress(userId);
            address.setDefault(true);
        }

        address = addressRepository.save(address);
        log.info("Address added for user {}: {}", userId, address.getId());
        return mapToAddressResponse(address);
    }

    @Transactional
    public AddressResponse updateAddress(UUID userId, UUID addressId, AddressRequest request) {
        AddressEntity address = findAddressWithOwnership(userId, addressId);
        applyAddressFields(address, request);

        if (request.isDefault() && !address.isDefault()) {
            clearDefaultAddress(userId);
            address.setDefault(true);
        }

        address = addressRepository.save(address);
        log.info("Address {} updated for user {}", addressId, userId);
        return mapToAddressResponse(address);
    }

    @Transactional
    public void deleteAddress(UUID userId, UUID addressId) {
        AddressEntity address = findAddressWithOwnership(userId, addressId);
        boolean wasDefault = address.isDefault();

        addressRepository.delete(address);

        // Reassign default to another address if the deleted one was default
        if (wasDefault) {
            addressRepository.findByUserId(userId).stream()
                    .findFirst()
                    .ifPresent(a -> {
                        a.setDefault(true);
                        addressRepository.save(a);
                    });
        }

        log.info("Address {} deleted for user {}", addressId, userId);
    }

    @Transactional
    public AddressResponse setDefaultAddress(UUID userId, UUID addressId) {
        AddressEntity address = findAddressWithOwnership(userId, addressId);
        clearDefaultAddress(userId);
        address.setDefault(true);
        address = addressRepository.save(address);
        log.info("Default address set to {} for user {}", addressId, userId);
        return mapToAddressResponse(address);
    }

    // ==================== Private Helpers ====================

    private UserEntity findUserOrThrow(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));
    }

    private AddressEntity findAddressWithOwnership(UUID userId, UUID addressId) {
        AddressEntity address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", addressId.toString()));

        if (!address.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Address does not belong to this user");
        }
        return address;
    }

    private void clearDefaultAddress(UUID userId) {
        addressRepository.findByUserIdAndIsDefaultTrue(userId)
                .ifPresent(a -> {
                    a.setDefault(false);
                    addressRepository.save(a);
                });
    }

    private void applyAddressFields(AddressEntity address, AddressRequest request) {
        address.setType(request.getType());
        address.setName(request.getName());
        address.setPhone(request.getPhone());
        address.setAddressLine1(request.getAddressLine1());
        address.setAddressLine2(request.getAddressLine2());
        address.setLandmark(request.getLandmark());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setPincode(request.getPincode());
        address.setDeliveryInstructions(request.getDeliveryInstructions());
    }

    private UserProfileResponse mapToProfileResponse(UserEntity user) {
        List<UserRole> roles = user.getRoles().stream()
                .map(UserRoleEntity::getRole)
                .toList();

        return UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .phone(user.getPhone())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .isPhoneVerified(user.isPhoneVerified())
                .roles(roles)
                .createdAt(user.getCreatedAt())
                .build();
    }

    private AddressResponse mapToAddressResponse(AddressEntity address) {
        return AddressResponse.builder()
                .id(address.getId())
                .type(address.getType())
                .name(address.getName())
                .phone(address.getPhone())
                .addressLine1(address.getAddressLine1())
                .addressLine2(address.getAddressLine2())
                .landmark(address.getLandmark())
                .city(address.getCity())
                .state(address.getState())
                .pincode(address.getPincode())
                .isDefault(address.isDefault())
                .deliveryInstructions(address.getDeliveryInstructions())
                .createdAt(address.getCreatedAt())
                .updatedAt(address.getUpdatedAt())
                .build();
    }
}
