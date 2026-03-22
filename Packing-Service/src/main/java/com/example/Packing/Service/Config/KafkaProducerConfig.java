package com.example.Packing.Service.Config;

import io.confluent.kafka.serializers.KafkaAvroSerializer;
import org.apache.avro.generic.GenericRecord;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.kafka.KafkaProperties;
import org.springframework.boot.ssl.DefaultSslBundleRegistry;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;

import java.util.Map;

@Configuration
public class KafkaProducerConfig {

    @Autowired
    private KafkaProperties kafkaProperties;

    @Bean
    @Primary
    public ProducerFactory<String, GenericRecord> producerFactory() {
        Map<String, Object> props = kafkaProperties.buildProducerProperties(new DefaultSslBundleRegistry());

        kafkaProperties.getProperties()
                .forEach((k, v) -> { if (v != null) props.put(k, v); });

        return new DefaultKafkaProducerFactory<>(props);
    }

    @Bean
    @Primary
    public KafkaTemplate<String, GenericRecord> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }
}