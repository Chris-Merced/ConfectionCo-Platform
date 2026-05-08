package com.chrismerced.projects.confectionco.services;

import java.math.BigDecimal;

import org.springframework.stereotype.Service;

import com.chrismerced.projects.confectionco.exceptions.ResourceNotFoundException;
import com.chrismerced.projects.confectionco.model.Order;
import com.chrismerced.projects.confectionco.model.OrderStatus;
import com.chrismerced.projects.confectionco.repository.OrderRepository;
import com.chrismerced.projects.confectionco.services.EmailService;
import com.chrismerced.projects.confectionco.services.TextingService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final StripeService stripeService;
    private final ObjectMapper objectMapper;
    private final EmailService emailService;
    private final TextingService textingService;

    OrderService(OrderRepository orderRepository, StripeService stripeService, ObjectMapper objectMapper,
            EmailService emailService, TextingService textingService) {
        this.orderRepository = orderRepository;
        this.stripeService = stripeService;
        this.objectMapper = objectMapper;
        this.emailService = emailService;
        this.textingService = textingService;
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

        String url = session.getUrl();
        textingService.sendText(order.getPhoneNumber(),
                "Hi! Your deposit payment link for your Confection Co. Bakery order is ready: " + url);
        return url;
    }

    public String generateFinalPaymentLink(Long orderId, BigDecimal amount) throws Exception {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        order.setStatus(OrderStatus.AWAITING_FINAL_PAYMENT);

        long amountInCents = amount.multiply(BigDecimal.valueOf(100)).longValue();
        Session session = stripeService.createFinalPaymentCheckout(orderId, amountInCents);

        order.setStripeSessionId(session.getId());
        orderRepository.save(order);

        String url = session.getUrl();
        textingService.sendText(order.getPhoneNumber(),
                "Hi! Your final payment link for your Confection Co. Bakery order is ready: " + url);
        return url;
    }

    public void refundOrder(Long orderId, BigDecimal amount) throws Exception {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        if (order.getStripeSessionId() == null) {
            throw new IllegalArgumentException("No payment session found for this order.");
        }

        long amountInCents = amount.multiply(BigDecimal.valueOf(100)).longValue();
        stripeService.createRefund(order.getStripeSessionId(), amountInCents);

        order.setStatus(OrderStatus.REFUNDED);
        orderRepository.save(order);
    }

    public void handleStripeEvent(Event event, String rawPayload) {
        switch (event.getType()) {
            case "checkout.session.completed" -> {
                com.fasterxml.jackson.databind.JsonNode dataObject;
                try {
                    dataObject = objectMapper.readTree(rawPayload).path("data").path("object");
                } catch (Exception e) {
                    System.err.println("Failed to parse webhook payload for event " + event.getId() + ": " + e.getMessage());
                    return;
                }
                String orderId = dataObject.path("metadata").path("orderId").asText(null);
                String orderType = dataObject.path("metadata").path("orderType").asText(null);
                if (orderId == null || orderType == null) {
                    System.err.println("Missing metadata in event: " + event.getId());
                    return;
                }
                // DB failures propagate — Stripe will retry on non-2xx response
                handleStripeCheckoutCompleted(Long.valueOf(orderId), orderType);
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
            orderRepository.save(order);
            try {
                textingService.sendText(order.getPhoneNumber(),
                        "Great news! Your deposit has been received by Confection Co. Bakery. We're now working on your order!");
            } catch (Exception e) {
                System.err.println("Failed to send deposit text to " + order.getPhoneNumber() + ": " + e.getMessage());
            }
            try {
                emailService.sendDepositReceipt(order.getEmail());
            } catch (Exception e) {
                System.err.println("Failed to send deposit receipt email to " + order.getEmail() + ": " + e.getMessage());
            }
        } else if ("final".equals(orderType)) {
            order.setFullPaymentPaid(true);
            order.setStatus(OrderStatus.PAID_IN_FULL);
            orderRepository.save(order);
            try {
                textingService.sendText(order.getPhoneNumber(),
                        "Your final payment has been received by Confection Co. Bakery. Your order is paid in full — thank you!");
            } catch (Exception e) {
                System.err.println("Failed to send final payment text to " + order.getPhoneNumber() + ": " + e.getMessage());
            }
            try {
                emailService.sendFullPaymentConfirmation(order.getEmail());
            } catch (Exception e) {
                System.err.println("Failed to send final payment email to " + order.getEmail() + ": " + e.getMessage());
            }
        }
    }
}
