package com.chrismerced.projects.confectionco.api;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.chrismerced.projects.confectionco.model.Order;
import com.chrismerced.projects.confectionco.repository.OrderRepository;
import com.chrismerced.projects.confectionco.services.EmailService;
import com.chrismerced.projects.confectionco.services.S3Service;

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
            @RequestParam String email,
            @RequestParam String phoneNumber,
            @RequestParam int servingCount,
            @RequestParam(required = false) String comments,
            @RequestParam(defaultValue = "PICKUP") String fulfillmentType,
            @RequestParam(required = false) String deliveryAddress,
            @RequestParam LocalDate fulfillmentDate,
            @RequestParam(required = false) List<MultipartFile> photos) throws IOException {

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
        order.setEmail(email);
        order.setPhoneNumber(phoneNumber);
        order.setServingCount(servingCount);
        order.setComments(comments);
        order.setFulfillmentType(fulfillmentType.toUpperCase());
        order.setDeliveryAddress("DROPOFF".equalsIgnoreCase(fulfillmentType) ? deliveryAddress : null);
        order.setFulfillmentDate(fulfillmentDate);
        order.setPhotoUrls(photoKeys);

        Order saved = orderRepository.save(order);
        try {
            emailService.sendOrderConfirmation(email);
        } catch (Exception e) {
            // Non-fatal — order is saved, email failure is logged by EmailService
        }
        return ResponseEntity.ok(Map.of("orderId", saved.getId()));
    }
}
