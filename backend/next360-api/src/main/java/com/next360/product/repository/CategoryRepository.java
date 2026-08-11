package com.next360.product.repository;

import com.next360.product.entity.CategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<CategoryEntity, UUID> {

    Optional<CategoryEntity> findBySlug(String slug);

    boolean existsBySlug(String slug);

    List<CategoryEntity> findByParentId(UUID parentId);

    @Query("SELECT c FROM CategoryEntity c WHERE c.parent IS NULL ORDER BY c.name")
    List<CategoryEntity> findRootCategories();
}
