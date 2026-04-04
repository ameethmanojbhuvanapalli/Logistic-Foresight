// ─────────────────────────────────────────────────────────────────────────────
// Service configuration for the interactive architecture diagram on Home.
// Edit this file to add, remove, or update services.
// ─────────────────────────────────────────────────────────────────────────────

/** How long to wait between warmup poll attempts (ms). */
export const POLL_INTERVAL =
  parseInt(import.meta.env.VITE_WARMUP_POLL_INTERVAL_MS) || 8000;

/** Maximum time to keep trying before marking a service as failed (ms). */
export const WARMUP_TIMEOUT =
  parseInt(import.meta.env.VITE_WARMUP_TIMEOUT_MS) || 120000;

/** How often to ping a live service to keep it warm (ms). */
export const KEEPALIVE_INTERVAL =
  parseInt(import.meta.env.VITE_KEEPALIVE_MS) || 900000;

// ─────────────────────────────────────────────────────────────────────────────
// Service definitions
// Fields:
//   id          – unique string identifier
//   name        – display name shown on the card
//   type        – "frontend" | "backend" | "ml" | "db" | "tool"
//   description – shown when user clicks the info (ℹ) button
//   warmupUrl   – URL to hit in order to wake the service; null = no warmup
//   healthUrl   – optional separate health-check URL (falls back to warmupUrl)
//   dependencies– array of other service ids this service depends on
// ─────────────────────────────────────────────────────────────────────────────
const services = [
  {
    id: "frontend",
    name: "React Dashboard",
    type: "frontend",
    description:
      "The Vite + React dashboard you are looking at right now. Visualises real-time counter predictions, order forecasts, and delivery routes. Always live — no warmup required.",
    warmupUrl: null,
    healthUrl: null,
    dependencies: [],
  },
  {
    id: "packing",
    name: "Packing Service",
    type: "backend",
    description:
      "A Spring Boot service hosted on Render. Uses two ML models to predict the number of order-processing counters needed right now and to forecast future order volumes.",
    warmupUrl: import.meta.env.VITE_PACKING_SERVICE_URL
      ? `${import.meta.env.VITE_PACKING_SERVICE_URL}/actuator/health`
      : null,
    healthUrl: import.meta.env.VITE_PACKING_SERVICE_URL
      ? `${import.meta.env.VITE_PACKING_SERVICE_URL}/actuator/health`
      : null,
    dependencies: ["ml", "ksqldb-server"],
  },
  {
    id: "delivery",
    name: "Delivery Service",
    type: "backend",
    description:
      "A Spring Boot service hosted on Render. Retrieves all delivery-ready orders, clusters them using ML-based geospatial algorithms, and computes optimized delivery routes for each cluster.",
    warmupUrl: import.meta.env.VITE_DELIVERY_SERVICE_URL
      ? `${import.meta.env.VITE_DELIVERY_SERVICE_URL}/actuator/health`
      : null,
    healthUrl: import.meta.env.VITE_DELIVERY_SERVICE_URL
      ? `${import.meta.env.VITE_DELIVERY_SERVICE_URL}/actuator/health`
      : null,
    dependencies: ["ml", "ksqldb-server"],
  },
  {
    id: "ml",
    name: "ML Service",
    type: "ml",
    description:
      "A Flask server hosted on Render. Hosts four machine-learning models that power counter predictions, order forecasting, delivery clustering, and route optimisation.",
    warmupUrl: import.meta.env.VITE_ML_SERVICE_URL
      ? `${import.meta.env.VITE_ML_SERVICE_URL}/health`
      : null,
    healthUrl: import.meta.env.VITE_ML_SERVICE_URL
      ? `${import.meta.env.VITE_ML_SERVICE_URL}/health`
      : null,
    dependencies: [],
  },
  {
    id: "ksqldb-server",
    name: "KSQL DB Server",
    type: "db",
    description:
      "A KSQL DB server hosted on Render. Streams and processes real-time order data using Kafka-backed continuous queries.",
    warmupUrl: import.meta.env.VITE_KSQLDB_SERVER_URL
      ? `${import.meta.env.VITE_KSQLDB_SERVER_URL}/healthcheck`
      : null,
    healthUrl: import.meta.env.VITE_KSQLDB_SERVER_URL
      ? `${import.meta.env.VITE_KSQLDB_SERVER_URL}/healthcheck`
      : null,
    dependencies: [],
  },
  {
    id: "ksqldb-studio",
    name: "KSQL DB Studio",
    type: "tool",
    description:
      "A KSQL DB Studio UI hosted on Render. Provides a developer-friendly interface for exploring and querying the KSQL DB server. Read-only credentials are available for demo access.",
    warmupUrl: import.meta.env.VITE_KSQLDB_STUDIO_URL
      ? `${import.meta.env.VITE_KSQLDB_STUDIO_URL}`
      : null,
    healthUrl: null,
    dependencies: ["ksqldb-server"],
  },
];

export default services;
