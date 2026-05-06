package com.chrismerced.projects.confectionco.model;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_email")
    private String email;

    @Column(name = "user_phone")
    private String phoneNumber;

    private String status = "PENDING";

    @Column(name = "total_amount")
    private BigDecimal totalAmount;

    @Column(name = "stripe_session_id")
    private String stripeSessionId;

    @Column(name = "deposit_paid")
    private boolean depositPaid;

    @Column(name = "full_payment_paid")
    private boolean fullPaymentPaid;

    @Column(name = "serving_count")
    private Integer servingCount;

    private String comments;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private OffsetDateTime updatedAt;

    @ElementCollection
    @CollectionTable(name = "order_photo_urls", joinColumns = @JoinColumn(name = "order_id"))
    @Column(name = "photo_url")
    private List<String> photoUrls = new ArrayList<>();

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public String getStripeSessionId() { return stripeSessionId; }
    public void setStripeSessionId(String stripeSessionId) { this.stripeSessionId = stripeSessionId; }
    public boolean isDepositPaid() { return depositPaid; }
    public void setDepositPaid(boolean depositPaid) { this.depositPaid = depositPaid; }
    public boolean isFullPaymentPaid() { return fullPaymentPaid; }
    public void setFullPaymentPaid(boolean fullPaymentPaid) { this.fullPaymentPaid = fullPaymentPaid; }
    public Integer getServingCount() { return servingCount; }
    public void setServingCount(Integer servingCount) { this.servingCount = servingCount; }
    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public List<String> getPhotoUrls() { return photoUrls; }
    public void setPhotoUrls(List<String> photoUrls) { this.photoUrls = photoUrls; }
}
