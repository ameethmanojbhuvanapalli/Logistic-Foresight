"""
Forecast Service — owns Prophet model training and prediction logic.
Reads order history from MongoDB. No Flask here.
"""

import math
import logging
import datetime
import os

import pandas as pd
from prophet import Prophet
from pymongo import MongoClient
from statsmodels.tools.eval_measures import rmse

logger = logging.getLogger(__name__)

# ── MongoDB connection (lazy) ─────────────────────────────────────────────────

_db = None

def get_db():
    global _db
    if _db is None:
        uri = os.getenv('MONGO_URI')
        if not uri:
            raise RuntimeError('MONGO_URI environment variable is not set')
        client = MongoClient(uri)
        _db = client[os.getenv('MONGO_DB_NAME', 'LogisticForesight')]
        logger.info('MongoDB connected')
    return _db


# ── Core forecast logic ───────────────────────────────────────────────────────

def predict_orders(weeks=None, hours=3):
    """
    Fetch order history from MongoDB, train Prophet, and forecast.

    Args:
        weeks:  int | None — how many past weeks of data to use (None = all)
        hours:  int — how many hours ahead to forecast

    Returns:
        dict with keys: predicted_orders, actual_orders, rmse,
                        order_qty, item_qty, predicted_counters
    """
    db = get_db()

    # Parse ORDERDT string to date (without milliseconds to avoid format errors)
    pipeline = [
        {
            '$addFields': {
                'orderDT': {
                    '$dateFromString': {
                        'dateString': {'$substr': ['$ORDERDT', 0, 19]},  # "2026-04-04T13:03:06"
                        'format': '%Y-%m-%dT%H:%M:%S'
                    }
                }
            }
        }
    ]

    if weeks is not None:
        start_date = datetime.datetime.now() - datetime.timedelta(weeks=weeks)
        pipeline.append({'$match': {'orderDT': {'$gte': start_date}}})

    pipeline.extend([
        {
            '$group': {
                '_id': {
                    'year':  {'$year':        '$orderDT'},
                    'month': {'$month':       '$orderDT'},
                    'day':   {'$dayOfMonth':  '$orderDT'},
                    'hour':  {'$hour':        '$orderDT'},
                },
                'totalQuantity': {'$sum': '$ITEMQTY'},  # Changed: itemQty → ITEMQTY
                'totalOrders':   {'$sum': 1},
            }
        },
        {'$sort': {'_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1}},
    ])

    try:
        data = list(db.Orders.aggregate(pipeline))
        if not data:
            raise ValueError('No data available for the given time range')

        df = pd.DataFrame(data)
        df['ds'] = pd.to_datetime(df['_id'].apply(
            lambda x: f"{x['year']}-{x['month']:02d}-{x['day']:02d} {x['hour']:02d}:00:00"
        ))
        df['y'] = df['totalQuantity']

        model = Prophet(weekly_seasonality=True, daily_seasonality=True, yearly_seasonality=True)
        model.fit(df[['ds', 'y']])

        future   = model.make_future_dataframe(periods=hours + 1, freq='H')[:-1]
        forecast = model.predict(future)

        result      = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']]
        predictions = forecast.iloc[-len(df):]['yhat']
        rmse_value  = rmse(predictions, df['y'])
        item_qty    = math.ceil(predictions.tail(hours).sum())

        return {
            'predicted_orders': result.to_dict(orient='records'),
            'actual_orders':    df[['ds', 'y']].to_dict(orient='records'),
            'rmse':             rmse_value,
            'order_qty':        item_qty / 2,
            'item_qty':         item_qty,
            'predicted_counters': 0,
        }
    except Exception as e:
        logger.error(f"Error in predict_orders: {str(e)}", exc_info=True)
        raise