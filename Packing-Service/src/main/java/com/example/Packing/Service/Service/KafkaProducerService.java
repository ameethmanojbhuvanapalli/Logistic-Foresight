package com.example.Packing.Service.Service;

import com.example.Packing.Service.Entity.Order;
import com.example.Packing.Service.Mapper.OrderMapper;
import org.apache.avro.generic.GenericRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class KafkaProducerService {

    private final KafkaTemplate<String, GenericRecord> kafkaTemplate;
    private final OrderMapper orderMapper;

    @Value("${spring.kafka.topic.orders}")
    private String topic;

    @Autowired
    public KafkaProducerService(KafkaTemplate<String, GenericRecord> kafkaTemplate, OrderMapper orderMapper) {
        this.kafkaTemplate = kafkaTemplate;
        this.orderMapper = orderMapper;
    }

    public void publishCompletedOrder(Order order) {
        kafkaTemplate.send(topic, String.valueOf(order.getOrderId()), orderMapper.toAvro(order));
    }
}