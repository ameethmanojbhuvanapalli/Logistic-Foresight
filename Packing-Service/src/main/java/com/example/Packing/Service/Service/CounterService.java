package com.example.Packing.Service.Service;

import com.example.Packing.Service.Client.CounterResourceClient;
import com.example.Packing.Service.DTO.CounterRequestDTO;
import com.example.Packing.Service.DTO.CounterResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.Semaphore;

@Service
public class CounterService {

    @Autowired
    private CounterResourceClient counterResourceClient;

    @Autowired
    private HelperService helperService;

    @Autowired
    private TimerService timerService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    private final Semaphore semaphore = new Semaphore(0);
    public final ExecutorService executorService = Executors.newFixedThreadPool(100); // 10 threads for parallel execution
    private final Map<Integer, Boolean> counterMap = new HashMap<>();

    private int currentCounterCount = 0;

    private int futureCounters=0;

    public int getFutureCounters() {
        return futureCounters;
    }

    public void setFutureCounters(int futureCounters) {
        this.futureCounters = futureCounters;
    }

    public int getCurrentCounterCount() {
        return currentCounterCount;
    }

    public CounterResponseDTO getCountersPrediction(CounterRequestDTO requestDto) {
        return counterResourceClient.getPrediction(requestDto);
    }

    public void updateCounters(int totalOrders, int totalItems) {
        CounterRequestDTO counterRequestDTO = new CounterRequestDTO(totalOrders, totalItems
                ,helperService.getNoOfHelpers(),timerService.getCurrentTimeLimit());
        int predictedCounters = getCountersPrediction(counterRequestDTO).getPredictedCounters();

        if (predictedCounters > currentCounterCount) {
            semaphore.release(predictedCounters - currentCounterCount);
        } else if (predictedCounters < currentCounterCount) {
            int permitsToAcquire = currentCounterCount - predictedCounters;
            try {
                semaphore.acquire(permitsToAcquire); // Acquire the excess permits to reduce them
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new RuntimeException("Error acquiring semaphore permits", e);
            }
        }

        assignCounters(predictedCounters);
        currentCounterCount = predictedCounters;

        messagingTemplate.convertAndSend("/topic/update-counter", currentCounterCount+"-"+futureCounters);
    }

    private void assignCounters(int predictedCounters) {
        for (int i = 1; i <= predictedCounters; i++) {
            if (!counterMap.containsKey(i)) {
                counterMap.put(i, true); // Only mark new counters as available
                System.out.println("Counter " + i + " is now active");
            }
        }

        // Remove counters that are no longer needed if the predicted number is less than the current
        counterMap.entrySet().removeIf(entry -> entry.getKey() > predictedCounters);
    }

    // Asynchronous counter acquisition
    public Future<Integer> acquireCounterAsync() {
        return executorService.submit(() -> {
            semaphore.acquire(); // Block until a permit is available

            synchronized (counterMap) { // Ensure thread-safety when accessing counterMap
                for (Map.Entry<Integer, Boolean> entry : counterMap.entrySet()) {
                    if (entry.getValue()) { // Find the first available counter
                        counterMap.put(entry.getKey(), false); // Mark the counter as in use
                        System.out.println("Counter " + entry.getKey() + " has been acquired");
                        return entry.getKey(); // Return the acquired counter ID
                    }
                }
            }
            return -1; // This should not be reached because semaphore.acquire() ensures a counter is available
        });
    }

    // Asynchronous counter release
    public Future<Void> releaseCounterAsync(int counterId) {
        return executorService.submit(() -> {
            synchronized (counterMap) { // Ensure thread-safety when accessing counterMap
                if (counterMap.containsKey(counterId) && !counterMap.get(counterId)) { // Check if the counter was in use
                    counterMap.put(counterId, true); // Mark the counter as available
                    System.out.println("Counter " + counterId + " is now available");
                    semaphore.release(); // Release the semaphore permit
                }
            }
            return null;
        });
    }

    // Shutdown the executor service when no longer needed (can be invoked during app shutdown)
    public void shutdownExecutor() {
        executorService.shutdown();
    }
}
