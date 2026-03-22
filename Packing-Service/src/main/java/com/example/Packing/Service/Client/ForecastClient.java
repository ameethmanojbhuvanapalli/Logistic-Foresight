package com.example.Packing.Service.Client;

import com.example.Packing.Service.DTO.CounterRequestDTO;
import com.example.Packing.Service.DTO.CounterResponseDTO;
import com.example.Packing.Service.DTO.ForecastRequestDTO;
import com.example.Packing.Service.DTO.ForecastResponseDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class ForecastClient {

    @Value("${ml-service.server.url}")
    private String forecastClientUrl;

    private final RestTemplate restTemplate;

    public ForecastClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public ForecastResponseDTO getForecast(ForecastRequestDTO forecastRequestDTO){
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<ForecastRequestDTO> requestEntity = new HttpEntity<>(forecastRequestDTO, headers);

            ResponseEntity<ForecastResponseDTO> responseEntity = restTemplate.exchange(
                    forecastClientUrl + "/forecast/forecast-orders",
                    HttpMethod.POST,
                    requestEntity,
                    ForecastResponseDTO.class
            );

            if (responseEntity.getStatusCode() == HttpStatus.OK) {
                return responseEntity.getBody();
            } else {
                throw new RuntimeException("Failed to get prediction from Flask server");
            }
        } catch (Exception e) {
            throw new RuntimeException("Error during request", e);
        }
    }
}