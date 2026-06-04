package com.chrismerced.projects.confectionco.dtos;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import com.chrismerced.projects.confectionco.model.OrderCustomItem;

public class OrderCustomItemDTO {

    private Long id;
    private String itemType;
    private String sizeLabel;
    private BigDecimal sizePrice;
    private String flavorName;
    private String flavor2Name;
    private String fillingName;
    private String buttercreamName;
    private String colorPreference;
    private String pieStyleName;
    private boolean glutenFree;
    private String cheesecakeCrustName;
    private int quantity;
    private String comments;
    private List<String> photoUrls;

    public OrderCustomItemDTO(OrderCustomItem item, String bucketUrl) {
        this.id = item.getId();
        this.itemType = item.getItemType();
        this.sizeLabel = item.getSize() != null ? item.getSize().getLabel() : null;
        this.sizePrice = item.getSize() != null ? item.getSize().getPrice() : null;
        this.flavorName = item.getFlavor() != null ? item.getFlavor().getName() : null;
        this.flavor2Name = item.getFlavor2() != null ? item.getFlavor2().getName() : null;
        this.fillingName = item.getFilling() != null ? item.getFilling().getName() : null;
        this.buttercreamName = item.getButtercream() != null ? item.getButtercream().getName() : null;
        this.colorPreference = item.getColorPreference();
        this.pieStyleName = item.getPieStyle() != null ? item.getPieStyle().getName() : null;
        this.glutenFree = item.isGlutenFree();
        this.cheesecakeCrustName = item.getCheesecakeCrust() != null ? item.getCheesecakeCrust().getName() : null;
        this.quantity = item.getQuantity();
        this.comments = item.getComments();
        this.photoUrls = item.getPhotos().stream()
                .map(photo -> bucketUrl + "/" + photo.getPhotoUrl())
                .collect(Collectors.toList());
    }

    public Long getId() { return id; }
    public String getItemType() { return itemType; }
    public String getSizeLabel() { return sizeLabel; }
    public BigDecimal getSizePrice() { return sizePrice; }
    public String getFlavorName() { return flavorName; }
    public String getFlavor2Name() { return flavor2Name; }
    public String getFillingName() { return fillingName; }
    public String getButtercreamName() { return buttercreamName; }
    public String getColorPreference() { return colorPreference; }
    public String getPieStyleName() { return pieStyleName; }
    public boolean isGlutenFree() { return glutenFree; }
    public String getCheesecakeCrustName() { return cheesecakeCrustName; }
    public int getQuantity() { return quantity; }
    public String getComments() { return comments; }
    public List<String> getPhotoUrls() { return photoUrls; }
}
