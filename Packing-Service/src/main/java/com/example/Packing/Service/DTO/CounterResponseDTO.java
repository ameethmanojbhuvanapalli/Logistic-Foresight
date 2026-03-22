package com.example.Packing.Service.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;

public class CounterResponseDTO {
    @JsonProperty("predicted_counters")
    private int predictedCounters;

    public int getPredictedCounters() { return predictedCounters; }
    public void setPredictedCounters(int predictedCounters) { this.predictedCounters = predictedCounters; }
}