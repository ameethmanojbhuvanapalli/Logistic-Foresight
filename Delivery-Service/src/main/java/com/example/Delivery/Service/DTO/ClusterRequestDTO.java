package com.example.Delivery.Service.DTO;

import com.example.Delivery.Service.Entity.Order;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class ClusterRequestDTO {
    @JsonProperty("Orders")
    private List<Order> orders;
    @JsonProperty("VehicleCapacity")
    private int vehicleCapacity;

    @JsonProperty("Warehouse")
    private LocationDTO warehouse;

    public LocationDTO getWarehouse() {
        return warehouse;
    }

    public void setWarehouse(LocationDTO warehouse) {
        this.warehouse = warehouse;
    }

    public ClusterRequestDTO(List<Order> orders, int vehicleCapacity, LocationDTO warehouse) {
        this.orders=orders;
        this.vehicleCapacity=vehicleCapacity;
        this.warehouse=warehouse;
    }

    public List<Order> getOrders() {
        return orders;
    }

    public void setOrders(List<Order> orders) {
        this.orders = orders;
    }

    public int getVehicleCapacity() {
        return vehicleCapacity;
    }

    public void setVehicleCapacity(int vehicleCapacity) {
        this.vehicleCapacity = vehicleCapacity;
    }
}
