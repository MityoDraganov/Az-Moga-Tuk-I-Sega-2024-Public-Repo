import { DataProvider } from "../data/data-provider";
import { IPackagesObjects, IPathObject, IQueueState } from "../utils/types";
import MinHeap from 'heap-js';
import { computeAllShortestPaths } from "../utils/utils";

export function CalculationBasicType(dataProvider: DataProvider): string {
    const [startingPoint, busCapacityStr] = dataProvider.settings().split(",");
    const busCapacity = Number(busCapacityStr);

    const pathsObject: IPathObject[] = dataProvider.fetchPaths().flatMap(path => {
        const [from, to, distance] = path.split(",");
        return [
            { from, to, distance: Number(distance) },
            { from: to, to: from, distance: Number(distance) } // Add the reverse path
        ];
    });

    const allShortestPaths = computeAllShortestPaths(pathsObject);

    const packagesObjects: IPackagesObjects[] = dataProvider.fetchPackages().map(pkg => {
        const [from, item, to, weight] = pkg.split(",");
        return { from, item, to, weight: Number(weight) };
    });

    const heap = new MinHeap<IQueueState>((a, b) => a.route.length - b.route.length);
    heap.push({
        currentLocation: startingPoint,
        remainingPackages: packagesObjects,
        currentLoad: [],
        route: [startingPoint]
    });

    const visited = new Set<string>();

    while (!heap.isEmpty()) {
        const state = heap.pop()!;
        const { currentLocation, remainingPackages, currentLoad, route } = state;

        const stateKey = `${currentLocation}-${remainingPackages.length}-${currentLoad.length}-${route.join(',')}`;
        if (visited.has(stateKey)) {
            continue;
        }
        visited.add(stateKey);

        let newLoad = currentLoad.filter(pkg => pkg.to !== currentLocation);

        const loadingPackages = remainingPackages.filter(pkg => pkg.from === currentLocation);
        const newRemainingPackages = remainingPackages.filter(pkg => pkg.from !== currentLocation);

        newLoad = [...newLoad, ...loadingPackages];
        const totalWeight = newLoad.reduce((sum, pkg) => sum + pkg.weight, 0);

        if (totalWeight > busCapacity) {
            continue;
        }

        if (newRemainingPackages.length === 0 && currentLocation === startingPoint && newLoad.length === 0) {
            return route.join(",");
        }

        const shortestPathsFromCurrent = allShortestPaths.get(currentLocation)!;
        for (const [nextCity, pathDistance] of shortestPathsFromCurrent.entries()) {
            if (currentLocation === nextCity) continue; // Skip same city transition

            const newStateKey = `${nextCity}-${newRemainingPackages.length}-${newLoad.length}-${[...route, nextCity].join(',')}`;
            if (visited.has(newStateKey)) {
                continue;
            }

            heap.push({
                currentLocation: nextCity,
                remainingPackages: newRemainingPackages,
                currentLoad: newLoad,
                route: [...route, nextCity]
            });
        }
    }

    return "No valid route found";
}
