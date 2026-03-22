"""
Forecast Routes — HTTP layer only.
Parses request, calls service, returns response.
No business logic here.
"""

import logging
from flask import Blueprint, request, jsonify
from services.forecast_service import predict_orders

logger = logging.getLogger(__name__)

forecast_bp = Blueprint('forecast', __name__)


@forecast_bp.route('/forecast-orders', methods=['POST'])
def predict_orders_route():
    """
    POST /forecast/forecast-orders
    Body: {
        "Weeks": int | null,   (optional — how many weeks of history to use)
        "Hours": int           (optional — how many hours to forecast, default 3)
    }
    Returns: {
        forecasted_orders, actual_orders, rmse,
        order_qty, item_qty, predicted_counters
    }
    """
    try:
        data  = request.get_json()
        weeks = data.get('Weeks', None)
        hours = data.get('Hours', 3)

        result = predict_orders(weeks=weeks, hours=hours)
        return jsonify(result)

    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f'Error in predict_orders: {e}')
        return jsonify({'error': 'Failed to generate prediction'}), 500
