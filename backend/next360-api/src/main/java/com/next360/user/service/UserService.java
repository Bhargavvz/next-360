package com.next360.user.service;

import com.next360.common.enums.OrderStatus;
import com.next360.common.enums.UserRole;
import com.next360.common.exception.ResourceNotFoundException;
import com.next360.order.repository.OrderRepository;
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

import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * User profile and address management service.
 */
@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);
    private static final int MAX_ADDRESSES = 10;

    /** Orders in these states no longer need their shipping address kept around. */
    private static final Set<OrderStatus> TERMINAL_ORDER_STATUSES = EnumSet.of(
            OrderStatus.DELIVERED, OrderStatus.CANCELLED, OrderStatus.RETURNED, OrderStatus.REFUNDED);

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final OrderRepository orderRepository;

    public UserService(UserRepository userRepository,
                       AddressRepository addressRepository,
                       OrderRepository orderRepository) {
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
        this.orderRepository = orderRepository;
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
        return addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId).stream()
                .map(this::mapToAddressResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public AddressResponse getAddress(UUID userId, UUID addressId) {
        return mapToAddressResponse(findAddressWithOwnership(userId, addressId));
    }

    @Transactional
    public AddressResponse addAddress(UUID userId, AddressRequest request) {
        UserEntity user = findUserOrThrow(userId);

        long count = addressRepository.countByUserId(userId);
        if (count >= MAX_ADDRESSES) {
            throw new IllegalStateException("Maximum of " + MAX_ADDRESSES + " addresses allowed");
        }

        // The first address is always the default; after that, only if asked for.
        boolean shouldBeDefault = count == 0 || request.isDefaultAddress();
        if (shouldBeDefault) {
            clearDefaultAddress(userId);
        }

        AddressEntity address = new AddressEntity();
        applyAddressFields(address, request);
        address.setUser(user);
        address.setDefault(shouldBeDefault);

        address = addressRepository.save(address);
        log.info("Address added for user {}: {}", userId, address.getId());
        return mapToAddressResponse(address);
    }

    @Transactional
    public AddressResponse updateAddress(UUID userId, UUID addressId, AddressRequest request) {
        AddressEntity address = findAddressWithOwnership(userId, addressId);
        applyAddressFields(address, request);

        if (request.isDefaultAddress() && !address.isDefault()) {
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

        // Orders keep a foreign key to the address they ship to, so deleting one that is
        // still in flight would fail at the database with an opaque 500.
        boolean inUse = orderRepository.existsByShippingAddressIdAndStatusNotIn(
                addressId, TERMINAL_ORDER_STATUSES);
        if (inUse) {
            throw new IllegalStateException(
                    "This address is used by an order that is still in progress. "
                            + "You can edit it, or delete it once the order is delivered.");
        }

        boolean wasDefault = address.isDefault();
        addressRepository.delete(address);
        // Flush so the reassignment query below cannot see the deleted row.
        addressRepository.flush();

        if (wasDefault) {
            addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId).stream()
                    .findFirst()
                    .ifPresent(next -> {
                        next.setDefault(true);
                        addressRepository.save(next);
                    });
        }

        log.info("Address {} deleted for user {}", addressId, userId);
    }

    @Transactional
    public AddressResponse setDefaultAddress(UUID userId, UUID addressId) {
        AddressEntity address = findAddressWithOwnership(userId, addressId);
        if (address.isDefault()) {
            return mapToAddressResponse(address);
        }

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
        return addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", addressId.toString()));
    }

    /**
     * Clears the current default and flushes immediately. The database enforces one
     * default per user, and Hibernate orders inserts ahead of updates within a flush,
     * so without this the new default would collide with the old one.
     */
    private void clearDefaultAddress(UUID userId) {
        addressRepository.findByUserIdAndIsDefaultTrue(userId)
                .ifPresent(current -> {
                    current.setDefault(false);
                    addressRepository.saveAndFlush(current);
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
                .phoneVerified(user.isPhoneVerified())
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
                .defaultAddress(address.isDefault())
                .deliveryInstructions(address.getDeliveryInstructions())
                .createdAt(address.getCreatedAt())
                .updatedAt(address.getUpdatedAt())
                .build();
    }
}
