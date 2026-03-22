package com.example.Packing.Service.Controller;

import com.example.Packing.Service.Service.HelperService;
import com.example.Packing.Service.Service.TimerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/operations")
public class OperationsController {

    @Autowired
    private TimerService timerService;

    @Autowired
    private HelperService helperService;

    @PostMapping("/set-timer")
    public void setTimer(@RequestParam int timeLimit) {
        timerService.setTimeLimit(timeLimit);
    }

    @GetMapping("/current-timer")
    public int getCurrentTime() {
        return timerService.getCurrentTime();
    }

    @GetMapping("/current-time-limit")
    public int getCurrentTimeLimit() {
        return timerService.getCurrentTimeLimit();
    }

    // Helper-related endpoints
    @PostMapping("/set-helpers")
    public void setNoOfHelpers(@RequestParam int noOfHelpers) {
        helperService.setNoOfHelpers(noOfHelpers);
    }

    @GetMapping("/current-helpers")
    public int getNoOfHelpers() {
        return helperService.getNoOfHelpers();
    }
}
