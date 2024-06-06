import { IPathObject } from "./types";
import MinHeap from "heap-js";

export function dijkstra(
    pathsObject: IPathObject[],
    start: string
): Map<string, number> {
    const distances = new Map<string, number>();
    const heap = new MinHeap<{ city: string; distance: number }>(
        (a, b) => a.distance - b.distance
    );

    pathsObject.forEach((path) => {
        distances.set(path.from, Infinity);
        distances.set(path.to, Infinity);
    });

    distances.set(start, 0);
    heap.push({ city: start, distance: 0 });

    while (!heap.isEmpty()) {
        const { city: currentCity, distance: currentDistance } = heap.pop()!;

        if (currentDistance > distances.get(currentCity)!) continue;

        for (const path of pathsObject.filter((p) => p.from === currentCity)) {
            const newDistance = currentDistance + path.distance;
            if (newDistance < distances.get(path.to)!) {
                distances.set(path.to, newDistance);
                heap.push({ city: path.to, distance: newDistance });
            }
        }
    }

    return distances;
}

export function computeAllShortestPaths(pathsObject: IPathObject[]): Map<string, Map<string, number>> {
    const allShortestPaths = new Map<string, Map<string, number>>();
    const cities = new Set(pathsObject.flatMap(path => [path.from, path.to]));

    cities.forEach(city => {
        allShortestPaths.set(city, dijkstra(pathsObject, city));
    });

    return allShortestPaths;
}