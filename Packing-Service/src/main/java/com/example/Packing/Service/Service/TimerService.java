package com.example.Packing.Service.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class TimerService {

    @Autowired
    SimpMessagingTemplate simpMessagingTemplate;

    private int timeLimit = 120;
    private int initialTimeLimit = 120;

    public void setTimeLimit(int timeLimit) {
        this.timeLimit = timeLimit;
        this.initialTimeLimit=timeLimit;
    }

    public int getCurrentTime() {
        return timeLimit;
    }

    @Scheduled(fixedRate = 60000)
    public void decrementTimer() {
        if (timeLimit > 0) {
            timeLimit--;
            if (timeLimit == 0) {
                resetTimer();
            }
            simpMessagingTemplate.convertAndSend("/topic/time-update", timeLimit);
        }
    }

    private void resetTimer() {
        timeLimit = initialTimeLimit;
    }

    public int getCurrentTimeLimit() {
        return initialTimeLimit;
    }
}
