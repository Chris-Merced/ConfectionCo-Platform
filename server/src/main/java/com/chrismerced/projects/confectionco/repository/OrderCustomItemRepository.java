package com.chrismerced.projects.confectionco.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.chrismerced.projects.confectionco.model.OrderCustomItem;

public interface OrderCustomItemRepository extends JpaRepository<OrderCustomItem, Long> {
    List<OrderCustomItem> findByOrderId(Long orderId);
}
