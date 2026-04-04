import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let BANGALORE_AREAS = [];
let areasLoaded = false;

function loadAreasFromCSV() {
  if (areasLoaded) return; // Only load once
  
  const csvPath = path.join(__dirname, '..', 'data', 'bangalore_areas.csv');
  
  try {
    const content = fs.readFileSync(csvPath, 'utf-8');
    const lines = content.trim().split('\n');
    
    // Skip header row
    BANGALORE_AREAS = lines.slice(1).map((line, index) => {
      const [area, pincode, latitude, longitude] = line.split(',').map(s => s.trim());
      return {
        areaId: index + 1,
        name: area,
        pincode: pincode,
        lat: parseFloat(latitude),
        lng: parseFloat(longitude),
      };
    });
    
    areasLoaded = true;
    console.log(`Loaded ${BANGALORE_AREAS.length} areas from CSV`);
  } catch (error) {
    console.error('Error loading CSV:', error);
    throw new Error(`Failed to load CSV: ${error.message}`);
  }
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateOrders(count, options = {}) {
  if (!areasLoaded) loadAreasFromCSV();

  const {
    mode = 'realtime', // 'realtime' | 'historical'
    monthsBack = 3
  } = options;

  const now = new Date();
  const past = new Date();
  past.setMonth(past.getMonth() - monthsBack);

  function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  function getDemandMultiplier(date) {
    const hour = date.getHours();
    const day = date.getDay();

    let m = 1;

    // hourly pattern
    if (hour >= 12 && hour <= 14) m *= 2;
    else if (hour >= 18 && hour <= 22) m *= 3;
    else if (hour >= 0 && hour <= 6) m *= 0.3;

    // weekend boost
    if (day === 0 || day === 6) m *= 1.4;

    // growth trend
    const progress = (date - past) / (now - past);
    m *= (1 + progress * 0.5);

    return m;
  }

  return Array.from({ length: count }, (_, i) => {
    const area = BANGALORE_AREAS[randomInt(0, BANGALORE_AREAS.length - 1)];

    const orderDate =
      mode === 'historical'
        ? randomDate(past, now)
        : new Date();

    const multiplier = mode === 'historical'
      ? getDemandMultiplier(orderDate)
      : 1;

    const itemQty = Math.max(
      1,
      Math.floor((Math.random() * 3 + 1) * multiplier)
    );

    return {
      ORDERID: Date.now() + i,
      ITEMQTY: itemQty,
      LATITUDE: area.lat,
      LONGITUDE: area.lng,
      ORDERDT: orderDate, // ✅ always Date object
      ORDERSTATUS: 1
    };
  });
}
