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

export function generateOrders(count) {
  // Auto-load areas on first call
  if (!areasLoaded) {
    loadAreasFromCSV();
  }
  
  if (BANGALORE_AREAS.length === 0) {
    throw new Error('Areas not loaded. Check CSV file path.');
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