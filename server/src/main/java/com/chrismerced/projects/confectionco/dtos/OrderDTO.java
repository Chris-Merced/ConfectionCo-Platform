package com.chrismerced.projects.confectionco.dtos;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

import com.chrismerced.projects.confectionco.model.Order;

public class OrderDTO {

    private Long id;
    private String customerName;
    private String email;
    private String phoneNumber;
    private String status;
    private BigDecimal totalAmount;
    private BigDecimal depositAmount;
    private BigDecimal finalPaymentAmount;
    private BigDecimal refundAmount;
    private boolean depositPaid;
    private boolean fullPaymentPaid;
    private String comments;
    private String fulfillmentType;
    private String deliveryAddress;
    private LocalDate fulfillmentDate;
    private OffsetDateTime createdAt;
    private boolean smsConsent;
    private String paymentLinkToken;
    private List<String> photoUrls;
    private List<OrderCustomItemDTO> customItems;
    private List<OrderFixedItemDTO> fixedItems;

    public OrderDTO(Order order, String bucketUrl,
                    List<OrderCustomItemDTO> customItems,
                    List<OrderFixedItemDTO> fixedItems) {
        this.id = order.getId();
        this.customerName = order.getCustomerName();
        this.email = order.getEmail();
        this.phoneNumber = order.getPhoneNumber();
        this.status = order.getStatus().name();
        this.totalAmount = order.getTotalAmount();
        this.depositAmount = order.getDepositAmount();
        this.finalPaymentAmount = order.getFinalPaymentAmount();
        this.refundAmount = order.getRefundAmount();
        this.depositPaid = order.isDepositPaid();
        this.fullPaymentPaid = order.isFullPaymentPaid();
        this.comments = order.getComments();
        this.fulfillmentType = order.getFulfillmentType();
        this.deliveryAddress = order.getDeliveryAddress();
        this.fulfillmentDate = order.getFulfillmentDate();
        this.createdAt = order.getCreatedAt();
        this.smsConsent = order.isSmsConsent();
        this.paymentLinkToken = order.getPaymentLinkToken();
        this.photoUrls = order.getPhotoUrls()
                .stream()
                .map(key -> bucketUrl + "/" + key)
                .collect(Collectors.toList());
        this.customItems = customItems;
        this.fixedItems = fixedItems;
    }

    public Long getId() { return id; }
    public String getCustomerName() { return customerName; }
    public String getEmail() { return email; }
    public String getPhoneNumber() { return phoneNumber; }
    public String getStatus() { return status; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public BigDecimal getDepositAmount() { return depositAmount; }
    public BigDecimal getFinalPaymentAmount() { return finalPaymentAmount; }
    public BigDecimal getRefundAmount() { return refundAmount; }
    public boolean isDepositPaid() { return depositPaid; }
    public boolean isFullPaymentPaid() { return fullPaymentPaid; }
    public String getComments() { return comments; }
    public String getFulfillmentType() { return fulfillmentType; }
    public String getDeliveryAddress() { return deliveryAddress; }
    public LocalDate getFulfillmentDate() { return fulfillmentDate; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public boolean isSmsConsent() { return smsConsent; }
    public String getPaymentLinkToken() { return paymentLinkToken; }
    public List<String> getPhotoUrls() { return photoUrls; }
    public List<OrderCustomItemDTO> getCustomItems() { return customItems; }
    public List<OrderFixedItemDTO> getFixedItems() { return fixedItems; }
}
