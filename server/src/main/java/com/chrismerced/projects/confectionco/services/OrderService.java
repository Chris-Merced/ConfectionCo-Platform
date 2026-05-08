package com.chrismerced.projects.confectionco.services;

import java.math.BigDecimal;

import org.springframework.stereotype.Service;

import com.chrismerced.projects.confectionco.exceptions.ResourceNotFoundException;
import com.chrismerced.projects.confectionco.model.Order;
import com.chrismerced.projects.confectionco.model.OrderStatus;
import com.chrismerced.projects.confectionco.repository.OrderRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final StripeService stripeService;
    private final ObjectMapper objectMapper;

    OrderService(OrderRepository orderRepository, StripeService stripeService, ObjectMapper objectMapper) {
        this.orderRepository = orderRepository;
        this.stripeService = stripeService;
        this.objectMapper = objectMapper;
    }

    public void updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));
        order.setStatus(status);
        orderRepository.save(order);
    }

    public String generateDepositLink(Long orderId, BigDecimal totalAmount) throws Exception {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        order.setTotalAmount(totalAmount);
        order.setStatus(OrderStatus.AWAITING_DEPOSIT);

        long amountInCents = totalAmount.multiply(BigDecimal.valueOf(100)).longValue();
        Session session = stripeService.createDepositCheckout(orderId, amountInCents);

        order.setStripeSessionId(session.getId());
        orderRepository.save(order);

        return session.getUrl();
    }

    public String generateFinalPaymentLink(Long orderId, BigDecimal amount) throws Exception {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        order.setStatus(OrderStatus.AWAITING_FINAL_PAYMENT);

        long amountInCents = amount.multiply(BigDecimal.valueOf(100)).longValue();
        Session session = stripeService.createFinalPaymentCheckout(orderId, amountInCents);

        order.setStripeSessionId(session.getId());
        orderRepository.save(order);

        return session.getUrl();
    }

    public void handleStripeEvent(Event event, String rawPayload) {
        switch (event.getType()) {
            case "checkout.session.completed" -> {
                try {
                    com.fasterxml.jackson.databind.JsonNode dataObject = objectMapper.readTree(rawPayload)
                            .path("data").path("object");
                    String orderId = dataObject.path("metadata").path("orderId").asText(null);
                    String orderType = dataObject.path("metadata").path("orderType").asText(null);
                    if (orderId == null || orderType == null) {
                        System.out.println("Missing metadata in event: " + event.getId());
                        return;
                    }
                    handleStripeCheckoutCompleted(Long.valueOf(orderId), orderType);
                } catch (Exception e) {
                    System.out.println("Failed to process checkout.session.completed " + event.getId() + ": " + e.getMessage());
                }
            }

            default -> System.out.println("Unhandled event: " + event.getType());
        }
    }

    private void handleStripeCheckoutCompleted(Long orderId, String orderType) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        if ("deposit".equals(orderType)) {
            order.setDepositPaid(true);
            order.setStatus(OrderStatus.IN_PROGRESS);
        } else if ("final".equals(orderType)) {
            order.setFullPaymentPaid(true);
            order.setStatus(OrderStatus.PAID_IN_FULL);
        }

        orderRepository.save(order);
    }
}
