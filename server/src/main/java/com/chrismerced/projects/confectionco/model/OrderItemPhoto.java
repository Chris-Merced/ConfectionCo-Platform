package com.chrismerced.projects.confectionco.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "order_item_photos")
public class OrderItemPhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_custom_item_id")
    private OrderCustomItem orderCustomItem;

    @Column(name = "photo_url")
    private String photoUrl;

    public Long getId() { return id; }
    public OrderCustomItem getOrderCustomItem() { return orderCustomItem; }
    public void setOrderCustomItem(OrderCustomItem orderCustomItem) { this.orderCustomItem = orderCustomItem; }
    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }
}
