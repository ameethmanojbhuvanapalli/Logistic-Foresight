package com.example.Delivery.Service.Client;

import com.example.Delivery.Service.DTO.ClusterDTO;
import com.example.Delivery.Service.DTO.ClusterRequestDTO;
import com.example.Delivery.Service.Entity.Order;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Component
public class ClusterClient {
    @Value("${ml-service.server.url}")
    private String clusterClientUrl;

    private final RestTemplate restTemplate;

    public ClusterClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }


    public List<ClusterDTO> getClusters(ClusterRequestDTO clusterRequestDTO) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<ClusterRequestDTO> requestEntity = new HttpEntity<>(clusterRequestDTO, headers);

            // Using ParameterizedTypeReference to handle generic type properly
            ParameterizedTypeReference<List<ClusterDTO>> responseType = new ParameterizedTypeReference<List<ClusterDTO>>() {};

            ResponseEntity<List<ClusterDTO>> responseEntity = restTemplate.exchange(
                    clusterClientUrl + "/cluster/cluster-orders",
                    HttpMethod.POST,
                    requestEntity,
                    responseType
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
