"""
Counter Routes — HTTP layer only.
Parses request, calls service, returns response.
No business logic here.
"""

import logging
from flask import Blueprint, request, jsonify
from services.counter_service import predict_counters, reload_model

logger = logging.getLogger(__name__)

counter_bp = Blueprint('counter', __name__)


@counter_bp.route('/predict-counters', methods=['POST'])
def predict_counters_route():
    """
    POST /counter/predict-counters
    Body: {
        "OrderCount": int,
        "TotalItemQty": int,
        "NoOfHelpers": int,
        "TimeGivenToComplete": float
    }
    Returns: { "predicted_counters": int }
    """
    try:
        data = request.get_json()

        order_count            = data['OrderCount']
        total_item_qty         = data['TotalItemQty']
        no_of_helpers          = data['NoOfHelpers']
        time_given_to_complete = data['TimeGivenToComplete']

        num_counters = predict_counters(
            order_count, total_item_qty, no_of_helpers, time_given_to_complete
        )

        return jsonify({'predicted_counters': num_counters})

    except KeyError as e:
        return jsonify({'error': f'Missing required field: {e}'}), 400
    except Exception as e:
        logger.error(f'Error in predict_counters: {e}')
        return jsonify({'error': str(e)}), 500


@counter_bp.route('/reload-model', methods=['POST'])
def reload_model_route():
    """
    POST /counter/reload-model
    Force reload the counter model from disk.
    """
    try:
        reload_model()
        return jsonify({'message': 'Model reloaded successfully'})
    except Exception as e:
        logger.error(f'Error reloading model: {e}')
        return jsonify({'error': 'Failed to reload model'}), 500
