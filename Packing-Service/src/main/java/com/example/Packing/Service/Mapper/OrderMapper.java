package com.example.Packing.Service.Mapper;

import com.example.Packing.Service.Constants.OrderAvroFields;
import com.example.Packing.Service.Entity.Order;
import io.confluent.kafka.schemaregistry.client.CachedSchemaRegistryClient;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import org.apache.avro.Schema;
import org.apache.avro.generic.GenericData;
import org.apache.avro.generic.GenericRecord;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class OrderMapper {

    private final Schema schema;

    public OrderMapper(
            @Value("${spring.kafka.properties.schema.registry.url}") String registryUrl,
            @Value("${spring.kafka.properties.basic.auth.credentials.source}") String credentialsSource,
            @Value("${spring.kafka.properties.basic.auth.user.info}") String authInfo,
            @Value("${spring.kafka.topic.orders}") String topic
    ) throws Exception {
        SchemaRegistryClient client = new CachedSchemaRegistryClient(
                registryUrl,
                100,
                Map.of(
                        "basic.auth.credentials.source", credentialsSource,
                        "basic.auth.user.info", authInfo
                )
        );
        this.schema = new Schema.Parser().parse(
                client.getLatestSchemaMetadata(topic + "-value").getSchema()
        );
    }


    public Order fromAvro(GenericRecord record) {
        Order order = new Order();
        order.setOrderId(    getValue(record, OrderAvroFields.ORDER_ID,     Long.class));
        order.setItemQty(    getValue(record, OrderAvroFields.ITEM_QTY,     Integer.class));
        order.setLatitude(   getValue(record, OrderAvroFields.LATITUDE,     Double.class));
        order.setLongitude(  getValue(record, OrderAvroFields.LONGITUDE,    Double.class));
        order.setOrderDT(    record.get(OrderAvroFields.ORDER_DT) != null ?
                record.get(OrderAvroFields.ORDER_DT).toString() : null);
        order.setOrderStatus(getValue(record, OrderAvroFields.ORDER_STATUS, Integer.class));
        return order;
    }

    public GenericRecord toAvro(Order order) {
        GenericRecord record = new GenericData.Record(schema);
        record.put(OrderAvroFields.ORDER_ID,     order.getOrderId());
        record.put(OrderAvroFields.ITEM_QTY,     order.getItemQty());
        record.put(OrderAvroFields.LATITUDE,     order.getLatitude());
        record.put(OrderAvroFields.LONGITUDE,    order.getLongitude());
        record.put(OrderAvroFields.ORDER_DT,     order.getOrderDT());
        record.put(OrderAvroFields.ORDER_STATUS, order.getOrderStatus());
        return record;
    }

    @SuppressWarnings("unchecked")
    private static <T> T getValue(GenericRecord record, String field, Class<T> type) {
        Object val = record.get(field);
        return val != null ? (T) val : null;
    }
}