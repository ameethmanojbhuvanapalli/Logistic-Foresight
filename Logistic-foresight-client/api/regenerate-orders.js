import { generateOrders }      from './_lib/orderGenerator.js';
import { getOrdersCollection } from './_lib/mongoClient.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  if (!process.env.MONGO_URI) return res.status(500).json({ error: 'Missing MONGO_URI' });

  let count = req.body?.count;
  count = (!count || count === '') ? 150000 : Math.min(Math.max(parseInt(count, 10), 1), 150000);

  try {
    const collection = await getOrdersCollection();
    const deleteResult = await collection.deleteMany({});
    const orders = generateOrders(count);
    const docs = orders.map(o => ({
      orderId: o.OrderId, itemQty: o.ItemQty,
      latitude: o.Latitude, longitude: o.Longitude,
      orderDT: o.OrderDT, orderStatus: o.OrderStatus,
      createdAt: new Date(),
    }));
    const insertResult = await collection.insertMany(docs);
    return res.status(200).json({ success: true, deleted: deleteResult.deletedCount, inserted: insertResult.insertedCount });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to regenerate', message: err.message });
  }
}