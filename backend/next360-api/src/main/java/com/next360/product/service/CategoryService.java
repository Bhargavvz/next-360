package com.next360.product.service;

import com.next360.product.dto.CategoryResponse;
import com.next360.product.entity.CategoryEntity;
import com.next360.product.repository.CategoryRepository;
import com.next360.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Category tree and lookup service.
 */
@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    /**
     * Get full category tree (root categories with children).
     */
    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategoryTree() {
        List<CategoryEntity> roots = categoryRepository.findRootCategories();
        return roots.stream().map(this::mapToResponse).toList();
    }

    /**
     * Get category by slug.
     */
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryBySlug(String slug) {
        CategoryEntity category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Category", slug));
        return mapToResponse(category);
    }

    /**
     * Get category by ID.
     */
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(UUID id) {
        CategoryEntity category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id.toString()));
        return mapToResponse(category);
    }

    private CategoryResponse mapToResponse(CategoryEntity entity) {
        List<CategoryResponse> children = entity.getChildren() != null
                ? entity.getChildren().stream().map(this::mapToResponse).toList()
                : List.of();

        return CategoryResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .slug(entity.getSlug())
                .description(entity.getDescription())
                .imageUrl(entity.getImageUrl())
                .parentId(entity.getParent() != null ? entity.getParent().getId() : null)
                .children(children)
                .build();
    }
}
