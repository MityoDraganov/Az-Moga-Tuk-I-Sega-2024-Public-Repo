export class DataProvider {
  settings(): string {
    return "София,250";
  }
  fetchPaths(): string[] {
    return [
      "София,Пловдив,146",
      "София,Велико Търново,219",
      "Пловдив,Велико Търново,213",
    ];
  }
  fetchPackages(): string[] {
    return [
      "София,Фурна,Пловдив,100",
      "София,Хладилник,Велико Търново,100",
      "Пловдив,Цимент,Велико Търново,200",
      "Велико Търново,Пакет химикалки,София,2",
    ];
  }
}


export class LargeDataProvider extends DataProvider {
  settings(): string {
    return "София,100000"; // Large bus capacity for testing
  }

  fetchPaths(): string[] {
    const cities = ["София", "Пловдив", "Варна", "Бургас", ];
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
    const cities = ["София", "Пловдив", "Варна", "Бургас", "Русе", "Стара Загора"];
    const packages: string[] = [];
    for (let i = 0; i < 30; i++) { // Generating 1000 packages for stress test
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
