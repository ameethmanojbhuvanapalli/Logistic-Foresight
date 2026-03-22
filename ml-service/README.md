# ml-service

Single Flask service hosting all 4 ML models for the Logistic Foresight project.

## Endpoints

| Method | Path | Service | Description |
|--------|------|---------|-------------|
| POST | `/packing/predict-counters` | Counter | Predict packing counters needed |
| POST | `/packing/reload-model` | Counter | Reload pkl from disk |
| POST | `/packing/predict-orders` | Forecast | Prophet order forecast from MongoDB |
| POST | `/delivery/cluster-orders` | Clustering | HAC cluster orders by location |
| POST | `/delivery/get-route` | Routing | Genetic TSP optimal route |
| GET  | `/health` | — | Health check |

## Project Structure

```
ml-service/
├── app.py                        ← Flask entry point, registers blueprints only
├── requirements.txt
├── .env.example
├── models/
│   └── packingresourcemodelNew.pkl   ← ADD THIS MANUALLY (not in git)
├── data/
│   └── packingcounters5.csv          ← ADD THIS MANUALLY (not in git)
├── utils/
│   └── genetic_tsp.py            ← pure TSP algorithm
├── services/
│   ├── counter_service.py        ← model loading + counter prediction
│   ├── forecast_service.py       ← MongoDB + Prophet forecasting
│   ├── clustering_service.py     ← HAC clustering + redistribution
│   └── routing_service.py        ← route computation via genetic TSP
└── routes/
    ├── counter_routes.py         ← Blueprint: /packing/predict-counters
    ├── forecast_routes.py        ← Blueprint: /packing/predict-orders
    ├── clustering_routes.py      ← Blueprint: /delivery/cluster-orders
    └── routing_routes.py         ← Blueprint: /delivery/get-route
```

## Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy env file and fill in values
cp .env.example .env

# Add model and data files manually (not committed to git):
# → models/packingresourcemodelNew.pkl
# → data/packingcounters5.csv

# Run locally
python app.py
```

## Deploy on Render

- **Runtime:** Python
- **Build command:** `pip install -r requirements.txt`
- **Start command:** `gunicorn app:create_app() --bind 0.0.0.0:$PORT`
- **Root directory:** `ml-service` (if using monorepo)

### Render Environment Variables

| Key | Value |
|-----|-------|
| `MONGO_URI` | Your MongoDB Atlas URI |
| `MONGO_DB_NAME` | `LogisticForesight` |
| `SECRET_KEY` | Any random string |
| `EUREKA_SERVER` | Your service registry URL (optional) |
| `INSTANCE_HOST` | Your Render service URL (optional) |

> **Note:** `packingresourcemodelNew.pkl` and `packingcounters5.csv` must be added
> as Render Secret Files or committed to git (not recommended for large binaries).
> For pkl files on Render, use the Secret Files feature or store in cloud storage.

## Adding a New Model

1. Add logic to `services/your_service.py`
2. Add route to `routes/your_routes.py`
3. Register blueprint in `app.py`
4. That's it — no other files change
