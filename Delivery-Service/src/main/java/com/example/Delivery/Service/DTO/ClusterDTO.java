package com.example.Delivery.Service.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class ClusterDTO {

    @JsonProperty("Cluster")
    private int clusterId;

    @JsonProperty("Orders")
    private List<Long> orders;
    @JsonProperty("Route")
    private List<LocationDTO> route;

    @JsonProperty("ItemQty")
    private int itemQty;

    @JsonProperty("Distance")
    private Double distance;

    public Double getDistance() {
        return distance;
    }

    public void setDistance(Double distance) {
        this.distance = distance;
    }

    public int getClusterId() {
        return clusterId;
    }

    public void setClusterId(int clusterId) {
        this.clusterId = clusterId;
    }

    public List<Long> getOrders() {
        return orders;
    }

    public void setOrders(List<Long> orders) {
        this.orders = orders;
    }

    public List<LocationDTO> getRoute() {
        return route;
    }

    public void setRoute(List<LocationDTO> route) {
        this.route = route;
    }

    public int getItemQty() { return itemQty; }

    public void setItemQty(int itemQty) { this.itemQty = itemQty; }

}
