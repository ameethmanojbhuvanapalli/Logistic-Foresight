import { Kafka } from 'kafkajs';
import avsc from 'avsc';

let _producer = null;

const orderSchema = {
  type: 'record',
  name: 'Order',
  fields: [
    { name: 'ORDERID', type: 'long' },
    { name: 'ITEMQTY', type: 'int' },
    { name: 'LATITUDE', type: 'double' },
    { name: 'LONGITUDE', type: 'double' },
    { name: 'ORDERDT', type: 'string' },
    { name: 'ORDERSTATUS', type: 'int' },
  ],
};

let avroType;
try {
  avroType = avsc.Type.forSchema(orderSchema);
} catch (err) {
  console.error('Failed to create Avro schema:', err);
}

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
    try {
      // Encode to Avro
      const avroData = avroType.toBuffer(o);
      
      // Confluent format: [magic byte] + [schema ID] + [avro data]
      const buffer = Buffer.alloc(5 + avroData.length);
      buffer[0] = 0; // Magic byte
      buffer.writeInt32BE(1, 1); // Schema ID (check your registry)
      avroData.copy(buffer, 5);
      
      return {
        key: String(o.OrderId),
        value: buffer,
      };
    } catch (err) {
      console.error('Error encoding Avro:', err);
      throw err;
    }
  });

  await producer.send({
    topic,
    messages,
  });
  
  console.log(`Published ${orders.length} Avro-encoded orders to ${topic}`);
}