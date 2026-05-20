package com.chrismerced.projects.confectionco.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.chrismerced.projects.confectionco.model.Order;
import com.chrismerced.projects.confectionco.model.OrderStatus;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByStatusNotIn(Collection<OrderStatus> statuses);

    Optional<Order> findByStripeRefundId(String stripeRefundId);

    List<Order> findByPhoneNumber(String phoneNumber);
}