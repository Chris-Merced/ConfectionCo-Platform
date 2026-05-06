package com.chrismerced.projects.confectionco.api;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.chrismerced.projects.confectionco.model.Order;
import com.chrismerced.projects.confectionco.repository.OrderRepository;
import com.chrismerced.projects.confectionco.services.S3Service;

@CrossOrigin(origins = { "http://localhost:5173" })
@RestController
@RequestMapping("/api/orders")
public class OrderController {
    
    @Value("${aws.bucket-inspo}")
    private String inspoBucket;

    @Value("$aws.bucket-assets")
    private String assetBucket;

    private final OrderRepository orderRepository;
    private final S3Service s3Service;

    


    OrderController(OrderRepository orderRepository, S3Service s3Service) {
        this.orderRepository = orderRepository;
        this.s3Service = s3Service;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Long>> createOrder(
            @RequestParam String email,
            @RequestParam String phoneNumber,
            @RequestParam int servingCount,
            @RequestParam(required = false) String comments,
            @RequestParam(required = false) List<MultipartFile> photos) throws IOException {

        List<String> photoKeys = new ArrayList<>();
        if (photos != null) {
            for (MultipartFile photo : photos) {
                if (!photo.isEmpty()) {
                    photoKeys.add(s3Service.uploadFile(photo, inspoBucket));
                }
            }
        }

        Order order = new Order();
        order.setEmail(email);
        order.setPhoneNumber(phoneNumber);
        order.setServingCount(servingCount);
        order.setComments(comments);
        order.setPhotoUrls(photoKeys);

        Order saved = orderRepository.save(order);
        return ResponseEntity.ok(Map.of("orderId", saved.getId()));
    }
}
