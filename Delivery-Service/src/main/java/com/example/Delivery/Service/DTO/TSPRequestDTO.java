package com.example.Delivery.Service.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class TSPRequestDTO {
    @JsonProperty("OrderLocations")
    List<LocationDTO> orderLocations;
    @JsonProperty("Warehouse")
    LocationDTO warehouse;

    public TSPRequestDTO(List<LocationDTO> orderLocations, LocationDTO warehouse) {
        this.orderLocations = orderLocations;
        this.warehouse = warehouse;
    }

    public List<LocationDTO> getOrderLocations() {
        return orderLocations;
    }

    public void setOrderLocations(List<LocationDTO> orderLocations) {
        this.orderLocations = orderLocations;
    }

    public LocationDTO getWarehouse() {
        return warehouse;
    }

    public void setWarehouse(LocationDTO warehouse) {
        this.warehouse = warehouse;
    }
}
