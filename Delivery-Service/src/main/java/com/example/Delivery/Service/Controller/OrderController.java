package com.example.Delivery.Service.Controller;

import com.example.Delivery.Service.DTO.ClusterDTO;
import com.example.Delivery.Service.DTO.ClusterRequestDTO;
import com.example.Delivery.Service.Entity.Order;
import com.example.Delivery.Service.Service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping("/add")
    public ResponseEntity<String> addOrder(@RequestBody Order order) {
        orderService.addOrder(order);
        return ResponseEntity.ok("Order added successfully!");
    }

    @PostMapping("/cluster")
    public CompletableFuture<ResponseEntity<List<ClusterDTO>>> clusterOrders(@RequestBody ClusterRequestDTO clusterRequestDTO) {
        return orderService.clusterOrders(clusterRequestDTO)
                .thenApply(clusters -> ResponseEntity.ok(clusters));
    }

    // Deliver a specific cluster and remove its orders
    @PostMapping("/deliver/{clusterId}")
    public ResponseEntity<String> deliverCluster(@PathVariable int clusterId) {
        boolean isDelivered = orderService.deliverCluster(clusterId);

        if (isDelivered) {
            return ResponseEntity.ok("Orders in Cluster delivered successfully!");
        } else {
            return ResponseEntity.status(404).body("Cluster not found");
        }
    }

    @GetMapping("/clusters")
    public ResponseEntity<List<ClusterDTO>> getActiveClusters() {
        List<ClusterDTO> activeClusters = orderService.getActiveClusters();
        return ResponseEntity.ok(activeClusters);
    }
}
