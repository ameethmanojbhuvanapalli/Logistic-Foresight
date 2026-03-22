package com.example.Packing.Service.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;

public class OrderPredictionDTO {

    @JsonProperty("ds")
    private String dateTime;

    @JsonProperty("yhat")
    private double orderItemCount;

    @JsonProperty("yhat_lower")
    private double yhatLower;

    public double getYhatLower() {
        return yhatLower;
    }

    public void setYhatLower(double yhatLower) {
        this.yhatLower = yhatLower;
    }

    public double getYhatUpper() {
        return yhatUpper;
    }

    public void setYhatUpper(double yhatUpper) {
        this.yhatUpper = yhatUpper;
    }

    @JsonProperty("yhat_upper")
    private double yhatUpper;

    // Getters and setters
    public String getDateTime() {
        return dateTime;
    }

    public void setDateTime(String dateTime) {
        this.dateTime = dateTime;
    }

    public double getOrderItemCount() {
        return orderItemCount;
    }

    public void setOrderItemCount(double orderItemCount) {
        this.orderItemCount = orderItemCount;
    }
}