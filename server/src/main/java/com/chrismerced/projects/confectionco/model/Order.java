package com.chrismerced.projects.confectionco.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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

    @Column(name = "customer_name")
    private String customerName;

    @Column(name = "user_email")
    private String email;

    @Column(name = "user_phone")
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    private OrderStatus status = OrderStatus.PENDING;

    @Column(name = "deposit_amount")
    private BigDecimal depositAmount;

    @Column(name = "final_payment_amount")
    private BigDecimal finalPaymentAmount;

    @Column(name = "stripe_session_id")
    private String stripeSessionId;

    @Column(name = "stripe_refund_id")
    private String stripeRefundId;

    @Column(name = "deposit_paid")
    private boolean depositPaid;

    @Column(name = "full_payment_paid")
    private boolean fullPaymentPaid;

    @Column(name = "serving_count")
    private Integer servingCount;

    private String comments;

    @Column(name = "fulfillment_type")
    private String fulfillmentType = "PICKUP";

    @Column(name = "delivery_address")
    private String deliveryAddress;

    @Column(name = "fulfillment_date")
    private LocalDate fulfillmentDate;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private OffsetDateTime updatedAt;

    @Column(name = "sms_consent")
    private boolean smsConsent;

    @ElementCollection
    @CollectionTable(name = "order_photo_urls", joinColumns = @JoinColumn(name = "order_id"))
    @Column(name = "photo_url")
    private List<String> photoUrls = new ArrayList<>();

    public Long getId() { return id; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }
    public BigDecimal getDepositAmount() { return depositAmount; }
    public void setDepositAmount(BigDecimal depositAmount) { this.depositAmount = depositAmount; }
    public BigDecimal getFinalPaymentAmount() { return finalPaymentAmount; }
    public void setFinalPaymentAmount(BigDecimal finalPaymentAmount) { this.finalPaymentAmount = finalPaymentAmount; }
    public String getStripeSessionId() { return stripeSessionId; }
    public void setStripeSessionId(String stripeSessionId) { this.stripeSessionId = stripeSessionId; }
    public String getStripeRefundId() { return stripeRefundId; }
    public void setStripeRefundId(String stripeRefundId) { this.stripeRefundId = stripeRefundId; }
    public boolean isDepositPaid() { return depositPaid; }
    public void setDepositPaid(boolean depositPaid) { this.depositPaid = depositPaid; }
    public boolean isFullPaymentPaid() { return fullPaymentPaid; }
    public void setFullPaymentPaid(boolean fullPaymentPaid) { this.fullPaymentPaid = fullPaymentPaid; }
    public Integer getServingCount() { return servingCount; }
    public void setServingCount(Integer servingCount) { this.servingCount = servingCount; }
    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
    public String getFulfillmentType() { return fulfillmentType; }
    public void setFulfillmentType(String fulfillmentType) { this.fulfillmentType = fulfillmentType; }
    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }
    public LocalDate getFulfillmentDate() { return fulfillmentDate; }
    public void setFulfillmentDate(LocalDate fulfillmentDate) { this.fulfillmentDate = fulfillmentDate; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public boolean isSmsConsent() { return smsConsent; }
    public void setSmsConsent(boolean smsConsent) { this.smsConsent = smsConsent; }
    public List<String> getPhotoUrls() { return photoUrls; }
    public void setPhotoUrls(List<String> photoUrls) { this.photoUrls = photoUrls; }
}
