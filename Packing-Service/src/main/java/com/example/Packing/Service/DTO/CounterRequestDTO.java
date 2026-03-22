package com.example.Packing.Service.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;

public class CounterRequestDTO {

    @JsonProperty("OrderCount")
    private int orderCount;

    public CounterRequestDTO(int orderCount, int totalItemQty, int noOfHelpers, int timeGivenToComplete) {
        this.orderCount = orderCount;
        this.totalItemQty = totalItemQty;
        this.noOfHelpers = noOfHelpers;
        this.timeGivenToComplete = timeGivenToComplete;
    }

    @JsonProperty("TotalItemQty")
    private int totalItemQty;

    @JsonProperty("NoOfHelpers")
    private int noOfHelpers;

    @JsonProperty("TimeGivenToComplete")
    private int timeGivenToComplete;

    // Getters and Setters

    public int getOrderCount() { return orderCount; }
    public void setOrderCount(int orderCount) { this.orderCount = orderCount; }

    public int getTotalItemQty() { return totalItemQty; }
    public void setTotalItemQty(int totalItemQty) { this.totalItemQty = totalItemQty; }

    public int getTimeGivenToComplete() { return timeGivenToComplete; }
    public void setTimeGivenToComplete(int timeGivenToComplete) { this.timeGivenToComplete = timeGivenToComplete; }
}
