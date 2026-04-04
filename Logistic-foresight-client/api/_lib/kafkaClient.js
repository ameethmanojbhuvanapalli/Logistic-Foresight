import { Kafka } from 'kafkajs';
import avro from 'avro';

let _producer = null;

// Avro schema matching your Order structure
const orderSchema = {
  type: 'record',
  name: 'Order',
  fields: [
    { name: 'OrderId', type: 'long' },
    { name: 'ItemQty', type: 'int' },
    { name: 'Latitude', type: 'double' },
    { name: 'Longitude', type: 'double' },
    { name: 'OrderDT', type: 'string' },
    { name: 'OrderStatus', type: 'int' },
  ],
};

const avroType = avro.Type.forSchema(orderSchema);

async function getProducer() {
  if (!_producer) {
    const kafka = new Kafka({
      clientId: 'logistic-foresight-dashboard',
      brokers: [process.env.CONFLUENT_BOOTSTRAP],
      ssl: true,
      sasl: {
        mechanism: 'plain',
        username: process.env.CONFLUENT_API_KEY,
        password: process.env.CONFLUENT_API_SECRET,
      },
    });
    _producer = kafka.producer();
    await _producer.connect();
  }
  return _producer;
}

export async function publishOrders(orders, topic) {
  const producer = await getProducer();
  
  const messages = orders.map((o) => {
    // Encode to Avro
    const avroData = avroType.toBuffer(o);
    
    // Confluent format: [magic byte (1)] + [schema ID (4)] + [avro data]
    const buffer = Buffer.alloc(5 + avroData.length);
    buffer[0] = 0; // Magic byte
    buffer.writeInt32BE(1, 1); // Schema ID
    avroData.copy(buffer, 5);
    
    return {
      key: String(o.OrderId),
      value: buffer,
    };
  });

  await producer.send({
    topic,
    messages,
  });
  
  console.log(`Published ${orders.length} Avro-encoded orders to ${topic}`);
}