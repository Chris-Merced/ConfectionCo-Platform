package com.chrismerced.projects.confectionco.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.chrismerced.projects.confectionco.model.OrderItemPhoto;

public interface OrderItemPhotoRepository extends JpaRepository<OrderItemPhoto, Long> {
    List<OrderItemPhoto> findByOrderCustomItemId(Long orderCustomItemId);
    List<OrderItemPhoto> findByOrderCustomItem_OrderId(Long orderId);
}
