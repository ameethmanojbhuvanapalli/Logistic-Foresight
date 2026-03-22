package com.example.Packing.Service.Entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "Orders")
public class Order {

    @Id
    private String id;  // This will be generated automatically by MongoDB

    @JsonProperty("ORDERID")
    private Long orderId;  // This is your custom orderId field

    @JsonProperty("ITEMQTY")
    private Integer itemQty;

    @JsonProperty("LATITUDE")
    private Double latitude;

    @JsonProperty("LONGITUDE")
    private Double longitude;

    @JsonProperty("ORDERDT")
    private String orderDT;

    @JsonProperty("ORDERSTATUS")
    private Integer orderStatus;

    // Getters and Setters
    public String getId() {  // Getter for MongoDB's generated _id field
        return id;
    }

    public void setId(String id) {  // Setter for MongoDB's generated _id field (optional)
        this.id = id;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public Integer getItemQty() {
        return itemQty;
    }

    public void setItemQty(Integer itemQty) {
        this.itemQty = itemQty;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getOrderDT() {
        return orderDT;
    }

    public void setOrderDT(String orderDT) {
        this.orderDT = orderDT;
    }

    public Integer getOrderStatus() {
        return orderStatus;
    }

    public void setOrderStatus(Integer orderStatus) {
        this.orderStatus = orderStatus;
    }
}
