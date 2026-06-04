package com.chrismerced.projects.confectionco.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.chrismerced.projects.confectionco.model.ItemSize;

public interface ItemSizeRepository extends JpaRepository<ItemSize, Long> {
    List<ItemSize> findByItemTypeAndActiveTrue(String itemType);
}
