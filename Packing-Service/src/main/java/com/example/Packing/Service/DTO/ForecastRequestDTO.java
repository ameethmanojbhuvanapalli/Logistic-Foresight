package com.example.Packing.Service.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ForecastRequestDTO {

    @JsonProperty("Weeks")
    private int weeks;

    @JsonProperty("Hours")
    private int hours;


    public int getHours() {
        return hours;
    }

    public void setHours(int hours) {
        this.hours = hours;
    }

    public ForecastRequestDTO(int weeks, int hours) {
        this.weeks = weeks;
        this.hours=hours;
    }

    public int getWeeks() {
        return weeks;
    }

    public void setWeeks(int weeks) {
        this.weeks = weeks;
    }
}
