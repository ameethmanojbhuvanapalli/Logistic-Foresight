import { Kafka } from 'kafkajs';
import avsc from 'avsc';

let _producer = null;
let _schemaId = null;

// Avro schema
const orderSchema = {
  type: 'record',
  name: 'Order',
  fields: [
    { name: 'ORDERID', type: ['null', 'long'] },
    { name: 'ITEMQTY', type: ['null', 'int'] },
    { name: 'LATITUDE', type: ['null', 'double'] },
    { name: 'LONGITUDE', type: ['null', 'double'] },
    { name: 'ORDERDT', type: ['null', 'string'] },
    { name: 'ORDERSTATUS', type: ['null', 'int'] },
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

async function getSchemaId() {
  if (_schemaId) return _schemaId; // Return cached value
  
  const registryUrl = process.env.SCHEMA_REGISTRY_URL;
  const registryUser = process.env.SCHEMA_REGISTRY_USER;
  const registryPassword = process.env.SCHEMA_REGISTRY_PASSWORD;
  
  if (!registryUrl || !registryUser || !registryPassword) {
    throw new Error('Missing Schema Registry credentials in env vars');
  }

  try {
    const auth = Buffer.from(`${registryUser}:${registryPassword}`).toString('base64');
    
    const response = await fetch(
      `${registryUrl}/subjects/ORDERS-value/versions/latest`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/vnd.schemaregistry.v1+json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Schema Registry error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    _schemaId = data.id;
    console.log(`Fetched Schema ID: ${_schemaId}`);
    return _schemaId;
  } catch (err) {
    console.error('Failed to fetch schema ID from registry:', err);
    throw err;
  }
}

export async function publishOrders(orders, topic) {
  const producer = await getProducer();
  const schemaId = await getSchemaId(); // Get latest schema ID
  
  const messages = orders.map((o) => {
    try {
      // Encode to Avro
      const avroData = avroType.toBuffer(o);
      
      // Confluent format: [magic byte] + [schema ID] + [avro data]
      const buffer = Buffer.alloc(5 + avroData.length);
      buffer[0] = 0; // Magic byte
      buffer.writeInt32BE(schemaId, 1); // Dynamic Schema ID
      avroData.copy(buffer, 5);
      
      return {
        key: String(o.ORDERID),
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
  
  console.log(`Published ${orders.length} Avro-encoded orders to ${topic} with Schema ID ${schemaId}`);
}