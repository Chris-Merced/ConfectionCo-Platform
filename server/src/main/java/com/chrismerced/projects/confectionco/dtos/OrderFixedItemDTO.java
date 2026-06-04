package com.chrismerced.projects.confectionco.dtos;

import java.math.BigDecimal;

import com.chrismerced.projects.confectionco.model.OrderFixedItem;

public class OrderFixedItemDTO {

    private Long id;
    private String productName;
    private String description;
    private BigDecimal price;
    private String unitDescription;
    private int quantity;

    public OrderFixedItemDTO(OrderFixedItem item) {
        this.id = item.getId();
        this.productName = item.getFixedProduct().getName();
        this.description = item.getFixedProduct().getDescription();
        this.price = item.getFixedProduct().getPrice();
        this.unitDescription = item.getFixedProduct().getUnitDescription();
        this.quantity = item.getQuantity();
    }

    public Long getId() { return id; }
    public String getProductName() { return productName; }
    public String getDescription() { return description; }
    public BigDecimal getPrice() { return price; }
    public String getUnitDescription() { return unitDescription; }
    public int getQuantity() { return quantity; }
}
