package com.chrismerced.projects.confectionco.services;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import com.chrismerced.projects.confectionco.exceptions.ResourceNotFoundException;
import com.chrismerced.projects.confectionco.model.Order;
import com.chrismerced.projects.confectionco.model.OrderStatus;
import com.chrismerced.projects.confectionco.repository.OrderRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stripe.model.Event;
import com.stripe.model.Refund;
import com.stripe.model.checkout.Session;

@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    @Value("${aws.bucket-inspo}")
    private String inspoBucket;

    @Value("${app.owner-phone}")
    private String ownerPhone;

    @Value("${app.base-url}")
    private String baseUrl;

    private static final String TOKEN_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final OrderRepository orderRepository;
    private final StripeService stripeService;
    private final ObjectMapper objectMapper;
    private final EmailService emailService;
    private final TextingService textingService;
    private final S3Service s3Service;
    private final JdbcTemplate jdbcTemplate;

    OrderService(OrderRepository orderRepository, StripeService stripeService, ObjectMapper objectMapper,
            EmailService emailService, TextingService textingService, S3Service s3Service,
            JdbcTemplate jdbcTemplate) {
        this.orderRepository = orderRepository;
        this.stripeService = stripeService;
        this.objectMapper = objectMapper;
        this.emailService = emailService;
        this.textingService = textingService;
        this.s3Service = s3Service;
        this.jdbcTemplate = jdbcTemplate;
    }

    public String advanceOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        switch (order.getStatus()) {
            case PENDING -> {
                order.setDepositPaid(true);
                order.setStatus(OrderStatus.IN_PROGRESS);
            }
            case AWAITING_DEPOSIT -> {
                order.setDepositPaid(true);
                order.setStatus(OrderStatus.IN_PROGRESS);
                order.setPaymentLinkToken(null);
                order.setPaymentLinkUrl(null);
            }
            case IN_PROGRESS -> {
                order.setFullPaymentPaid(true);
                order.setStatus(OrderStatus.PAID_IN_FULL);
            }
            case AWAITING_FINAL_PAYMENT -> {
                order.setFullPaymentPaid(true);
                order.setStatus(OrderStatus.PAID_IN_FULL);
                order.setPaymentLinkToken(null);
                order.setPaymentLinkUrl(null);
            }
            default -> throw new IllegalStateException("Order cannot be manually advanced from status: " + order.getStatus());
        }
        orderRepository.save(order);
        return order.getStatus().name();
    }

    public void updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));
        order.setStatus(status);
        orderRepository.save(order);

        if (status == OrderStatus.REJECTED && order.isSmsConsent()) {
            try {
                textingService.sendText(order.getPhoneNumber(),
                        "Hi! We're sorry, but we're unable to fulfill your Confection Co. Bakery order at this time. " +
                        "We appreciate your interest and hope to serve you in the future!");
            } catch (Exception e) {
                log.error("Failed to send rejection SMS for order {}", orderId, e);
            }
        }
    }

    public String generateDepositLink(Long orderId, BigDecimal orderTotal) throws Exception {
        if (orderTotal == null || orderTotal.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Order total must be greater than zero.");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.AWAITING_DEPOSIT) {
            throw new IllegalStateException("Deposit link can only be generated for PENDING or AWAITING_DEPOSIT orders.");
        }

        BigDecimal depositAmount = orderTotal.multiply(new BigDecimal("0.40")).setScale(2, RoundingMode.HALF_UP);
        order.setTotalAmount(orderTotal);
        order.setDepositAmount(depositAmount);
        order.setStatus(OrderStatus.AWAITING_DEPOSIT);

        long amountInCents = depositAmount.multiply(BigDecimal.valueOf(100)).longValue();
        Session session = stripeService.createDepositCheckout(orderId, amountInCents, order.getEmail());

        String token = generateUniqueToken();
        order.setStripeSessionId(session.getId());
        order.setPaymentLinkToken(token);
        order.setPaymentLinkUrl(session.getUrl());
        orderRepository.save(order);

        String url = baseUrl + "/pay/" + token;
        try {
            emailService.sendDepositPaymentLink(order.getEmail(), url);
        } catch (Exception e) {
            log.error("Failed to send deposit payment link email for order {}", orderId, e);
        }
        if (order.isSmsConsent()) {
            try {
                textingService.sendText(order.getPhoneNumber(),
                        "Hi! Here is your deposit payment link for your Confection Co. Bakery order. " +
                        "A deposit of $" + depositAmount.toPlainString() +
                        " (40% of your $" + orderTotal.toPlainString() + " order total) is due: " + url);
            } catch (Exception e) {
                log.error("Failed to send deposit SMS for order {}", orderId, e);
            }
        }
        return url;
    }

    public String generateFinalPaymentLink(Long orderId, BigDecimal amount) throws Exception {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Final payment amount must be greater than zero.");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        if (order.getStatus() != OrderStatus.IN_PROGRESS && order.getStatus() != OrderStatus.AWAITING_FINAL_PAYMENT) {
            throw new IllegalStateException("Final payment link can only be generated for IN_PROGRESS or AWAITING_FINAL_PAYMENT orders.");
        }

        order.setStatus(OrderStatus.AWAITING_FINAL_PAYMENT);
        order.setFinalPaymentAmount(amount);

        long amountInCents = amount.multiply(BigDecimal.valueOf(100)).longValue();
        Session session = stripeService.createFinalPaymentCheckout(orderId, amountInCents, order.getEmail());

        String token = generateUniqueToken();
        order.setStripeSessionId(session.getId());
        order.setPaymentLinkToken(token);
        order.setPaymentLinkUrl(session.getUrl());
        orderRepository.save(order);

        String url = baseUrl + "/pay/" + token;
        try {
            emailService.sendFinalPaymentLink(order.getEmail(), url);
        } catch (Exception e) {
            log.error("Failed to send final payment link email for order {}", orderId, e);
        }
        if (order.isSmsConsent()) {
            try {
                textingService.sendText(order.getPhoneNumber(),
                        "Hi! Your final payment link for your Confection Co. Bakery order is ready: " + url);
            } catch (Exception e) {
                log.error("Failed to send final payment SMS for order {}", orderId, e);
            }
        }
        return url;
    }

    public void refundOrder(Long orderId, BigDecimal amount) throws Exception {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        if (order.getStatus() != OrderStatus.PAID_IN_FULL && order.getStatus() != OrderStatus.REFUND_PENDING) {
            throw new IllegalArgumentException("Order is not in a refundable state.");
        }

        if (order.getStripeSessionId() == null) {
            throw new IllegalArgumentException("No payment session found for this order.");
        }

        if (order.getStatus() == OrderStatus.REFUND_PENDING && order.getStripeRefundId() != null) {
            com.stripe.model.Refund existing = stripeService.getRefund(order.getStripeRefundId());
            handleStripeRefundUpdated(existing.getId(), existing.getStatus(), existing.getAmount());
            return;
        }

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Refund amount must be greater than zero.");
        }

        if (order.getFinalPaymentAmount() != null && amount.compareTo(order.getFinalPaymentAmount()) > 0) {
            throw new IllegalArgumentException("Refund amount cannot exceed the final payment amount.");
        }

        long amountInCents = amount.multiply(BigDecimal.valueOf(100)).longValue();
        Refund refund = stripeService.createRefund(order.getStripeSessionId(), amountInCents);

        order.setStripeRefundId(refund.getId());
        order.setStatus(OrderStatus.REFUND_PENDING);
        orderRepository.save(order);
    }

    public void handleStripeEvent(Event event, String rawPayload) {
        if (!markEventProcessed(event.getId())) {
            log.info("Duplicate Stripe event ignored: {}", event.getId());
            return;
        }
        switch (event.getType()) {
            case "checkout.session.completed" -> {
                com.fasterxml.jackson.databind.JsonNode dataObject;
                try {
                    dataObject = objectMapper.readTree(rawPayload).path("data").path("object");
                } catch (Exception e) {
                    log.error("Failed to parse webhook payload for event {}", event.getId(), e);
                    return;
                }
                String orderId = dataObject.path("client_reference_id").asText(null);
                if (orderId == null) {
                    log.error("Missing client_reference_id in event: {}", event.getId());
                    return;
                }
                handleStripeCheckoutCompleted(Long.valueOf(orderId));
            }

            case "charge.refund.updated" -> {
                com.fasterxml.jackson.databind.JsonNode dataObject;
                try {
                    dataObject = objectMapper.readTree(rawPayload).path("data").path("object");
                } catch (Exception e) {
                    log.error("Failed to parse refund webhook payload for event {}", event.getId(), e);
                    return;
                }
                String refundId = dataObject.path("id").asText(null);
                String refundStatus = dataObject.path("status").asText(null);
                if (refundId == null || refundStatus == null) {
                    log.error("Missing refund id or status in event: {}", event.getId());
                    return;
                }
                long amountInCents = dataObject.path("amount").asLong(0);
                handleStripeRefundUpdated(refundId, refundStatus, amountInCents > 0 ? amountInCents : null);
            }

            default -> log.info("Unhandled Stripe event: {}", event.getType());
        }
    }

    private void handleStripeRefundUpdated(String refundId, String refundStatus, Long amountInCents) {
        Order order = orderRepository.findByStripeRefundId(refundId).orElse(null);
        if (order == null) {
            log.warn("charge.refund.updated for unknown refund id: {}", refundId);
            return;
        }
        if ("succeeded".equals(refundStatus)) {
            if (amountInCents != null) {
                order.setRefundAmount(BigDecimal.valueOf(amountInCents).movePointLeft(2));
            }
            for (String key : order.getPhotoUrls()) {
                try {
                    s3Service.deleteFile(key, inspoBucket);
                } catch (Exception e) {
                    log.error("Failed to delete S3 object {} for order {}: {}", key, order.getId(), e.getMessage());
                }
            }
            order.setStatus(OrderStatus.REFUNDED);
            orderRepository.save(order);
            log.info("Refund {} succeeded for order {}", refundId, order.getId());
            if (order.isSmsConsent()) {
                try {
                    textingService.sendText(order.getPhoneNumber(),
                            "Your refund from Confection Co. Bakery has been processed. Please allow 5–10 business days for it to appear in your account.");
                } catch (Exception e) {
                    log.error("Failed to send refund text for order {}", order.getId(), e);
                }
            }
            try {
                textingService.sendText(ownerPhone,
                        "Refund processed for order " + order.getId() + " from " + order.getCustomerName() + ".");
            } catch (Exception e) {
                log.error("Failed to send refund notification to owner for order {}", order.getId(), e);
            }
            try {
                emailService.sendRefundConfirmation(order.getEmail());
            } catch (Exception e) {
                log.error("Failed to send refund confirmation email for order {}", order.getId(), e);
            }
        } else if ("failed".equals(refundStatus)) {
            order.setStatus(OrderStatus.PAID_IN_FULL);
            order.setStripeRefundId(null);
            orderRepository.save(order);
            log.error("Refund {} failed for order {} — status reverted to PAID_IN_FULL", refundId, order.getId());
        }
    }

    private String generateUniqueToken() {
        for (int attempt = 0; attempt < 10; attempt++) {
            String token = generateToken();
            if (orderRepository.findByPaymentLinkToken(token).isEmpty()) {
                return token;
            }
        }
        throw new IllegalStateException("Failed to generate a unique payment token after 10 attempts");
    }

    private String generateToken() {
        StringBuilder token = new StringBuilder(8);
        for (int i = 0; i < 8; i++) {
            token.append(TOKEN_CHARS.charAt(RANDOM.nextInt(TOKEN_CHARS.length())));
        }
        return token.toString();
    }

    private boolean markEventProcessed(String eventId) {
        int rows = jdbcTemplate.update(
                "INSERT INTO stripe_processed_events(event_id) VALUES (?) ON CONFLICT (event_id) DO NOTHING",
                eventId);
        return rows > 0;
    }

    private void handleStripeCheckoutCompleted(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        if (order.getStatus() == OrderStatus.AWAITING_DEPOSIT) {
            order.setDepositPaid(true);
            order.setStatus(OrderStatus.IN_PROGRESS);
            order.setPaymentLinkToken(null);
            order.setPaymentLinkUrl(null);
            orderRepository.save(order);
            if (order.isSmsConsent()) {
                try {
                    textingService.sendText(order.getPhoneNumber(),
                            "Great news! Your deposit has been received by Confection Co. Bakery. We're now working on your order!");
                } catch (Exception e) {
                    log.error("Failed to send deposit text to order {}", orderId, e);
                }
            }
            try {
                textingService.sendText(ownerPhone,
                        "Deposit received for order " + orderId + " from " + order.getCustomerName() + ".");
            } catch (Exception e) {
                log.error("Failed to send deposit notification to owner for order {}", orderId, e);
            }
            try {
                log.info("Sending deposit receipt email to {} for order {}", order.getEmail(), orderId);
                emailService.sendDepositReceipt(order.getEmail());
                log.info("Deposit receipt email sent successfully for order {}", orderId);
            } catch (Exception e) {
                log.error("Failed to send deposit receipt email for order {}", orderId, e);
            }
        } else if (order.getStatus() == OrderStatus.AWAITING_FINAL_PAYMENT) {
            order.setFullPaymentPaid(true);
            order.setStatus(OrderStatus.PAID_IN_FULL);
            order.setPaymentLinkToken(null);
            order.setPaymentLinkUrl(null);
            orderRepository.save(order);
            if (order.isSmsConsent()) {
                try {
                    textingService.sendText(order.getPhoneNumber(),
                            "Your final payment has been received by Confection Co. Bakery. Your order is paid in full — thank you!");
                } catch (Exception e) {
                    log.error("Failed to send final payment text for order {}", orderId, e);
                }
            }
            try {
                textingService.sendText(ownerPhone,
                        "Full payment received for order " + orderId + " from " + order.getCustomerName() + ".");
            } catch (Exception e) {
                log.error("Failed to send final payment notification to owner for order {}", orderId, e);
            }
            try {
                emailService.sendFullPaymentConfirmation(order.getEmail());
            } catch (Exception e) {
                log.error("Failed to send final payment email for order {}", orderId, e);
            }
        } else {
            log.warn("checkout.session.completed for order {} in unexpected status: {}", orderId, order.getStatus());
        }
    }
}
