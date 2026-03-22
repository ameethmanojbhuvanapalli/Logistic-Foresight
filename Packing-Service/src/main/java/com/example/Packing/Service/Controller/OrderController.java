package com.example.Packing.Service.Controller;

import com.example.Packing.Service.Entity.Order;
import com.example.Packing.Service.Service.OrderService;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    @Autowired
    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // Add a new order to the queue
    @PostMapping("/add")
    public String addOrderToQueue(@RequestBody Order order){
        orderService.addOrderToQueue(order);
        return "Order " + order.getOrderId() + " has been added to the queue.";
    }

    // Get the total number of orders in the queue
    @GetMapping("/queue/total-orders")
    public int getTotalOrdersInQueue() {
        return orderService.getTotalOrdersInQueue();
    }

    // Get the total number of items in the queue
    @GetMapping("/queue/total-items")
    public int getTotalItemsInQueue() {
        return orderService.getTotalItemsInQueue();
    }


}
