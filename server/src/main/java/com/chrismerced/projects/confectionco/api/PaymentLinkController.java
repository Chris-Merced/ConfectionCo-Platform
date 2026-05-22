package com.chrismerced.projects.confectionco.api;

import java.net.URI;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.chrismerced.projects.confectionco.model.Order;
import com.chrismerced.projects.confectionco.repository.OrderRepository;

@RestController
public class PaymentLinkController {

    private final OrderRepository orderRepository;

    PaymentLinkController(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @GetMapping("/pay/{token}")
    public ResponseEntity<Void> redirect(@PathVariable String token) {
        return orderRepository.findByPaymentLinkToken(token)
                .map(Order::getPaymentLinkUrl)
                .map(url -> ResponseEntity.<Void>status(HttpStatus.FOUND).location(URI.create(url)).build())
                .orElse(ResponseEntity.notFound().build());
    }
}
