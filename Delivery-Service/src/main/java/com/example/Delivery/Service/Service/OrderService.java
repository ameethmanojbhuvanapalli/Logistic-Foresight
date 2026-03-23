package com.example.Delivery.Service.Service;

import com.example.Delivery.Service.DTO.ClusterDTO;
import com.example.Delivery.Service.DTO.ClusterRequestDTO;
import com.example.Delivery.Service.DTO.LocationDTO;
import com.example.Delivery.Service.Entity.Order;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.ArrayList;
import java.util.Objects;
import java.util.concurrent.CompletableFuture;

@Service
public class OrderService {

    private final List<Order> orders = new ArrayList<>();
    private final List<ClusterDTO> activeClusters = new ArrayList<>();

    @Autowired
    private ClusterService clusterService;

    public void addOrder(Order order) {
        orders.add(order);
    }

    @Async
    public CompletableFuture<List<ClusterDTO>> clusterOrders(ClusterRequestDTO clusterRequestDTO) {
        clusterRequestDTO.setOrders(orders);
        return clusterService.clusterOrders(clusterRequestDTO)
                .thenApply(clusters -> {
                    activeClusters.clear();
                    activeClusters.addAll(clusters);
                    return clusters;
                });
    }

    public boolean deliverCluster(int clusterId) {
        ClusterDTO clusterToDeliver = activeClusters.stream()
                .filter(cluster -> Objects.equals(cluster.getClusterId(), clusterId))
                .findFirst()
                .orElse(null);

        if (clusterToDeliver != null) {
            activeClusters.remove(clusterToDeliver);
            List<Long> ordersToRemove = clusterToDeliver.getOrders();
            orders.removeIf(order -> ordersToRemove.contains(order.getOrderId()));
            return true;
        }
        return false;
    }

    public List<ClusterDTO> getActiveClusters() {
        return activeClusters;
    }
}
