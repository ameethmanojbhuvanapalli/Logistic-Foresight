"""
Clustering Routes — HTTP layer only.
Parses request, calls service, returns response.
No business logic here.
"""

import logging
import pandas as pd
from flask import Blueprint, request, jsonify
from services.clustering_service import cluster_orders, build_cluster_response

logger = logging.getLogger(__name__)

clustering_bp = Blueprint('clustering', __name__)


@clustering_bp.route('/cluster-orders', methods=['POST'])
def cluster_orders_route():
    """
    POST /cluster/cluster-orders
    Body: {
        "Orders": [
            { "ORDERID": int, "ITEMQTY": int, "LATITUDE": float, "LONGITUDE": float }
        ],
        "VehicleCapacity": int,
        "Warehouse": { "Latitude": float, "Longitude": float }
    }
    Returns: [
        { "Cluster": int, "Orders": [int], "Route": [], "ItemQty": int }
    ]
    """
    try:
        data             = request.get_json()
        orders           = data.get('Orders', [])
        vehicle_capacity = data.get('VehicleCapacity', 1)
        warehouse        = data.get('Warehouse')

        if not orders:
            return jsonify({'error': 'Orders list is empty'}), 400
        if not warehouse:
            return jsonify({'error': 'Warehouse is required'}), 400

        orders_df   = pd.DataFrame(orders)
        clusters_df = cluster_orders(orders_df, vehicle_capacity, warehouse)
        result      = build_cluster_response(clusters_df)

        return jsonify(result), 200

    except KeyError as e:
        return jsonify({'error': f'Missing required field: {e}'}), 400
    except Exception as e:
        logger.error(f'Error in cluster_orders: {e}')
        return jsonify({'error': str(e)}), 500
