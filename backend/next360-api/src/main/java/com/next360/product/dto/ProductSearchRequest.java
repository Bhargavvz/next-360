package com.next360.product.dto;

import com.next360.common.enums.ProductType;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Search/filter parameters for product listing.
 */
@Data
public class ProductSearchRequest {

    private String query;
    private UUID categoryId;
    private ProductType productType;
    private boolean verifiedOnly = false;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private String sortBy = "createdAt"; // createdAt, price, rating, name
    private String sortDir = "desc";     // asc, desc
    private int page = 0;
    private int size = 20;
}
