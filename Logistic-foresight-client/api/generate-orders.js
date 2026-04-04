import { generateOrders } from './_lib/orderGenerator.js';
import { publishOrders }  from './_lib/kafkaClient.js';

const TOPIC = process.env.KAFKA_ORDERS_TOPIC || 'ORDERS';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const missing = ['CONFLUENT_BOOTSTRAP','CONFLUENT_API_KEY','CONFLUENT_API_SECRET'].filter(k => !process.env[k]);
  if (missing.length) return res.status(500).json({ error: `Missing env vars: ${missing.join(', ')}` });

  let count = req.body?.count;
  count = (!count || count === '') ? Math.floor(Math.random() * 10) + 1 : Math.min(Math.max(parseInt(count, 10), 1), 10);

  try {
    const orders = generateOrders(count);
    await publishOrders(orders, TOPIC);
    return res.status(200).json({ success: true, count: orders.length, topic: TOPIC, orders });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to publish', message: err.message });
  }
}