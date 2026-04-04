import fs from 'fs';

let BANGALORE_AREAS = [];

export async function loadAreasFromCSV(filePath = 'bangalore_areas.csv') {
  const content = fs.readFileSync(filePath, 'utf-8');
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
  
  console.log(`Loaded ${BANGALORE_AREAS.length} areas from CSV`);
  return BANGALORE_AREAS;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateOrders(count) {
  if (BANGALORE_AREAS.length === 0) {
    throw new Error('Areas not loaded. Call loadAreasFromCSV() first.');
  }
  
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => {
    const area = BANGALORE_AREAS[randomInt(0, BANGALORE_AREAS.length - 1)];
    return {
      OrderId: now + i,
      ItemQty: randomInt(1, 11),
      Latitude: area.lat,
      Longitude: area.lng,
      OrderDT: new Date().toISOString(),
      OrderStatus: 1,
    };
  });
}