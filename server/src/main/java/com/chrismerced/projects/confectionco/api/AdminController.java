package com.chrismerced.projects.confectionco.api;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chrismerced.projects.confectionco.dtos.OrderDTO;
import com.chrismerced.projects.confectionco.repository.OrderRepository;

//TODO:
// Wire up new Resend email
// Create card to hold order data
// 
@RestController
@RequestMapping("api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Value("${aws.bucket-url}")
    private String bucketUrl;

    private final OrderRepository orderRepository;

    AdminController(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getActiveOrders() {
        try {
            List<OrderDTO> orders = orderRepository.findByStatusNot("COMPLETED")
                .stream()
                .map(order -> new OrderDTO(order,bucketUrl))
                .collect(Collectors.toList());
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to retrieve orders");
        }
    }

    @GetMapping("/authentication")
    public Map<String, String> auth() {
        return Map.of("Success", "ok");
    }
}
