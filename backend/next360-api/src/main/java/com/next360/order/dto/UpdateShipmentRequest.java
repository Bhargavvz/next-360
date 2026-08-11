package com.next360.order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Seller updates shipment info.
 */
@Data
public class UpdateShipmentRequest {

    @NotBlank(message = "Tracking number is required")
    @Size(max = 100)
    private String trackingNumber;

    @NotBlank(message = "Courier name is required")
    @Size(max = 100)
    private String courierName;
}
