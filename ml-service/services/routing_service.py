"""
Routing Service — owns route computation logic.
Delegates algorithm to utils/genetic_tsp.py. No Flask here.
"""

import logging
from utils.genetic_tsp import genetic_algorithm, parse_input

logger = logging.getLogger(__name__)


def get_route(order_locations, warehouse):
    """
    Compute optimal delivery route using genetic TSP algorithm.

    Args:
        order_locations: list of dicts with 'Latitude' and 'Longitude' keys
        warehouse:       dict with 'Latitude' and 'Longitude' keys

    Returns:
        dict with:
            Route:    list of location dicts (warehouse → stops → warehouse)
            Distance: total distance in km (float)
    """
    start_point = (warehouse['Latitude'], warehouse['Longitude'])
    cities      = parse_input(order_locations)

    best_tour, best_distance = genetic_algorithm(cities, start_point)

    route_coordinates = (
        [warehouse]
        + [order_locations[i] for i in best_tour]
        + [warehouse]
    )

    logger.info(f'Route computed: {len(cities)} stops, {best_distance:.2f} km')

    return {
        'Route':    route_coordinates,
        'Distance': best_distance,
    }
