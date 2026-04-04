package com.example.Packing.Service.Entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "Orders")
public class Order {

    @Id
    private String id;

    @Field("ORDERID")
    private Long orderId;

    @Field("ITEMQTY")
    private Integer itemQty;

    @Field("LATITUDE")
    private Double latitude;

    @Field("LONGITUDE")
    private Double longitude;

    @Field("ORDERDT")
    private String orderDT;

    @Field("ORDERSTATUS")
    private Integer orderStatus;

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
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