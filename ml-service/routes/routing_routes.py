"""
Routing Routes — HTTP layer only.
Parses request, calls service, returns response.
No business logic here.
"""

import logging
from flask import Blueprint, request, jsonify
from services.routing_service import get_route

logger = logging.getLogger(__name__)

routing_bp = Blueprint('routing', __name__)


@routing_bp.route('/get-route', methods=['POST'])
def get_route_route():
    """
    POST /delivery/get-route
    Body: {
        "OrderLocations": [
            { "Latitude": float, "Longitude": float, ...other fields preserved }
        ],
        "Warehouse": { "Latitude": float, "Longitude": float }
    }
    Returns: {
        "Route":    [ { "Latitude": float, "Longitude": float }, ... ],
        "Distance": float  (km)
    }
    """
    try:
        data            = request.get_json()
        order_locations = data.get('OrderLocations', [])
        warehouse       = data.get('Warehouse')

        if not order_locations:
            return jsonify({'error': 'OrderLocations is empty'}), 400
        if not warehouse:
            return jsonify({'error': 'Warehouse is required'}), 400

        result = get_route(order_locations, warehouse)
        return jsonify(result), 200

    except KeyError as e:
        return jsonify({'error': f'Missing required field: {e}'}), 400
    except Exception as e:
        logger.error(f'Error in get_route: {e}')
        return jsonify({'error': str(e)}), 500
