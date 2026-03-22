"""
Clustering Service — owns HAC clustering and redistribution logic.
No Flask here — only business logic.
"""

import logging
import numpy as np
import pandas as pd
from sklearn.cluster import AgglomerativeClustering
from sklearn.metrics import silhouette_score

logger = logging.getLogger(__name__)


# ── Angle helpers ─────────────────────────────────────────────────────────────

def calculate_angle(point, reference):
    delta_lon = point[1] - reference[1]
    delta_lat = point[0] - reference[0]
    return np.arctan2(delta_lon, delta_lat) * (180 / np.pi) % 360


def angular_distance_matrix(df):
    angles = df['angle'].values
    n = len(angles)
    dist_matrix = np.zeros((n, n))
    for i in range(n):
        for j in range(n):
            dist_matrix[i, j] = min(
                abs(angles[i] - angles[j]),
                360 - abs(angles[i] - angles[j])
            )
    return dist_matrix


def circular_mean(angles):
    angles_rad = np.radians(angles)
    mean_rad = np.arctan2(np.mean(np.sin(angles_rad)), np.mean(np.cos(angles_rad)))
    return (np.degrees(mean_rad) + 360) % 360


# ── Cluster optimisation ──────────────────────────────────────────────────────

def get_optimal_clusters(distance_matrix, min_clusters):
    scores = []
    cluster_range = range(min_clusters, min_clusters * 2)
    for n in cluster_range:
        labels = AgglomerativeClustering(n_clusters=n, linkage='complete').fit_predict(distance_matrix)
        scores.append(silhouette_score(distance_matrix, labels, metric='precomputed'))
    return cluster_range[int(np.argmax(scores))]


# ── Redistribution ────────────────────────────────────────────────────────────

def get_neighbors(cluster_angles):
    sorted_clusters = sorted(cluster_angles.keys(), key=lambda x: cluster_angles[x])
    n = len(sorted_clusters)
    return {
        sorted_clusters[i]: [sorted_clusters[i - 1], sorted_clusters[(i + 1) % n]]
        for i in range(n)
    }


def get_boundary_orders(orders, mean_angle):
    orders = orders.copy()
    orders['angle_diff'] = (orders['angle'] - mean_angle).abs()
    return orders.sort_values(by='angle_diff', ascending=False)


def redistribute(df, vehicle_capacity, warehouse):
    cluster_qtys   = df.groupby('cluster')['ITEMQTY'].sum()
    cluster_angles = df.groupby('cluster')['angle'].apply(circular_mean)
    excess_clusters = cluster_qtys[cluster_qtys > vehicle_capacity].index.tolist()
    neighbours = get_neighbors(cluster_angles)

    for excess_cluster in excess_clusters:
        left_nb, right_nb = neighbours[excess_cluster]
        left_space  = vehicle_capacity - cluster_qtys[left_nb]
        right_space = vehicle_capacity - cluster_qtys[right_nb]

        if cluster_qtys[excess_cluster] > 1.5 * vehicle_capacity:
            orders = df[df['cluster'] == excess_cluster].copy()
            ids = [excess_cluster]

            if left_space <= 0:
                orders = pd.concat([orders, df[df['cluster'] == left_nb]], ignore_index=True)
                ids.append(left_nb)
            if right_space <= 0:
                orders = pd.concat([orders, df[df['cluster'] == right_nb]], ignore_index=True)
                ids.append(right_nb)

            orders = cluster_orders(
                orders, vehicle_capacity, warehouse,
                ids=ids, max_id=df['cluster'].max(), n_clusters=len(ids) + 1
            )
            for _, row in orders.iterrows():
                mask = (df['LATITUDE'] == row['LATITUDE']) & (df['LONGITUDE'] == row['LONGITUDE'])
                df.loc[mask, 'cluster'] = row['cluster']
            cluster_qtys = df.groupby('cluster')['ITEMQTY'].sum()

        while cluster_qtys[excess_cluster] > vehicle_capacity:
            orders = df[df['cluster'] == excess_cluster].copy()
            boundary = get_boundary_orders(orders, cluster_angles[excess_cluster])
            moved = False

            for index, row in boundary.iterrows():
                diff_left  = abs(row['angle'] - cluster_angles[left_nb])
                diff_right = abs(row['angle'] - cluster_angles[right_nb])

                if diff_left < diff_right and left_space > 0 and row['ITEMQTY'] <= left_space:
                    df.at[index, 'cluster'] = left_nb
                    cluster_qtys[left_nb]       += row['ITEMQTY']
                    cluster_qtys[excess_cluster] -= row['ITEMQTY']
                    left_space -= row['ITEMQTY']
                    moved = True
                elif diff_right <= diff_left and right_space > 0 and row['ITEMQTY'] <= right_space:
                    df.at[index, 'cluster'] = right_nb
                    cluster_qtys[right_nb]       += row['ITEMQTY']
                    cluster_qtys[excess_cluster] -= row['ITEMQTY']
                    right_space -= row['ITEMQTY']
                    moved = True

                if cluster_qtys[excess_cluster] <= vehicle_capacity:
                    break

            if not moved:
                while cluster_qtys[excess_cluster] > vehicle_capacity:
                    latest = boundary.head(1)
                    if latest.empty:
                        break
                    idx = latest.index[0]
                    df.at[idx, 'cluster'] = -1
                    cluster_qtys[excess_cluster] -= latest['ITEMQTY'].values[0]
                    boundary = boundary.drop(idx)

    return df


# ── Main entry point ──────────────────────────────────────────────────────────

def cluster_orders(df, vehicle_capacity, warehouse, ids=None, max_id=-1, n_clusters=1):
    """
    Cluster a DataFrame of orders by angular proximity to warehouse.

    Args:
        df:               pd.DataFrame with LATITUDE, LONGITUDE, ITEMQTY, ORDERID cols
        vehicle_capacity: int — max item qty per cluster
        warehouse:        dict with 'Latitude' and 'Longitude'
        ids:              list of cluster IDs to reuse (internal, used by redistribute)
        max_id:           current max cluster ID (internal)
        n_clusters:       number of clusters to force (1 = auto-detect)

    Returns:
        pd.DataFrame with 'cluster' column added
    """
    if ids is None:
        ids = []

    ref = (warehouse['Latitude'], warehouse['Longitude'])
    df['angle'] = df.apply(lambda row: calculate_angle((row['LATITUDE'], row['LONGITUDE']), ref), axis=1)

    distance_matrix = angular_distance_matrix(df)

    if n_clusters < 2:
        min_clusters = max(df['ITEMQTY'].sum() // vehicle_capacity, 2)
        n_clusters   = get_optimal_clusters(distance_matrix, min_clusters)

    df['cluster'] = AgglomerativeClustering(n_clusters=n_clusters, linkage='complete').fit_predict(distance_matrix)

    # Remap cluster IDs
    id_mapping = {}
    for i, old_id in enumerate(df['cluster'].unique()):
        id_mapping[old_id] = ids[i] if i < len(ids) else (max_id := max_id + 1)
    df['cluster'] = df['cluster'].map(id_mapping)

    df = redistribute(df, vehicle_capacity, warehouse)
    return df


def build_cluster_response(clusters_df):
    """Convert clustered DataFrame to API response list."""
    result = []
    for cluster_id, group in clusters_df.groupby('cluster'):
        result.append({
            'Cluster':  cluster_id,
            'Orders':   group['ORDERID'].tolist(),
            'Route':    [],
            'ItemQty':  int(group['ITEMQTY'].sum()),
        })
    return result
