package com.chrismerced.projects.confectionco.api;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.chrismerced.projects.confectionco.dtos.CreateOrderRequest;
import com.chrismerced.projects.confectionco.dtos.CreateOrderResponse;
import com.chrismerced.projects.confectionco.services.EmailService;
import com.chrismerced.projects.confectionco.services.OrderService;
import com.chrismerced.projects.confectionco.services.S3Service;
import com.chrismerced.projects.confectionco.services.TextingService;

import jakarta.validation.Valid;

@Validated
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Value("${aws.bucket-inspo}")
    private String inspoBucket;

    @Value("${app.owner-phone}")
    private String ownerPhone;

    private final OrderService orderService;
    private final S3Service s3Service;
    private final EmailService emailService;
    private final TextingService textingService;

    private static final byte[] MAGIC_JPEG = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF};
    private static final byte[] MAGIC_PNG  = {(byte) 0x89, 0x50, 0x4E, 0x47};
    private static final byte[] MAGIC_WEBP = {0x52, 0x49, 0x46, 0x46};

    OrderController(OrderService orderService, S3Service s3Service,
                    EmailService emailService, TextingService textingService) {
        this.orderService = orderService;
        this.s3Service = s3Service;
        this.emailService = emailService;
        this.textingService = textingService;
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<CreateOrderResponse> createOrder(
            @RequestBody @Valid CreateOrderRequest request) {

        CreateOrderResponse response = orderService.createOrder(request);

        try {
            emailService.sendOrderConfirmation(request.getEmail());
        } catch (Exception e) {
            // Non-fatal
        }
        try {
            textingService.sendText(ownerPhone,
                    "New Confection Co. order from " + request.getCustomerName() +
                    " for " + request.getFulfillmentDate() + ". Order ID: " + response.getOrderId());
        } catch (Exception e) {
            // Non-fatal
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/{orderId}/items/{itemId}/photos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> uploadItemPhotos(
            @PathVariable Long orderId,
            @PathVariable Long itemId,
            @RequestParam(required = false) List<MultipartFile> photos) throws IOException {

        if (photos == null || photos.isEmpty()) {
            return ResponseEntity.ok().build();
        }

        long maxBytes = 10 * 1024 * 1024;
        List<String> photoKeys = new ArrayList<>();
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

        orderService.addItemPhotos(orderId, itemId, photoKeys);
        return ResponseEntity.ok().build();
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
}
