package com.chrismerced.projects.confectionco.dtos;

import java.util.List;

public class CreateOrderResponse {

    private Long orderId;
    private List<ItemRef> items;

    public CreateOrderResponse(Long orderId, List<ItemRef> items) {
        this.orderId = orderId;
        this.items = items;
    }

    public Long getOrderId() { return orderId; }
    public List<ItemRef> getItems() { return items; }

    public static class ItemRef {
        private Long id;
        private String itemType;

        public ItemRef(Long id, String itemType) {
            this.id = id;
            this.itemType = itemType;
        }

        public Long getId() { return id; }
        public String getItemType() { return itemType; }
    }
}
