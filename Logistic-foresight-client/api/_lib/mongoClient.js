import { MongoClient } from 'mongodb';

let _client = null;
let _db = null;

async function getDb() {
  if (_db) return _db;
  if (!_client) {
    _client = new MongoClient(process.env.MONGO_URI);
    await _client.connect();
  }
  _db = _client.db(process.env.MONGO_DB_NAME || 'LogisticForesight');
  return _db;
}

export async function getOrdersCollection() {
  const db = await getDb();
  return db.collection(process.env.MONGO_COLLECTION || 'Orders');
}