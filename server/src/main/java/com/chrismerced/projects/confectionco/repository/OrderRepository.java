package com.chrismerced.projects.confectionco.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.chrismerced.projects.confectionco.model.Order;
import com.chrismerced.projects.confectionco.model.OrderStatus;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByStatusNot(OrderStatus status);
}