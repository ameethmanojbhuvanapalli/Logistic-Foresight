"""
Counter Service — owns model loading and counter prediction logic.
No Flask here — only business logic.
"""

import math
import logging
import pickle
import os
import pandas as pd

logger = logging.getLogger(__name__)

MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'models', 'packingresourcemodelNew.pkl')
FEATURES   = ['OrderCount', 'TotalItemQty', 'NoOfHelpers']

_model = None


def _load_model():
    global _model
    with open(MODEL_PATH, 'rb') as f:
        _model = pickle.load(f)
    logger.info('Counter model loaded from %s', MODEL_PATH)


def get_model():
    """Returns the loaded model, loading it on first call (lazy init)."""
    if _model is None:
        _load_model()
    return _model


def reload_model():
    """Force reload model from disk — called by /reload-model endpoint."""
    global _model
    _model = None
    _load_model()


def predict_counters(order_count, total_item_qty, no_of_helpers, time_given_to_complete):
    """
    Predict number of packing counters required.

    Args:
        order_count:             int — total orders
        total_item_qty:          int — total items across all orders
        no_of_helpers:           int — number of helpers available
        time_given_to_complete:  float — time limit in minutes

    Returns:
        int — number of counters (minimum 1)
    """
    model = get_model()

    input_df = pd.DataFrame(
        [[order_count, total_item_qty, no_of_helpers]],
        columns=FEATURES
    )

    raw_prediction = model.predict(input_df)[0]
    num_counters = math.ceil(raw_prediction / time_given_to_complete)

    return max(num_counters, 1)
