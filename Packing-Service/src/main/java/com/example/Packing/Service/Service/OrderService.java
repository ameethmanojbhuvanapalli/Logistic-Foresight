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

    @Value("${item.processing.time}")
    private int processingTime;

    @Value("${helper.coeff}")
    private double helperCoeff;

    private final BlockingQueue<Order> orderQueue = new LinkedBlockingQueue<>();
    private final ConcurrentHashMap<Order, Integer> orderRequirements = new ConcurrentHashMap<>();
    private final AtomicInteger totalOrdersInQueue = new AtomicInteger(0);
    private final AtomicInteger totalItemsInQueue = new AtomicInteger(0);
    private final AtomicInteger processedItems = new AtomicInteger(0);
    private final Semaphore itemsAvailable = new Semaphore(0);
    private final ExecutorService itemProcessorPool = Executors.newCachedThreadPool();

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
        orderRequirements.put(order, order.getItemQty());

        System.out.println(totalOrdersInQueue + "-" + totalItemsInQueue);
        System.out.println("Order " + order.getOrderId() + " added to queue.");

        itemsAvailable.release(order.getItemQty());

        messagingTemplate.convertAndSend("/topic/order-updates", totalOrdersInQueue + "-" + totalItemsInQueue);

        counterService.updateCounters(getTotalOrdersInQueue(), getTotalItemsInQueue());
    }

    private void processQueue() {
        Executors.newSingleThreadExecutor().submit(() -> {
            while (true) {
                try {
                    itemsAvailable.acquire();

                    itemProcessorPool.submit(() -> {
                        try {
                            Future<Integer> futureCounter = counterService.acquireCounterAsync();
                            Integer counterId = futureCounter.get();

                            if (counterId == null || counterId == -1) {
                                itemsAvailable.release();
                                return;
                            }

                            processItems(counterId);
                            counterService.releaseCounterAsync(counterId).get();
                            System.out.println("Counter " + counterId + " has been released.");

                        } catch (InterruptedException | ExecutionException e) {
                            System.out.println("Error processing item: " + e.getMessage());
                        }
                    });

                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    System.out.println("Processing interrupted.");
                    break;
                }
            }
        });
    }

    private void processItems(Integer counterId) {
        try {
            synchronized (this) {
                if (totalItemsInQueue.get() <= 0) {
                    System.out.println("No items to process.");
                    return;
                }
                totalItemsInQueue.decrementAndGet();
                processedItems.incrementAndGet();
            }

            // simulate processing after reserving the item
            messagingTemplate.convertAndSend("/topic/counter-updates", totalItemsInQueue.get() + "-Counter " + counterId + " is busy.");
            Thread.sleep((long) (processingTime - (helperService.getNoOfHelpers() * helperCoeff) * 1000));
            messagingTemplate.convertAndSend("/topic/counter-updates", totalItemsInQueue.get() + "-Counter " + counterId + " is free");

            processOrders();

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            System.out.println("Item processing interrupted.");
        }
    }


    private synchronized void processOrders() {
        for (Iterator<Order> iterator = orderQueue.iterator(); iterator.hasNext();) {
            Order order = iterator.next();
            int requiredItems = orderRequirements.get(order);

            while (requiredItems > 0 && processedItems.get() > 0) {
                requiredItems--;
                processedItems.decrementAndGet();
                System.out.println("Order " + order.getOrderId() + " picked an item. Remaining: " + requiredItems);
                orderRequirements.put(order, requiredItems);

                if (requiredItems == 0) {
                    try {
                        completeOrder(order);
                    } catch (JsonProcessingException e) {
                        System.out.println("Error: " + e);
                    }
                    iterator.remove();
                    orderRequirements.remove(order);
                    System.out.println("Order " + order.getOrderId() + " is completed and removed from the queue.");
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

        messagingTemplate.convertAndSend("/topic/order-complete", totalOrdersInQueue.get() + "-Order " + order.getOrderId() + " Processed");

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