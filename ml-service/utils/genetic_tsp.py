"""
Genetic Algorithm for Travelling Salesman Problem.
Pure utility — no Flask, no MongoDB, no side effects.
Used by routing_service.py.
"""

import math
import random


# ── Distance ────────────────────────────────────────────────────────────────

def haversine_distance(lat1, lon1, lat2, lon2):
    """Returns distance in km between two lat/lng points."""
    R = 6371.0
    lat1_r, lon1_r = math.radians(lat1), math.radians(lon1)
    lat2_r, lon2_r = math.radians(lat2), math.radians(lon2)
    dlat = lat2_r - lat1_r
    dlon = lon2_r - lon1_r
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1_r) * math.cos(lat2_r) * math.sin(dlon / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def total_distance(tour, cities, start_point):
    """Total round-trip distance for a given tour."""
    dist = haversine_distance(start_point[0], start_point[1], cities[tour[0]][0], cities[tour[0]][1])
    for i in range(len(tour) - 1):
        c1, c2 = cities[tour[i]], cities[tour[i + 1]]
        dist += haversine_distance(c1[0], c1[1], c2[0], c2[1])
    dist += haversine_distance(cities[tour[-1]][0], cities[tour[-1]][1], start_point[0], start_point[1])
    return dist


# ── GA operators ─────────────────────────────────────────────────────────────

def initialize_population(pop_size, num_cities):
    population = []
    for _ in range(pop_size):
        individual = list(range(num_cities))
        random.shuffle(individual)
        population.append(individual)
    return population


def tournament_selection(population, fitnesses, k=3):
    selected = random.sample(list(zip(population, fitnesses)), k)
    selected.sort(key=lambda x: x[1])
    return selected[0][0]


def crossover(parent1, parent2):
    size = len(parent1)
    if size < 2:
        raise ValueError("Tour size must be at least 2 for crossover.")
    start, end = sorted(random.sample(range(size), 2))
    child = [-1] * size
    child[start:end] = parent1[start:end]
    pointer = end
    for gene in parent2:
        if gene not in child:
            if pointer >= size:
                pointer = 0
            child[pointer] = gene
            pointer += 1
    return child


def mutate(individual, mutation_rate=0.01):
    if random.random() < mutation_rate:
        i, j = random.sample(range(len(individual)), 2)
        individual[i], individual[j] = individual[j], individual[i]
    return individual


# ── Main algorithm ────────────────────────────────────────────────────────────

def genetic_algorithm(cities, start_point, pop_size=100, generations=500, mutation_rate=0.01):
    """
    Run the genetic TSP algorithm.

    Args:
        cities:        list of (lat, lng) tuples
        start_point:   (lat, lng) tuple — warehouse / depot
        pop_size:      population size
        generations:   number of generations
        mutation_rate: probability of mutation per individual

    Returns:
        (best_tour, best_distance) — tour is a list of city indices
    """
    num_cities = len(cities)
    population = initialize_population(pop_size, num_cities)
    best_tour = None
    best_fitness = float('inf')

    for _ in range(generations):
        fitnesses = [total_distance(ind, cities, start_point) for ind in population]

        for i, fitness in enumerate(fitnesses):
            if fitness < best_fitness:
                best_fitness = fitness
                best_tour = population[i]

        new_population = []
        for _ in range(pop_size):
            p1 = tournament_selection(population, fitnesses)
            p2 = tournament_selection(population, fitnesses)
            child = crossover(p1, p2)
            child = mutate(child, mutation_rate)
            new_population.append(child)

        population = new_population

    return best_tour, best_fitness


# ── Input parser ──────────────────────────────────────────────────────────────

def parse_input(data):
    """
    Convert a list of order dicts to (lat, lng) tuples.
    Expects each dict to have 'Latitude' and 'Longitude' keys.
    """
    return [(point['Latitude'], point['Longitude']) for point in data]
