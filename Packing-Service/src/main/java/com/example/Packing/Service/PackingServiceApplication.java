package com.example.Packing.Service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableDiscoveryClient
@EnableScheduling
public class PackingServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(PackingServiceApplication.class, args);
	}

}
