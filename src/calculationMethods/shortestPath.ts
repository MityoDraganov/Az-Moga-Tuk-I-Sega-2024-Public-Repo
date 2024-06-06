import { DataProvider } from "../data/data-provider";
import {
    IPackagesObjects,
    IPathObject,
    IQueueStateExt,
    IRouteInfo,
} from "../utils/types";
import MinHeap from "heap-js";
import { computeAllShortestPaths } from "../utils/utils";

export function CalculationBasicType(
    dataProvider: DataProvider,
    startingPoint: string,
    allShortestPaths: Map<string, Map<string, number>>
): IRouteInfo {
    const [defaultStartingPoint, busCapacityStr] = dataProvider
        .settings()
        .split(",");
    const busCapacity = Number(busCapacityStr);

    let shortestRoute: IRouteInfo = { route: ["No valid route found"], distance: Infinity };

    const packagesObjects: IPackagesObjects[] = dataProvider
        .fetchPackages()
        .map((pkg) => {
            const [from, item, to, weight] = pkg.split(",");
            return { from, item, to, weight: Number(weight) };
        });

    const heap = new MinHeap<IQueueStateExt>((a, b) => a.distance - b.distance);
    heap.push({
        currentLocation: startingPoint,
        remainingPackages: packagesObjects,
        currentLoad: [],
        route: [startingPoint],
        distance: 0,
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
        } = state;

        const stateKey = `${currentLocation}-${remainingPackages.length}-${currentLoad.length}-${route.join(",")}`;
        if (visited.has(stateKey) && visited.get(stateKey)! <= distance) {
            continue;
        }
        visited.set(stateKey, distance);

        let newLoad = currentLoad.filter((pkg) => pkg.to !== currentLocation);

        const loadingPackages = remainingPackages.filter(
            (pkg) => pkg.from === currentLocation
        );
        const newRemainingPackages = remainingPackages.filter(
            (pkg) => pkg.from !== currentLocation
        );

        newLoad = [...newLoad, ...loadingPackages];
        const totalWeight = newLoad.reduce((sum, pkg) => sum + pkg.weight, 0);

        if (totalWeight > busCapacity) {
            // Remove states that exceed bus capacity
            const newHeap = new MinHeap<IQueueStateExt>((a, b) => a.distance - b.distance);
            while (!heap.isEmpty()) {
                const h = heap.pop()!;
                const hNewLoad = h.currentLoad.filter(pkg => pkg.to !== h.currentLocation).concat(h.remainingPackages.filter(pkg => pkg.from === h.currentLocation));
                const hTotalWeight = hNewLoad.reduce((sum, pkg) => sum + pkg.weight, 0);
                if (hTotalWeight <= busCapacity) {
                    newHeap.push(h);
                }
            }
            heap.push(...newHeap.toArray());
            continue;
        }

        if (
            newRemainingPackages.length === 0 &&
            currentLocation === startingPoint &&
            newLoad.length === 0
        ) {
            shortestRoute = { route, distance };
            return { route, distance };
        }

        const shortestPathsFromCurrent = allShortestPaths.get(currentLocation)!;
        for (const [
            nextCity,
            pathDistance,
        ] of shortestPathsFromCurrent.entries()) {
            if (currentLocation === nextCity) continue; // Skip same city transition

            const additionalDistance = pathDistance;
            const newDistance = distance + additionalDistance;
            if (newDistance > shortestRoute.distance) {
                // Remove states that exceed the shortest route distance
                const newHeap = new MinHeap<IQueueStateExt>((a, b) => a.distance - b.distance);
                while (!heap.isEmpty()) {
                    const h = heap.pop()!;
                    if (h.distance <= shortestRoute.distance) {
                        newHeap.push(h);
                    }
                }
                heap.push(...newHeap.toArray());
                continue;
            }

            heap.push({
                currentLocation: nextCity,
                remainingPackages: newRemainingPackages,
                currentLoad: newLoad,
                route: [...route, nextCity],
                distance: newDistance,
            });
        }
    }

    return { route: ["No valid route found"], distance: 0 };
}

export function calculateShortestPath(dataProvider: DataProvider): string {
    const pathsObject: IPathObject[] = dataProvider
        .fetchPaths()
        .flatMap((path) => {
            const [from, to, distance] = path.split(",");
            return [
                { from, to, distance: Number(distance) },
                { from: to, to: from, distance: Number(distance) }, // Add the reverse path
            ];
        });

    const allShortestPaths = computeAllShortestPaths(pathsObject);

    const startingPoints = Array.from(
        new Set(pathsObject.flatMap((path) => [path.from, path.to]))
    );
    const allRoutes = startingPoints.map((startingPoint) =>
        CalculationBasicType(dataProvider, startingPoint, allShortestPaths)
    );

    const shortestRoute = allRoutes.reduce((bestRoute, currentRoute) =>
        currentRoute.distance < bestRoute.distance ? currentRoute : bestRoute
    );

    return `${shortestRoute.route.join(",")},${shortestRoute.distance}`;
}
