package com.chrismerced.projects.confectionco.api;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chrismerced.projects.confectionco.dtos.OrderDTO;
import com.chrismerced.projects.confectionco.dtos.SendReceiptRequest;
import com.chrismerced.projects.confectionco.exceptions.ResourceNotFoundException;
import com.chrismerced.projects.confectionco.model.OrderStatus;
import com.chrismerced.projects.confectionco.repository.OrderRepository;
import com.chrismerced.projects.confectionco.services.EmailService;
import com.chrismerced.projects.confectionco.services.OrderService;
import com.chrismerced.projects.confectionco.services.S3Service;
import com.chrismerced.projects.confectionco.services.StripeService;
import com.chrismerced.projects.confectionco.services.TextingService;
import com.chrismerced.projects.confectionco.model.Order;

@RestController
@RequestMapping("api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private static final Logger log = LoggerFactory.getLogger(AdminController.class);

    @Value("${aws.bucket-inspo}")
    private String inspoBucket;

    @Value("${aws.region}")
    private String awsRegion;

    private final OrderRepository orderRepository;
    private final OrderService orderService;
    private final StripeService stripeService;
    private final EmailService emailService;
    private final TextingService textingService;
    private final S3Service s3Service;

    AdminController(OrderRepository orderRepository, OrderService orderService,
            StripeService stripeService, EmailService emailService, TextingService textingService,
            S3Service s3Service) {
        this.orderRepository = orderRepository;
        this.orderService = orderService;
        this.stripeService = stripeService;
        this.emailService = emailService;
        this.textingService = textingService;
        this.s3Service = s3Service;
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getActiveOrders() {
        try {
            String inspoBaseUrl = "https://" + inspoBucket + ".s3." + awsRegion + ".amazonaws.com";
            List<OrderDTO> orders = orderRepository.findByStatusNot(OrderStatus.COMPLETED)
                    .stream()
                    .map(order -> new OrderDTO(order, inspoBaseUrl))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to retrieve orders");
        }
    }

    @PatchMapping("/orders/{id}/comments")
    public ResponseEntity<?> updateComments(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        try {
             Order order = orderRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));
            order.setComments(body.get("comments"));
            orderRepository.save(order);
            return ResponseEntity.ok(Map.of("comments", order.getComments() != null ? order.getComments() : ""));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update comments");
        }
    }

    @DeleteMapping("/orders/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable Long id) {
        try {
            if (!orderRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            orderRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete order");
        }
    }

    @PostMapping("/orders/{id}/reject")
    public ResponseEntity<?> rejectOrder(@PathVariable Long id) {
        try {
            orderService.updateOrderStatus(id, OrderStatus.REJECTED);
            return ResponseEntity.ok(Map.of("status", OrderStatus.REJECTED.name()));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/orders/{id}/refund")
    public ResponseEntity<?> refundOrder(
            @PathVariable Long id,
            @RequestBody Map<String, BigDecimal> body) {
        try {
            BigDecimal amount = body.get("amount");
            orderService.refundOrder(id, amount);
            return ResponseEntity.ok(Map.of("status", OrderStatus.REFUNDED.name()));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to process refund");
        }
    }

    @PostMapping("/orders/{id}/complete")
    public ResponseEntity<?> completeOrder(@PathVariable Long id) {
        try {
            Order order = orderRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));

            orderService.updateOrderStatus(id, OrderStatus.COMPLETED);

            for (String key : order.getPhotoUrls()) {
                try {
                    s3Service.deleteFile(key, inspoBucket);
                } catch (Exception e) {
                    log.error("Failed to delete S3 object {} for order {}: {}", key, id, e.getMessage());
                }
            }

            return ResponseEntity.ok(Map.of("status", OrderStatus.COMPLETED.name()));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/orders/{id}/payment-url")
    public ResponseEntity<?> getPaymentUrl(@PathVariable Long id) {
        try {
            Order order = orderRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));
            if (order.getStripeSessionId() == null) {
                return ResponseEntity.badRequest().body("No payment session on file for this order.");
            }
            String url = stripeService.getSessionUrl(order.getStripeSessionId());
            return ResponseEntity.ok(Map.of("url", url));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to retrieve payment URL");
        }
    }

    @PostMapping("/orders/{id}/deposit-link")
    public ResponseEntity<?> generateDepositLink(
            @PathVariable Long id,
            @RequestBody Map<String, BigDecimal> body) {
        try {
            BigDecimal totalAmount = body.get("totalAmount");
            String url = orderService.generateDepositLink(id, totalAmount);
            return ResponseEntity.ok(Map.of("url", url));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Failed to generate deposit link for order {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PostMapping("/orders/{id}/final-link")
    public ResponseEntity<?> generateFinalPaymentLink(
            @PathVariable Long id,
            @RequestBody Map<String, BigDecimal> body) {
        try {
            BigDecimal amount = body.get("amount");
            String url = orderService.generateFinalPaymentLink(id, amount);
            return ResponseEntity.ok(Map.of("url", url));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to generate final payment link");
        }
    }

    @PostMapping("/sendReceipt")
    public ResponseEntity<Map<String, Boolean>> sendReceipt(@RequestBody SendReceiptRequest sendReceiptRequest) {
        log.info("sendReceipt invoked for recipient: {}", sendReceiptRequest.getRecipient());
        emailService.sendReceipt(sendReceiptRequest.getRecipient(), sendReceiptRequest.getReceipt());
        return ResponseEntity.ok(Map.of("EmailSent", true));
    }
}
