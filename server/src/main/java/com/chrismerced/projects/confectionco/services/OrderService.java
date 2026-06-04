package com.chrismerced.projects.confectionco.services;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.chrismerced.projects.confectionco.dtos.CreateOrderCustomItemRequest;
import com.chrismerced.projects.confectionco.dtos.CreateOrderRequest;
import com.chrismerced.projects.confectionco.dtos.CreateOrderResponse;
import com.chrismerced.projects.confectionco.exceptions.ResourceNotFoundException;
import com.chrismerced.projects.confectionco.model.ButtercreamOption;
import com.chrismerced.projects.confectionco.model.CheesecakeCrustOption;
import com.chrismerced.projects.confectionco.model.FillingOption;
import com.chrismerced.projects.confectionco.model.FixedProduct;
import com.chrismerced.projects.confectionco.model.FlavorOption;
import com.chrismerced.projects.confectionco.model.ItemSize;
import com.chrismerced.projects.confectionco.model.Order;
import com.chrismerced.projects.confectionco.model.OrderCustomItem;
import com.chrismerced.projects.confectionco.model.OrderFixedItem;
import com.chrismerced.projects.confectionco.model.OrderItemPhoto;
import com.chrismerced.projects.confectionco.model.OrderStatus;
import com.chrismerced.projects.confectionco.model.PieStyleOption;
import com.chrismerced.projects.confectionco.repository.ButtercreamOptionRepository;
import com.chrismerced.projects.confectionco.repository.CheesecakeCrustOptionRepository;
import com.chrismerced.projects.confectionco.repository.FillingOptionRepository;
import com.chrismerced.projects.confectionco.repository.FixedProductRepository;
import com.chrismerced.projects.confectionco.repository.FlavorOptionRepository;
import com.chrismerced.projects.confectionco.repository.ItemSizeRepository;
import com.chrismerced.projects.confectionco.repository.OrderCustomItemRepository;
import com.chrismerced.projects.confectionco.repository.OrderFixedItemRepository;
import com.chrismerced.projects.confectionco.repository.OrderItemPhotoRepository;
import com.chrismerced.projects.confectionco.repository.OrderRepository;
import com.chrismerced.projects.confectionco.repository.PieStyleOptionRepository;
import com.chrismerced.projects.confectionco.util.InputSanitizer;
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
    private static final Set<String> VALID_ITEM_TYPES =
            Set.of("CAKE", "PIE_CLASSIC", "PIE_CUSTARD", "CHEESECAKE", "MACARON", "SURPRISE_ME");
    private static final Set<String> VALID_FULFILLMENT_TYPES = Set.of("PICKUP", "DROPOFF");

    private final OrderRepository orderRepository;
    private final StripeService stripeService;
    private final ObjectMapper objectMapper;
    private final EmailService emailService;
    private final TextingService textingService;
    private final S3Service s3Service;
    private final JdbcTemplate jdbcTemplate;
    private final OrderCustomItemRepository customItemRepository;
    private final OrderFixedItemRepository fixedItemRepository;
    private final OrderItemPhotoRepository itemPhotoRepository;
    private final FlavorOptionRepository flavorRepo;
    private final FillingOptionRepository fillingRepo;
    private final ButtercreamOptionRepository buttercreamRepo;
    private final PieStyleOptionRepository pieStyleRepo;
    private final CheesecakeCrustOptionRepository cheesecakeCrustRepo;
    private final ItemSizeRepository sizeRepo;
    private final FixedProductRepository fixedProductRepo;

    OrderService(OrderRepository orderRepository, StripeService stripeService, ObjectMapper objectMapper,
            EmailService emailService, TextingService textingService, S3Service s3Service,
            JdbcTemplate jdbcTemplate, OrderCustomItemRepository customItemRepository,
            OrderFixedItemRepository fixedItemRepository, OrderItemPhotoRepository itemPhotoRepository,
            FlavorOptionRepository flavorRepo, FillingOptionRepository fillingRepo,
            ButtercreamOptionRepository buttercreamRepo, PieStyleOptionRepository pieStyleRepo,
            CheesecakeCrustOptionRepository cheesecakeCrustRepo, ItemSizeRepository sizeRepo,
            FixedProductRepository fixedProductRepo) {
        this.orderRepository = orderRepository;
        this.stripeService = stripeService;
        this.objectMapper = objectMapper;
        this.emailService = emailService;
        this.textingService = textingService;
        this.s3Service = s3Service;
        this.jdbcTemplate = jdbcTemplate;
        this.customItemRepository = customItemRepository;
        this.fixedItemRepository = fixedItemRepository;
        this.itemPhotoRepository = itemPhotoRepository;
        this.flavorRepo = flavorRepo;
        this.fillingRepo = fillingRepo;
        this.buttercreamRepo = buttercreamRepo;
        this.pieStyleRepo = pieStyleRepo;
        this.cheesecakeCrustRepo = cheesecakeCrustRepo;
        this.sizeRepo = sizeRepo;
        this.fixedProductRepo = fixedProductRepo;
    }

    @Transactional
    public CreateOrderResponse createOrder(CreateOrderRequest req) {
        String phone = InputSanitizer.sanitizePhone(req.getPhoneNumber());
        if (phone == null || phone.length() != 10) {
            throw new IllegalArgumentException("Phone number must be a valid 10-digit US number.");
        }

        String fulfillmentType = InputSanitizer.stripHtml(req.getFulfillmentType()).toUpperCase();
        if (!VALID_FULFILLMENT_TYPES.contains(fulfillmentType)) {
            throw new IllegalArgumentException("Invalid fulfillment type.");
        }

        if (req.getFulfillmentDate() == null || !req.getFulfillmentDate().isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("Fulfillment date must be in the future.");
        }

        Order order = new Order();
        order.setCustomerName(InputSanitizer.stripHtml(req.getCustomerName()));
        order.setEmail(InputSanitizer.stripHtml(req.getEmail()).toLowerCase());
        order.setPhoneNumber(phone);
        order.setComments(InputSanitizer.stripHtml(req.getComments()));
        order.setFulfillmentType(fulfillmentType);
        order.setDeliveryAddress("DROPOFF".equals(fulfillmentType)
                ? InputSanitizer.stripHtml(req.getDeliveryAddress()) : null);
        order.setFulfillmentDate(req.getFulfillmentDate());
        order.setSmsConsent(req.isSmsConsent());
        Order saved = orderRepository.save(order);

        List<CreateOrderResponse.ItemRef> itemRefs = new ArrayList<>();
        for (CreateOrderCustomItemRequest itemReq : req.getCustomItems()) {
            OrderCustomItem item = buildCustomItem(itemReq, saved.getId());
            OrderCustomItem savedItem = customItemRepository.save(item);
            itemRefs.add(new CreateOrderResponse.ItemRef(savedItem.getId(), savedItem.getItemType()));
        }

        if (req.getFixedItems() != null) {
            for (var fixedReq : req.getFixedItems()) {
                OrderFixedItem fixedItem = new OrderFixedItem();
                fixedItem.setOrderId(saved.getId());
                fixedItem.setFixedProduct(fixedProductRepo.getReferenceById(fixedReq.getFixedProductId()));
                fixedItem.setQuantity(fixedReq.getQuantity());
                fixedItemRepository.save(fixedItem);
            }
        }

        return new CreateOrderResponse(saved.getId(), itemRefs);
    }

    @Transactional
    public void addItemPhotos(Long orderId, Long itemId, List<String> photoKeys) {
        OrderCustomItem item = customItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found: " + itemId));
        if (!item.getOrderId().equals(orderId)) {
            throw new IllegalArgumentException("Item does not belong to this order.");
        }
        for (String key : photoKeys) {
            OrderItemPhoto photo = new OrderItemPhoto();
            photo.setOrderCustomItem(item);
            photo.setPhotoUrl(key);
            itemPhotoRepository.save(photo);
        }
    }

    private OrderCustomItem buildCustomItem(CreateOrderCustomItemRequest req, Long orderId) {
        String itemType = req.getItemType().toUpperCase();
        if (!VALID_ITEM_TYPES.contains(itemType)) {
            throw new IllegalArgumentException("Invalid item type: " + itemType);
        }

        OrderCustomItem item = new OrderCustomItem();
        item.setOrderId(orderId);
        item.setItemType(itemType);
        item.setQuantity(Math.max(1, req.getQuantity()));
        item.setGlutenFree(req.isGlutenFree());
        item.setColorPreference(InputSanitizer.stripHtml(req.getColorPreference()));
        item.setComments(InputSanitizer.stripHtml(req.getComments()));

        if (req.getSizeId() != null)
            item.setSize(sizeRepo.getReferenceById(req.getSizeId()));
        if (req.getFlavorId() != null)
            item.setFlavor(flavorRepo.getReferenceById(req.getFlavorId()));
        if (req.getFlavor2Id() != null)
            item.setFlavor2(flavorRepo.getReferenceById(req.getFlavor2Id()));
        if (req.getFillingId() != null)
            item.setFilling(fillingRepo.getReferenceById(req.getFillingId()));
        if (req.getButtercreamId() != null)
            item.setButtercream(buttercreamRepo.getReferenceById(req.getButtercreamId()));
        if (req.getPieStyleId() != null)
            item.setPieStyle(pieStyleRepo.getReferenceById(req.getPieStyleId()));
        if (req.getCheesecakeCrustId() != null)
            item.setCheesecakeCrust(cheesecakeCrustRepo.getReferenceById(req.getCheesecakeCrustId()));

        validateCustomItem(itemType, req);
        return item;
    }

    private void validateCustomItem(String itemType, CreateOrderCustomItemRequest req) {
        switch (itemType) {
            case "CAKE" -> {
                if (req.getFlavorId() == null) throw new IllegalArgumentException("Cake requires a flavor.");
                if (req.getButtercreamId() == null) throw new IllegalArgumentException("Cake requires a buttercream/frosting.");
            }
            case "SURPRISE_ME" -> {
                if (req.getFlavorId() == null) throw new IllegalArgumentException("Surprise Me requires a flavor.");
            }
            case "PIE_CLASSIC", "PIE_CUSTARD" -> {
                if (req.getSizeId() == null) throw new IllegalArgumentException("Pie requires a size.");
                if (req.getFlavorId() == null) throw new IllegalArgumentException("Pie requires a flavor.");
                if (req.getPieStyleId() == null) throw new IllegalArgumentException("Pie requires a style.");
            }
            case "CHEESECAKE" -> {
                if (req.getSizeId() == null) throw new IllegalArgumentException("Cheesecake requires a size.");
                if (req.getFlavorId() == null) throw new IllegalArgumentException("Cheesecake requires a flavor.");
                if (req.getCheesecakeCrustId() == null) throw new IllegalArgumentException("Cheesecake requires a crust.");
            }
            case "MACARON" -> {
                if (req.getSizeId() == null) throw new IllegalArgumentException("Macaron requires a size.");
                if (req.getFlavorId() == null) throw new IllegalArgumentException("Macaron requires a flavor.");
            }
        }
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

        if (status == OrderStatus.REJECTED) {
            try {
                emailService.sendOrderRejection(order.getEmail());
            } catch (Exception e) {
                log.error("Failed to send rejection email for order {}", orderId, e);
            }
            if (order.isSmsConsent()) {
                try {
                    textingService.sendText(order.getPhoneNumber(),
                            "Hi! We're sorry, but we're unable to fulfill your Confection Co. Bakery order at this time. " +
                            "We appreciate your interest and hope to serve you in the future!");
                } catch (Exception e) {
                    log.error("Failed to send rejection SMS for order {}", orderId, e);
                }
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
            emailService.sendDepositPaymentLink(order.getEmail(), url, depositAmount, orderTotal);
        } catch (Exception e) {
            log.error("Failed to send deposit payment link email for order {}", orderId, e);
        }
        if (order.isSmsConsent()) {
            try {
                textingService.sendText(order.getPhoneNumber(),
                        "Hi! Here is your deposit payment link for your Confection Co. Bakery order. " +
                        "A deposit of $" + String.format("%.2f", depositAmount) +
                        " (40% of your $" + String.format("%.2f", orderTotal) + " order total) is due: " + url);
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
            emailService.sendFinalPaymentLink(order.getEmail(), url, amount);
        } catch (Exception e) {
            log.error("Failed to send final payment link email for order {}", orderId, e);
        }
        if (order.isSmsConsent()) {
            try {
                textingService.sendText(order.getPhoneNumber(),
                        "Hi! Your final payment of $" + String.format("%.2f", amount) +
                        " for your Confection Co. Bakery order is ready: " + url);
            } catch (Exception e) {
                log.error("Failed to send final payment SMS for order {}", orderId, e);
            }
        }
        return url;
    }

    @Transactional
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

    @Transactional
    public void handleStripeEvent(String eventType, String eventId, String rawPayload) {
        if (!markEventProcessed(eventId)) {
            log.info("Duplicate Stripe event ignored: {}", eventId);
            return;
        }
        switch (eventType) {
            case "checkout.session.completed" -> {
                com.fasterxml.jackson.databind.JsonNode dataObject;
                try {
                    dataObject = objectMapper.readTree(rawPayload).path("data").path("object");
                } catch (Exception e) {
                    log.error("Failed to parse webhook payload for event {}", eventId, e);
                    return;
                }
                String orderId = dataObject.path("client_reference_id").asText(null);
                if (orderId == null) {
                    log.error("Missing client_reference_id in event: {}", eventId);
                    return;
                }
                handleStripeCheckoutCompleted(Long.valueOf(orderId));
            }

            case "charge.refund.updated" -> {
                com.fasterxml.jackson.databind.JsonNode dataObject;
                try {
                    dataObject = objectMapper.readTree(rawPayload).path("data").path("object");
                } catch (Exception e) {
                    log.error("Failed to parse refund webhook payload for event {}", eventId, e);
                    return;
                }
                String refundId = dataObject.path("id").asText(null);
                String refundStatus = dataObject.path("status").asText(null);
                if (refundId == null || refundStatus == null) {
                    log.error("Missing refund id or status in event: {}", eventId);
                    return;
                }
                long amountInCents = dataObject.path("amount").asLong(0);
                handleStripeRefundUpdated(refundId, refundStatus, amountInCents > 0 ? amountInCents : null);
            }

            default -> log.info("Unhandled Stripe event: {}", eventType);
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
            for (var photo : itemPhotoRepository.findByOrderCustomItem_OrderId(order.getId())) {
                try {
                    s3Service.deleteFile(photo.getPhotoUrl(), inspoBucket);
                } catch (Exception e) {
                    log.error("Failed to delete item photo {} for order {}: {}", photo.getPhotoUrl(), order.getId(), e.getMessage());
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
