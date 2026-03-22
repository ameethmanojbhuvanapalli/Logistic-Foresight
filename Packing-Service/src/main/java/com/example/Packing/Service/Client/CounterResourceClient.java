package com.example.Packing.Service.Client;

import com.example.Packing.Service.DTO.CounterRequestDTO;
import com.example.Packing.Service.DTO.CounterResponseDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class CounterResourceClient {

    @Value("${ml-service.server.url}")
    private String counterResourceClientUrl;

    private final RestTemplate restTemplate;

    public CounterResourceClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public CounterResponseDTO getPrediction(CounterRequestDTO requestDto) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<CounterRequestDTO> requestEntity = new HttpEntity<>(requestDto, headers);

            ResponseEntity<CounterResponseDTO> responseEntity = restTemplate.exchange(
                    counterResourceClientUrl + "/counter/predict-counters",
                    HttpMethod.POST,
                    requestEntity,
                    CounterResponseDTO.class
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