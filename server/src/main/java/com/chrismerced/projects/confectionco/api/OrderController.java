package com.chrismerced.projects.confectionco.api;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.chrismerced.projects.confectionco.model.Order;
import com.chrismerced.projects.confectionco.repository.OrderRepository;
import com.chrismerced.projects.confectionco.services.EmailService;
import com.chrismerced.projects.confectionco.services.S3Service;
import com.chrismerced.projects.confectionco.util.InputSanitizer;

@Validated
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Value("${aws.bucket-inspo}")
    private String inspoBucket;

    @Value("${aws.bucket-assets}")
    private String assetBucket;

    private final OrderRepository orderRepository;
    private final S3Service s3Service;
    private final EmailService emailService;

    private static final byte[] MAGIC_JPEG = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF};
    private static final byte[] MAGIC_PNG  = {(byte) 0x89, 0x50, 0x4E, 0x47};
    private static final byte[] MAGIC_WEBP = {0x52, 0x49, 0x46, 0x46};
    private static final Set<String> VALID_FULFILLMENT_TYPES = Set.of("PICKUP", "DROPOFF");

    OrderController(OrderRepository orderRepository, S3Service s3Service, EmailService emailService) {
        this.orderRepository = orderRepository;
        this.s3Service = s3Service;
        this.emailService = emailService;
    }

    private boolean hasValidImageMagic(MultipartFile file) throws IOException {
        byte[] header = new byte[4];
        try (InputStream is = file.getInputStream()) {
            if (is.read(header) < 3) return false;
        }
        return startsWith(header, MAGIC_JPEG)
            || startsWith(header, MAGIC_PNG)
            || startsWith(header, MAGIC_WEBP);
    }

    private boolean startsWith(byte[] data, byte[] prefix) {
        for (int i = 0; i < prefix.length; i++) {
            if (data[i] != prefix[i]) return false;
        }
        return true;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Long>> createOrder(
            @RequestParam @Email @NotBlank String email,
            @RequestParam @NotBlank String phoneNumber,
            @RequestParam @Min(1) @Max(500) int servingCount,
            @RequestParam(required = false) @Size(max = 2000) String comments,
            @RequestParam(defaultValue = "PICKUP") String fulfillmentType,
            @RequestParam(required = false) @Size(max = 500) String deliveryAddress,
            @RequestParam LocalDate fulfillmentDate,
            @RequestParam(required = false) List<MultipartFile> photos) throws IOException {

        String cleanEmail = InputSanitizer.stripHtml(email).toLowerCase();
        String cleanPhone = InputSanitizer.sanitizePhone(phoneNumber);
        String cleanComments = InputSanitizer.stripHtml(comments);
        String cleanDeliveryAddress = InputSanitizer.stripHtml(deliveryAddress);
        String cleanFulfillmentType = InputSanitizer.stripHtml(fulfillmentType).toUpperCase();

        if (cleanPhone == null || cleanPhone.length() != 10) {
            throw new IllegalArgumentException("Phone number must be a valid 10-digit US number.");
        }

        if (!VALID_FULFILLMENT_TYPES.contains(cleanFulfillmentType)) {
            throw new IllegalArgumentException("Invalid fulfillment type.");
        }

        if (!fulfillmentDate.isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("Fulfillment date must be in the future.");
        }

        long maxBytes = 10 * 1024 * 1024;
        List<String> photoKeys = new ArrayList<>();
        if (photos != null) {
            for (MultipartFile photo : photos) {
                if (!photo.isEmpty()) {
                    if (photo.getSize() > maxBytes) {
                        throw new IllegalArgumentException("Each photo must be under 10MB.");
                    }
                    if (!hasValidImageMagic(photo)) {
                        throw new IllegalArgumentException("Only JPEG, PNG, and WebP images are allowed.");
                    }
                    photoKeys.add(s3Service.uploadFile(photo, inspoBucket));
                }
            }
        }

        Order order = new Order();
        order.setEmail(cleanEmail);
        order.setPhoneNumber(cleanPhone);
        order.setServingCount(servingCount);
        order.setComments(cleanComments);
        order.setFulfillmentType(cleanFulfillmentType);
        order.setDeliveryAddress("DROPOFF".equals(cleanFulfillmentType) ? cleanDeliveryAddress : null);
        order.setFulfillmentDate(fulfillmentDate);
        order.setPhotoUrls(photoKeys);

        Order saved = orderRepository.save(order);
        try {
            emailService.sendOrderConfirmation(cleanEmail);
        } catch (Exception e) {
            // Non-fatal — order is saved, email failure is logged by EmailService
        }
        return ResponseEntity.ok(Map.of("orderId", saved.getId()));
    }
}
