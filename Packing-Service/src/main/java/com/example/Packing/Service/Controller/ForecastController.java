package com.example.Packing.Service.Controller;

import com.example.Packing.Service.DTO.ForecastRequestDTO;
import com.example.Packing.Service.DTO.ForecastResponseDTO;
import com.example.Packing.Service.Service.ForecastService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/forecast")
public class ForecastController {

    private final ForecastService forecastService;

    @Autowired
    public ForecastController(ForecastService forecastService) {
        this.forecastService = forecastService;
    }

    @PostMapping("/prediction")
    public ForecastResponseDTO getForecastAndCounters(@RequestBody ForecastRequestDTO forecastRequestDTO) {
        return forecastService.getForecastAndCounters(forecastRequestDTO);
    }
}
