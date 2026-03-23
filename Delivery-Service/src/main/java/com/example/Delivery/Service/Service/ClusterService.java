package com.example.Delivery.Service.Service;

import com.example.Delivery.Service.Client.ClusterClient;
import com.example.Delivery.Service.DTO.*;
import com.example.Delivery.Service.Entity.Order;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
public class ClusterService {

    @Autowired
    private ClusterClient clusterClient;

    @Autowired
    private TSPService tspService;

    @Async
    public CompletableFuture<List<ClusterDTO>> clusterOrders(ClusterRequestDTO clusterRequestDTO) {

        Map<Long, LocationDTO> orderLocationMap = clusterRequestDTO.getOrders().stream()
                .collect(Collectors.toMap(
                        Order::getOrderId,
                        order -> new LocationDTO(order.getLatitude(), order.getLongitude())
                ));

        List<ClusterDTO> clusters = clusterClient.getClusters(clusterRequestDTO);

        // Perform TSP route optimization with unique locations
        clusters.forEach(cluster -> {
            Set<LocationDTO> uniqueLocations = new HashSet<>();
            cluster.getOrders().forEach(orderId -> {
                LocationDTO location = orderLocationMap.get(orderId);
                uniqueLocations.add(location);
            });

            List<LocationDTO> locationList = new ArrayList<>(uniqueLocations);
            TSPRequestDTO tspRequestDTO = new TSPRequestDTO(locationList,clusterRequestDTO.getWarehouse());
            TSPResponseDTO tspResponseDTO = tspService.getRoute(tspRequestDTO);
            cluster.setRoute(tspResponseDTO.getRoute());
            cluster.setDistance(tspResponseDTO.getDistance());
        });

        return CompletableFuture.completedFuture(clusters);
    }

}
