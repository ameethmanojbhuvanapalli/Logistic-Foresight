package com.example.Packing.Service.Service;

import com.example.Packing.Service.Client.ForecastClient;
import com.example.Packing.Service.DTO.CounterRequestDTO;
import com.example.Packing.Service.DTO.ForecastRequestDTO;
import com.example.Packing.Service.DTO.ForecastResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ForecastService {

    private final ForecastClient forecastClient;
    private final HelperService helperService;
    private final CounterService counterService;
    private final TimerService timerService;
    private final OrderService orderService;

    @Autowired
    public ForecastService(ForecastClient forecastClient, CounterService counterService, HelperService helperService, TimerService timerService, OrderService orderService) {
        this.forecastClient = forecastClient;
        this.helperService = helperService;
        this.counterService = counterService;
        this.timerService = timerService;
        this.orderService = orderService;
    }

    public ForecastResponseDTO getForecastAndCounters(ForecastRequestDTO forecastRequestDTO) {
        // Get predicted orders from ForecastClient
        var forecastResponse = forecastClient.getForecast(forecastRequestDTO);

        CounterRequestDTO counterRequestDTO = new CounterRequestDTO(
                orderService.getTotalOrdersInQueue()+forecastResponse.getOrderQty(),
                orderService.getTotalItemsInQueue()+forecastResponse.getItemQty(),
                helperService.getNoOfHelpers(),
                timerService.getCurrentTimeLimit()+(forecastRequestDTO.getHours()*60)
        );

        int futureCounters=counterService.getCountersPrediction(counterRequestDTO).getPredictedCounters();
        System.out.println(futureCounters);

        int extracounters=Math.max(
                futureCounters-
                counterService.getCurrentCounterCount(),
                0
        );

        counterService.setFutureCounters(extracounters);
        forecastResponse.setCounters(extracounters);

        return forecastResponse;
    }
}
