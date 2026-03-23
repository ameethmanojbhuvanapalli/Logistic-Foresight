package com.example.Delivery.Service.Service;

import com.example.Delivery.Service.Client.TSPClient;
import com.example.Delivery.Service.DTO.ClusterDTO;
import com.example.Delivery.Service.DTO.LocationDTO;
import com.example.Delivery.Service.DTO.TSPRequestDTO;
import com.example.Delivery.Service.DTO.TSPResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TSPService {
    @Autowired
    private TSPClient tspClient;

    public TSPResponseDTO getRoute(TSPRequestDTO locations){
        return tspClient.getRoute(locations);
    }
}
