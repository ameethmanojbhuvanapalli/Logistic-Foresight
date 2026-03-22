package com.example.Packing.Service.Service;

import org.springframework.stereotype.Service;

@Service
public class HelperService {

    private int noOfHelpers = 0;

    public void setNoOfHelpers(int noOfHelpers) {
        this.noOfHelpers = noOfHelpers;
    }

    public int getNoOfHelpers() {
        return noOfHelpers;
    }
}
