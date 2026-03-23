package com.example.Delivery.Service.Service;

import com.example.Delivery.Service.Mapper.OrderMapper;
import org.apache.avro.generic.GenericRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class KafkaConsumerService {

    private final OrderService orderService;
    private final OrderMapper orderMapper;

    @Autowired
    public KafkaConsumerService(OrderService orderService, OrderMapper orderMapper) {
        this.orderService = orderService;
        this.orderMapper = orderMapper;
    }

    @KafkaListener(topics = "${spring.kafka.topic.orders.deliver}", groupId = "${spring.kafka.consumer.group-id}")
    public void listen(GenericRecord record) {
        orderService.addOrder(orderMapper.fromAvro(record));
    }
}
