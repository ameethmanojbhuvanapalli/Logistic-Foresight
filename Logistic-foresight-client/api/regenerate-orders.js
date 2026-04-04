import { generateOrders }      from './_lib/orderGenerator.js';
import { getOrdersCollection } from './_lib/mongoClient.js';

function getMonthsBack(count) {
  const ORDERS_PER_DAY = 2000;
  const days = Math.ceil(count / ORDERS_PER_DAY);
  return Math.ceil(days / 30);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  if (!process.env.MONGO_URI) return res.status(500).json({ error: 'Missing MONGO_URI' });

  let count = parseInt(req.body?.count, 10);

  if (!count || isNaN(count)) count = 150000;

  count = Math.max(count, 150000);

  try {
    const collection = await getOrdersCollection();
    const deleteResult = await collection.deleteMany({});
    const orders = generateOrders(count, {
      mode: 'historical',
      monthsBack: getMonthsBack(count)
    });
    const docs = orders.map(o => ({
      ORDERID: o.ORDERID,           // Changed
      ITEMQTY: o.ITEMQTY,           // Changed
      LATITUDE: o.LATITUDE,         // Changed
      LONGITUDE: o.LONGITUDE,       // Changed
      ORDERDT: o.ORDERDT,           // Changed
      ORDERSTATUS: o.ORDERSTATUS,   // Changed
      createdAt: new Date(),
    }));
    const insertResult = await collection.insertMany(docs);
    return res.status(200).json({ success: true, deleted: deleteResult.deletedCount, inserted: insertResult.insertedCount });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to regenerate', message: err.message });
  }
}