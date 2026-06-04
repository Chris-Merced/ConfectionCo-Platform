package com.chrismerced.projects.confectionco.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.chrismerced.projects.confectionco.model.OrderFixedItem;

public interface OrderFixedItemRepository extends JpaRepository<OrderFixedItem, Long> {
    List<OrderFixedItem> findByOrderId(Long orderId);
}
