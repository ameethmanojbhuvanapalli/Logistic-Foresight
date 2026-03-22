package com.example.Packing.Service.Controller;

import com.example.Packing.Service.DTO.CounterRequestDTO;
import com.example.Packing.Service.DTO.CounterResponseDTO;
import com.example.Packing.Service.Service.CounterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/counters")
public class CounterController {

    private final CounterService counterService;

    @Autowired
    public CounterController(CounterService counterService) {
        this.counterService = counterService;
    }

    @PostMapping("/predict")
    public CounterResponseDTO getCounterPrediction(@RequestBody CounterRequestDTO counterRequestDTO) {
        return counterService.getCountersPrediction(counterRequestDTO);
    }

    @GetMapping("/available-counters")
    public int getCurrentCounters() {
        return counterService.getCurrentCounterCount();
    }
}
