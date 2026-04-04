import { Kafka } from 'kafkajs';

let _producer = null;

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
  await producer.send({
    topic,
    messages: orders.map((o) => ({
      key:   String(o.OrderId),
      value: JSON.stringify(o),
    })),
  });
}