package com.chrismerced.projects.confectionco.dtos;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateOrderCustomItemRequest {

    @NotBlank
    private String itemType;

    private Long sizeId;

    @Min(1)
    private int quantity = 1;

    private Long flavorId;
    private Long flavor2Id;
    private Long fillingId;
    private Long buttercreamId;

    @Size(max = 500)
    private String colorPreference;

    private Long pieStyleId;
    private boolean glutenFree;
    private Long cheesecakeCrustId;

    @Size(max = 2000)
    private String comments;

    public String getItemType() { return itemType; }
    public void setItemType(String itemType) { this.itemType = itemType; }
    public Long getSizeId() { return sizeId; }
    public void setSizeId(Long sizeId) { this.sizeId = sizeId; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public Long getFlavorId() { return flavorId; }
    public void setFlavorId(Long flavorId) { this.flavorId = flavorId; }
    public Long getFlavor2Id() { return flavor2Id; }
    public void setFlavor2Id(Long flavor2Id) { this.flavor2Id = flavor2Id; }
    public Long getFillingId() { return fillingId; }
    public void setFillingId(Long fillingId) { this.fillingId = fillingId; }
    public Long getButtercreamId() { return buttercreamId; }
    public void setButtercreamId(Long buttercreamId) { this.buttercreamId = buttercreamId; }
    public String getColorPreference() { return colorPreference; }
    public void setColorPreference(String colorPreference) { this.colorPreference = colorPreference; }
    public Long getPieStyleId() { return pieStyleId; }
    public void setPieStyleId(Long pieStyleId) { this.pieStyleId = pieStyleId; }
    public boolean isGlutenFree() { return glutenFree; }
    public void setGlutenFree(boolean glutenFree) { this.glutenFree = glutenFree; }
    public Long getCheesecakeCrustId() { return cheesecakeCrustId; }
    public void setCheesecakeCrustId(Long cheesecakeCrustId) { this.cheesecakeCrustId = cheesecakeCrustId; }
    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
}
