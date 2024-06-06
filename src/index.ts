import { CalculationBasicType } from "./calculationMethods/basicPath";
import { DataProvider } from "./data/data-provider";
import { calculateMostEfficientPath } from "./calculationMethods/mostEfficientPath";
import { calculateShortestPath } from "./calculationMethods/shortestPath";

export enum CalculationType {
    BasicPath = "BasicPath",
    ShortestPath = "ShortestPath",
    MostEfficientPath = "MostEfficientPath",
}

export type CalculatorOptions = {
    type: CalculationType;
};

// строга типизация е задължително условие
export function main(
    { type }: CalculatorOptions,
    dataProvider: DataProvider
): string {
    switch (type) {
        case CalculationType.BasicPath:
            return CalculationBasicType(dataProvider);
        case CalculationType.ShortestPath:
            return calculateShortestPath(dataProvider);
        case CalculationType.MostEfficientPath:
            return calculateMostEfficientPath(dataProvider); 
        default:
            break;
    }
    return "Brogrammers were here";
}
