package com.example.Delivery.Service.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class TSPResponseDTO {
    @JsonProperty("Route")
    private List<LocationDTO> route;

    @JsonProperty("Distance")
    private Double distance;

    public Double getDistance() {
        return distance;
    }

    public void setDistance(Double distance) {
        this.distance = distance;
    }

    public List<LocationDTO> getRoute() {
        return route;
    }

    public void setRoute(List<LocationDTO> route) {
        this.route = route;
    }
}
