package com.chrismerced.projects.confectionco.dtos;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateOrderRequest {

    @NotBlank
    @Size(max = 100)
    private String customerName;

    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String phoneNumber;

    @Size(max = 2000)
    private String comments;

    private String fulfillmentType = "PICKUP";

    @Size(max = 500)
    private String deliveryAddress;

    private LocalDate fulfillmentDate;

    private boolean smsConsent;

    @Valid
    private List<CreateOrderCustomItemRequest> customItems = new ArrayList<>();

    @Valid
    private List<CreateOrderFixedItemRequest> fixedItems = new ArrayList<>();

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
    public String getFulfillmentType() { return fulfillmentType; }
    public void setFulfillmentType(String fulfillmentType) { this.fulfillmentType = fulfillmentType; }
    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }
    public LocalDate getFulfillmentDate() { return fulfillmentDate; }
    public void setFulfillmentDate(LocalDate fulfillmentDate) { this.fulfillmentDate = fulfillmentDate; }
    public boolean isSmsConsent() { return smsConsent; }
    public void setSmsConsent(boolean smsConsent) { this.smsConsent = smsConsent; }
    public List<CreateOrderCustomItemRequest> getCustomItems() { return customItems; }
    public void setCustomItems(List<CreateOrderCustomItemRequest> customItems) { this.customItems = customItems; }
    public List<CreateOrderFixedItemRequest> getFixedItems() { return fixedItems; }
    public void setFixedItems(List<CreateOrderFixedItemRequest> fixedItems) { this.fixedItems = fixedItems; }
}
