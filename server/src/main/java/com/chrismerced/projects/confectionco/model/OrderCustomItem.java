package com.chrismerced.projects.confectionco.model;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "order_custom_items")
public class OrderCustomItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id")
    private Long orderId;

    @Column(name = "item_type")
    private String itemType;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "size_id")
    private ItemSize size;

    private int quantity = 1;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "flavor_id")
    private FlavorOption flavor;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "flavor_2_id")
    private FlavorOption flavor2;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "filling_id")
    private FillingOption filling;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "buttercream_id")
    private ButtercreamOption buttercream;

    @Column(name = "color_preference")
    private String colorPreference;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "pie_style_id")
    private PieStyleOption pieStyle;

    @Column(name = "gluten_free")
    private boolean glutenFree;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cheesecake_crust_id")
    private CheesecakeCrustOption cheesecakeCrust;

    private String comments;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    @OneToMany(mappedBy = "orderCustomItem", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<OrderItemPhoto> photos = new ArrayList<>();

    public Long getId() { return id; }
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    public String getItemType() { return itemType; }
    public void setItemType(String itemType) { this.itemType = itemType; }
    public ItemSize getSize() { return size; }
    public void setSize(ItemSize size) { this.size = size; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public FlavorOption getFlavor() { return flavor; }
    public void setFlavor(FlavorOption flavor) { this.flavor = flavor; }
    public FlavorOption getFlavor2() { return flavor2; }
    public void setFlavor2(FlavorOption flavor2) { this.flavor2 = flavor2; }
    public FillingOption getFilling() { return filling; }
    public void setFilling(FillingOption filling) { this.filling = filling; }
    public ButtercreamOption getButtercream() { return buttercream; }
    public void setButtercream(ButtercreamOption buttercream) { this.buttercream = buttercream; }
    public String getColorPreference() { return colorPreference; }
    public void setColorPreference(String colorPreference) { this.colorPreference = colorPreference; }
    public PieStyleOption getPieStyle() { return pieStyle; }
    public void setPieStyle(PieStyleOption pieStyle) { this.pieStyle = pieStyle; }
    public boolean isGlutenFree() { return glutenFree; }
    public void setGlutenFree(boolean glutenFree) { this.glutenFree = glutenFree; }
    public CheesecakeCrustOption getCheesecakeCrust() { return cheesecakeCrust; }
    public void setCheesecakeCrust(CheesecakeCrustOption cheesecakeCrust) { this.cheesecakeCrust = cheesecakeCrust; }
    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public List<OrderItemPhoto> getPhotos() { return photos; }
    public void setPhotos(List<OrderItemPhoto> photos) { this.photos = photos; }
}
