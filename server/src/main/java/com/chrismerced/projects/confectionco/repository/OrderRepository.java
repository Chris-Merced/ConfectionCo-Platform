package com.chrismerced.projects.confectionco.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.chrismerced.projects.confectionco.model.Order;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByStatusNot(String status);
}