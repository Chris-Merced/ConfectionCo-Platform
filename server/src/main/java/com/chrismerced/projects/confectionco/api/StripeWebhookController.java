package com.chrismerced.projects.confectionco.api;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chrismerced.projects.confectionco.services.OrderService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.net.Webhook;

@RestController
@RequestMapping("/api/stripe")
public class StripeWebhookController {

    private static final Logger log = LoggerFactory.getLogger(StripeWebhookController.class);

    @Value("${stripe.webhook.secret}")
    private String endpointSecret;

    private final OrderService orderService;
    private final ObjectMapper objectMapper;

    public StripeWebhookController(OrderService orderService, ObjectMapper objectMapper) {
        this.orderService = orderService;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/webhook")
    public ResponseEntity<Void> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {

        try {
            Webhook.Signature.verifyHeader(payload, sigHeader, endpointSecret, 300L);
        } catch (SignatureVerificationException e) {
            log.warn("Invalid Stripe webhook signature");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        try {
            JsonNode root = objectMapper.readTree(payload);
            String eventType = root.path("type").asText();
            String eventId = root.path("id").asText();
            orderService.handleStripeEvent(eventType, eventId, payload);
        } catch (Exception e) {
            log.error("Failed to process Stripe webhook", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }

        return ResponseEntity.ok().build();
    }
}