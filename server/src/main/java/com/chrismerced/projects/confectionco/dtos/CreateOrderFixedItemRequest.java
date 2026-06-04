package com.chrismerced.projects.confectionco.dtos;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class CreateOrderFixedItemRequest {

    @NotNull
    private Long fixedProductId;

    @Min(1)
    private int quantity = 1;

    public Long getFixedProductId() { return fixedProductId; }
    public void setFixedProductId(Long fixedProductId) { this.fixedProductId = fixedProductId; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
}
