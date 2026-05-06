package com.chrismerced.projects.confectionco.dtos;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;


import com.chrismerced.projects.confectionco.model.Order;

public class OrderDTO {


    private Long id;
    private String email;
    private String phoneNumber;
    private String status;
    private BigDecimal totalAmount;
    private boolean depositPaid;
    private boolean fullPaymentPaid;
    private Integer servingCount;
    private String comments;
    private OffsetDateTime createdAt;
    private List<String> photoUrls;

    public OrderDTO(Order order, String bucketUrl) {
        this.id = order.getId();
        this.email = order.getEmail();
        this.phoneNumber = order.getPhoneNumber();
        this.status = order.getStatus();
        this.totalAmount = order.getTotalAmount();
        this.depositPaid = order.isDepositPaid();
        this.fullPaymentPaid = order.isFullPaymentPaid();
        this.servingCount = order.getServingCount();
        this.comments = order.getComments();
        this.createdAt = order.getCreatedAt();
        this.photoUrls = order.getPhotoUrls()
                .stream()
                .map(key -> bucketUrl + "/" + key)
                .collect(Collectors.toList());
    }

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getPhoneNumber() { return phoneNumber; }
    public String getStatus() { return status; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public boolean isDepositPaid() { return depositPaid; }
    public boolean isFullPaymentPaid() { return fullPaymentPaid; }
    public Integer getServingCount() { return servingCount; }
    public String getComments() { return comments; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public List<String> getPhotoUrls() { return photoUrls; }
}