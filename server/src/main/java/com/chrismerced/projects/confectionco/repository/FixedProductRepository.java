package com.chrismerced.projects.confectionco.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.chrismerced.projects.confectionco.model.FixedProduct;

public interface FixedProductRepository extends JpaRepository<FixedProduct, Long> {
    List<FixedProduct> findByActiveTrue();
}
