package com.example.Packing.Service.Service;

import com.example.Packing.Service.Entity.Order;
import com.example.Packing.Service.Repository.OrderRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Iterator;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class OrderService {

    @Value("${max.threads}")
    private int maxThreads;

    @Value("${item.processing.time}")
    private int processingTime;

    @Value("${helper.coeff}")
    private double helperCoeff;
    private final BlockingQueue<Order> orderQueue = new LinkedBlockingQueue<>();
    private final ConcurrentHashMap<Order, Integer> orderRequirements = new ConcurrentHashMap<>(); // To track item requirements per order
    private final AtomicInteger totalOrdersInQueue = new AtomicInteger(0);
    private final AtomicInteger totalItemsInQueue = new AtomicInteger(0);
    private final AtomicInteger processedItems = new AtomicInteger(0);
    private final Semaphore itemsAvailable = new Semaphore(0);

    @Autowired
    private CounterService counterService;

    @Autowired
    private HelperService helperService;

    @Autowired
    private KafkaProducerService kafkaProducerService;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public OrderService() {
        processQueue();
    }

    public void addOrderToQueue(Order order) {
        orderQueue.add(order);
        totalOrdersInQueue.incrementAndGet();
        totalItemsInQueue.addAndGet(order.getItemQty());
        orderRequirements.put(order, order.getItemQty()); // Initialize the order requirement in the map

        System.out.println(totalOrdersInQueue + "-" + totalItemsInQueue);
        System.out.println("Order " + order.getOrderId() + " added to queue.");

        itemsAvailable.release(order.getItemQty()); // signal that items are available

        messagingTemplate.convertAndSend("/topic/order-updates", totalOrdersInQueue + "-" + totalItemsInQueue);

        counterService.updateCounters(getTotalOrdersInQueue(), getTotalItemsInQueue());
    }

    private void processQueue() {
        Executors.newSingleThreadExecutor().submit(() -> {
            while (true) {
                try {
                    itemsAvailable.acquire(); // blocks until an item is available, no busy-wait

                    Future<Integer> futureCounter = counterService.acquireCounterAsync();
                    Integer counterId = futureCounter.get();

                    if (counterId == null || counterId == -1) {
                        itemsAvailable.release(); // put the permit back
                        continue;
                    }

                    counterService.executorService.submit(() -> {
                        try {
                            processItems(counterId);
                            counterService.releaseCounterAsync(counterId).get();
                            System.out.println("Counter " + counterId + " has been released.");
                        } catch (InterruptedException | ExecutionException e) {
                            System.out.println("Error processing item: " + e.getMessage());
                        }
                    });

                } catch (InterruptedException | ExecutionException e) {
                    Thread.currentThread().interrupt();
                    System.out.println("Processing interrupted.");
                    break;
                }
            }
        });
    }

    private void processItems(Integer counterId) {
        synchronized (this) { // Ensure thread-safe access to shared state
            if (totalItemsInQueue.get() <= 0) {
                System.out.println("No items to process.");
                return; // Exit if there are no items left
            }
        }
        try {
            // Simulate item processing
            String message = totalItemsInQueue.get()+"-"+"Counter " + counterId + " is busy.";
            messagingTemplate.convertAndSend("/topic/counter-updates", message);
            Thread.sleep((long) (processingTime-(helperService.getNoOfHelpers() * helperCoeff)*1000));  // Adjust processing time as needed
            // Decrement items in the queue and increment processed items
            synchronized (this) { // Use synchronized block for thread safety
                totalItemsInQueue.decrementAndGet();
                processedItems.incrementAndGet();
            }
            messagingTemplate.convertAndSend("/topic/counter-updates", totalItemsInQueue.get()+"-"+"Counter " + counterId + " is free");


            // Process orders after item processing
            processOrders();

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();  // Handle interruption
            System.out.println("Item processing interrupted.");
        }
    }




    private synchronized void processOrders() {
        // Iterate over the order queue and allow orders to pick items
        for (Iterator<Order> iterator = orderQueue.iterator(); iterator.hasNext();) {
            Order order = iterator.next();
            int requiredItems = orderRequirements.get(order); // Get the required item quantity from the map

            while (requiredItems > 0 && processedItems.get() > 0) {
                // Check if items are available for picking
                if (processedItems.get() > 0) {
                    requiredItems--; // Decrease the temporary item requirement
                    processedItems.decrementAndGet(); // Decrease the total item count
                    System.out.println("Order " + order.getOrderId() + " picked an item. Remaining: " + requiredItems);

                    // Update the map with the new requirement
                    orderRequirements.put(order, requiredItems);

                    // If the order is satisfied, complete the order
                    if (requiredItems == 0) {
                        try {
                            completeOrder(order); // Complete the order
                        } catch (JsonProcessingException e) {
                            System.out.println("Error: " + e);
                        }
                        iterator.remove(); // Remove the order from the queue
                        orderRequirements.remove(order); // Remove the order from the map as well
                        System.out.println("Order " + order.getOrderId() + " is completed and removed from the queue.");
                    }
                }
            }
        }
    }

    private void completeOrder(Order order) throws JsonProcessingException {
        System.out.println("Order " + order.getOrderId() + " in process.");

        order.setOrderStatus(2);
        orderRepository.save(order);
        System.out.println("Order " + order.getOrderId() + " saved to MongoDB.");

        try {
            kafkaProducerService.publishCompletedOrder(order);
            System.out.println("Order " + order.getOrderId() + " published to Kafka.");
        } catch (Exception e) {
            System.out.println("ERROR publishing order " + order.getOrderId() + " to Kafka: " + e.getMessage());
            e.printStackTrace();
        }


        totalOrdersInQueue.decrementAndGet();

        messagingTemplate.convertAndSend("/topic/order-complete", totalOrdersInQueue.get()+"-"+"Order " + order.getOrderId()+" Processed");

        System.out.println("Updated queue: Orders in queue: " + totalOrdersInQueue.get() +
                ", Items in queue: " + totalItemsInQueue.get());
    }

    public int getTotalOrdersInQueue() {
        return totalOrdersInQueue.get();
    }

    public int getTotalItemsInQueue() {
        return totalItemsInQueue.get();
    }

}
