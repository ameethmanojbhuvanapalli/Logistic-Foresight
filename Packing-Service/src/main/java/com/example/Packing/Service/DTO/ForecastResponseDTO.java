package com.example.Packing.Service.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class ForecastResponseDTO {
    @JsonProperty("actual_orders")
    private List<ActualOrdersDTO> actualOrders;

    @JsonProperty("predicted_orders")
    private List<OrderPredictionDTO> predictedOrders;

    @JsonProperty("rmse")
    private double rmse;

    @JsonProperty("order_qty")
    private int orderQty;

    @JsonProperty("item_qty")
    private int itemQty;

    @JsonProperty("predicted_counters")
    private int counters;

    public int getCounters() {
        return counters;
    }

    public void setCounters(int counters) {
        this.counters = counters;
    }

    public List<OrderPredictionDTO> getPredictedOrders() {
        return predictedOrders;
    }

    public void setPredictedOrders(List<OrderPredictionDTO> predictedOrders) {
        this.predictedOrders = predictedOrders;
    }

    public int getOrderQty() {
        return orderQty;
    }

    public void setOrderQty(int orderQty) {
        this.orderQty = orderQty;
    }

    public int getItemQty() {
        return itemQty;
    }

    public void setItemQty(int itemQty) {
        this.itemQty = itemQty;
    }

    // Getters and setters
    public List<ActualOrdersDTO> getActualOrders() {
        return actualOrders;
    }

    public void setActualOrders(List<ActualOrdersDTO> actualOrders) {
        this.actualOrders = actualOrders;
    }

    public double getRmse() {
        return rmse;
    }

    public void setRmse(double rmse) {
        this.rmse = rmse;
    }
}
