package com.example.Delivery.Service.Client;

import com.example.Delivery.Service.DTO.ClusterDTO;
import com.example.Delivery.Service.DTO.LocationDTO;
import com.example.Delivery.Service.DTO.TSPRequestDTO;
import com.example.Delivery.Service.DTO.TSPResponseDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.List;


@Component
public class TSPClient {
    @Value("${ml-service.server.url}")
    private String tspClientUrl;

    private final RestTemplate restTemplate;

    public TSPClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }


    public TSPResponseDTO getRoute(TSPRequestDTO tspRequestDTO) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<TSPRequestDTO> requestEntity = new HttpEntity<>(tspRequestDTO, headers);

            ResponseEntity<TSPResponseDTO> responseEntity = restTemplate.exchange(
                    tspClientUrl + "/route/get-route",
                    HttpMethod.POST,
                    requestEntity,
                    TSPResponseDTO.class
            );

            if (responseEntity.getStatusCode() == HttpStatus.OK) {
                return responseEntity.getBody();
            } else {
                throw new RuntimeException("Failed to get clusters from the Flask server: " + responseEntity.getStatusCode());
            }
        } catch (RestClientException e) {
            throw new RuntimeException("Error during request to Flask server", e);
        }
    }

}

