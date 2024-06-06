import { DataProvider } from "../data/data-provider";
import { CalculationType, main } from "../index";

class LargeDataProvider extends DataProvider {
  settings(): string {
    return "София,10000"; // Large bus capacity for testing
  }

  fetchPaths(): string[] {
    const cities = ["София", "Пловдив", "Варна", "Бургас", "Русе", "Стара Загора", "Плевен", "Добрич", "Шумен", "Перник"];
    const paths: string[] = [];
    for (let i = 0; i < cities.length; i++) {
      for (let j = i + 1; j < cities.length; j++) {
        const distance = Math.floor(Math.random() * 500) + 50; // Random distance between 50 and 550
        paths.push(`${cities[i]},${cities[j]},${distance}`);
        paths.push(`${cities[j]},${cities[i]},${distance}`);
      }
    }
    return paths;
  }

  fetchPackages(): string[] {
    const cities = ["София", "Пловдив", "Варна", "Бургас", "Русе", "Стара Загора", "Плевен", "Добрич", "Шумен", "Перник"];
    const packages: string[] = [];
    for (let i = 0; i < 1000; i++) { // Generating 1000 packages for stress test
      const from = cities[Math.floor(Math.random() * cities.length)];
      const to = cities[Math.floor(Math.random() * cities.length)];
      if (from !== to) {
        const weight = Math.floor(Math.random() * 1000) + 1; // Random weight between 1 and 1000
        packages.push(`${from},Item${i},${to},${weight}`);
      }
    }
    return packages;
  }
}

describe("Performance testing with large data", () => {
  let dataProvider: DataProvider;

  beforeEach(() => {
    dataProvider = new LargeDataProvider();
  });
  
  it("finds the shortest path efficiently", () => {
    const pathAndDistance = main(
      { type: CalculationType.ShortestPath },
      dataProvider
    );
    console.log(pathAndDistance);
    expect(pathAndDistance).not.toBe("No valid route found");
  });

  it("finds the most efficient path efficiently", () => {
    const pathAndFuel = main(
      { type: CalculationType.MostEfficientPath },
      dataProvider
    );
    console.log(pathAndFuel);
    expect(pathAndFuel).not.toBe("No valid route found");
  });
});
