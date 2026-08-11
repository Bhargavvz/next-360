package com.next360.product.controller;

import com.next360.common.dto.ApiResponse;
import com.next360.product.dto.ProductCardResponse;
import com.next360.product.service.SearchService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Search and discovery endpoints (public).
 */
@RestController
@RequestMapping("/api/v1/search")
public class SearchController {

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductCardResponse>>> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) Boolean verifiedOrganic,
            @RequestParam(defaultValue = "relevance") String sortBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        var sort = "price_asc".equals(sortBy) ? Sort.by("price") :
                   "price_desc".equals(sortBy) ? Sort.by(Sort.Direction.DESC, "price") :
                   "rating".equals(sortBy) ? Sort.by(Sort.Direction.DESC, "rating") :
                   Sort.by(Sort.Direction.DESC, "createdAt");
        var pageable = PageRequest.of(page, Math.min(size, 50), sort);
        var results = searchService.searchProducts(q, categoryId, verifiedOrganic, sortBy, pageable);
        return ResponseEntity.ok(ApiResponse.success(results));
    }

    @GetMapping("/trending")
    public ResponseEntity<ApiResponse<Page<ProductCardResponse>>> getTrending(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        var pageable = PageRequest.of(page, Math.min(size, 20), Sort.by(Sort.Direction.DESC, "rating"));
        var results = searchService.getTrending(pageable);
        return ResponseEntity.ok(ApiResponse.success(results));
    }

    @GetMapping("/verified-organic")
    public ResponseEntity<ApiResponse<Page<ProductCardResponse>>> getVerifiedOrganic(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        var pageable = PageRequest.of(page, Math.min(size, 20), Sort.by(Sort.Direction.DESC, "rating"));
        var results = searchService.getVerifiedOrganic(pageable);
        return ResponseEntity.ok(ApiResponse.success(results));
    }
}
