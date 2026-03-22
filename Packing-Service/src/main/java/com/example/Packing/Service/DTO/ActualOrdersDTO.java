package com.example.Packing.Service.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ActualOrdersDTO {

    @JsonProperty("ds")
    private String dateTime;

    @JsonProperty("y")
    private double orderItemCount;

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
