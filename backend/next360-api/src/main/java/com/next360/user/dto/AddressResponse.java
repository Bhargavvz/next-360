package com.next360.user.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.next360.common.enums.AddressType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Address response returned from address endpoints.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressResponse {

    private UUID id;
    private AddressType type;
    private String name;
    private String phone;
    private String addressLine1;
    private String addressLine2;
    private String landmark;
    private String city;
    private String state;
    private String pincode;
    @JsonProperty("isDefault")
    private boolean defaultAddress;
    private String deliveryInstructions;
    private Instant createdAt;
    private Instant updatedAt;
}
