

import { DataProvider } from "../data/data-provider";
import MinHeap from "heap-js";
import { IPackagesObjects, IPathObject, IRouteInfoFuel, State } from "../utils/types";
import { computeAllShortestPaths } from "../utils/utils";

export function CalculationBasicType(
    dataProvider: DataProvider,
    startingPoint: string,
    allShortestPaths: Map<string, Map<string, number>>
): IRouteInfoFuel {
    const [defaultStartingPoint, busCapacityStr] = dataProvider
        .settings()
        .split(",");
    const busCapacity = Number(busCapacityStr);

    const packagesObjects: IPackagesObjects[] = dataProvider
        .fetchPackages()
        .map((pkg) => {
            const [from, item, to, weight] = pkg.split(",");
            return { from, item, to, weight: Number(weight) };
        });

    let mostEfficientPath = { route: ["No valid route found"], distance: Infinity, totalFuel: Infinity };

    const heap = new MinHeap<State>((a, b) => a.estimatedTotalFuel - b.estimatedTotalFuel);
    heap.push({
        currentLocation: startingPoint,
        remainingPackages: packagesObjects,
        currentLoad: [],
        route: [startingPoint],
        distance: 0,
        totalFuel: 0,
        estimatedTotalFuel: 0,
    });

    const visited = new Map<string, number>();

    while (!heap.isEmpty()) {
        const state = heap.pop()!;
        const {
            currentLocation,
            remainingPackages,
            currentLoad,
            route,
            distance,
            totalFuel,
        } = state;

        const stateKey = `${currentLocation}-${remainingPackages.length}-${currentLoad.length}-${totalFuel.toFixed(4)}`;
        if (visited.has(stateKey) && visited.get(stateKey)! <= totalFuel) {
            // Remove states that are already visited with lower or equal fuel
            continue;
        }
        visited.set(stateKey, totalFuel);

        let newLoad = currentLoad.filter((pkg) => pkg.to !== currentLocation);

        const loadingPackages = remainingPackages.filter((pkg) => pkg.from === currentLocation);
        const newRemainingPackages = remainingPackages.filter((pkg) => pkg.from !== currentLocation);

        newLoad = [...newLoad, ...loadingPackages];
        const newTotalWeight = newLoad.reduce((sum, pkg) => sum + pkg.weight, 0);

        if (newTotalWeight > busCapacity) {
            // Remove states that exceed bus capacity
            continue;
        }

        if (newRemainingPackages.length === 0 && currentLocation === startingPoint && newLoad.length === 0) {
            mostEfficientPath = { route, distance, totalFuel };
            return { route, distance, totalFuel };
        }

        const shortestPathsFromCurrent = allShortestPaths.get(currentLocation)!;
        for (const [nextCity, pathDistance] of shortestPathsFromCurrent.entries()) {
            if (currentLocation === nextCity) continue; // Skip same city transition

            const segmentFuelConsumption = calculateFuelConsumption(pathDistance, newTotalWeight);
            const newTotalFuel = totalFuel + segmentFuelConsumption;
            if (newTotalFuel > mostEfficientPath.totalFuel) {
                // Remove states that exceed the most efficient path fuel
                continue;
            }

            const heuristic = calculateHeuristic(nextCity, newRemainingPackages, allShortestPaths);
            heap.push({
                currentLocation: nextCity,
                remainingPackages: newRemainingPackages,
                currentLoad: newLoad,
                route: [...route, nextCity],
                distance: distance + pathDistance,
                totalFuel: newTotalFuel,
                estimatedTotalFuel: newTotalFuel + heuristic,
            });
        }
    }

    return { route: ["No valid route found"], distance: 0, totalFuel: 0 };
}

export function calculateMostEfficientPath(dataProvider: DataProvider): string {
    const pathsObject: IPathObject[] = dataProvider
        .fetchPaths()
        .flatMap((path) => {
            const [from, to, distance] = path.split(",");
            return [
                { from, to, distance: Number(distance) },
                { from: to, to: from, distance: Number(distance) },
            ];
        });

    const allShortestPaths = computeAllShortestPaths(pathsObject);

    const startingPoints = Array.from(
        new Set(pathsObject.flatMap((path) => [path.from, path.to]))
    );
    const allRoutes = startingPoints.map((startingPoint) =>
        CalculationBasicType(dataProvider, startingPoint, allShortestPaths)
    );

    const mostEfficientRoute = allRoutes.reduce((bestRoute, currentRoute) =>
        currentRoute.totalFuel < bestRoute.totalFuel ? currentRoute : bestRoute
    );

    return `${mostEfficientRoute.route.join(",")},${mostEfficientRoute.totalFuel.toFixed(4)}`;
}

function calculateFuelConsumption(distance: number, totalWeight: number): number {
    return (distance * (10 + totalWeight / 100)) / 100;
}

function calculateHeuristic(currentLocation: string, remainingPackages: IPackagesObjects[], allShortestPaths: Map<string, Map<string, number>>): number {
    // Simplistic heuristic: sum of the shortest distance from currentLocation to each package's destination
    let heuristic = 0;
    for (const pkg of remainingPackages) {
        const shortestPathsFromCurrent = allShortestPaths.get(currentLocation);
        if (shortestPathsFromCurrent) {
            heuristic += shortestPathsFromCurrent.get(pkg.to) || 0;
        }
    }
    return heuristic;
}
