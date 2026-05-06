package com.chrismerced.projects.confectionco.api;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chrismerced.projects.confectionco.model.Order;
import com.chrismerced.projects.confectionco.repository.OrderRepository;

@RestController
@RequestMapping("api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final OrderRepository orderRepository;

    AdminController(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getActiveOrders() {
        try {
            return ResponseEntity.ok(orderRepository.findByStatusNot("COMPLETED"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to retrieve orders");
        }
    }

    @GetMapping("/authentication")
    public Map<String, String> auth() {
        return Map.of("Success", "ok");
    }
}
