import { DataProvider } from "../data/data-provider";
import { CalculationType, main } from "../index";


describe("Основи на маршрутизатора", () => {
  let dataProvider: DataProvider;

  beforeEach(() => {
    dataProvider = new DataProvider();
  });

  it("follows the main scenario", () => {
    const path = main({ type: CalculationType.BasicPath }, dataProvider);

    const expectedPaths = ["София,Велико Търново,Пловдив,Велико Търново,София"];

    expect(expectedPaths).toContain(path);
  });

  // Additional tests
  it("handles no packages", () => {
    jest.spyOn(dataProvider, 'fetchPackages').mockReturnValue([]);
    const path = main({ type: CalculationType.BasicPath }, dataProvider);

    const expectedPaths = ["София"];

    expect(expectedPaths).toContain(path);
  });

  it("handles single package", () => {
    jest.spyOn(dataProvider, 'fetchPackages').mockReturnValue([
      "София,Фурна,Пловдив,100"
    ]);
    const path = main({ type: CalculationType.BasicPath }, dataProvider);

    const expectedPaths = ["София,Пловдив,София"];

    expect(expectedPaths).toContain(path);
  });

  it("handles capacity exceeded", () => {
    jest.spyOn(dataProvider, 'fetchPackages').mockReturnValue([
      "София,Фурна,Пловдив,300"
    ]);
    const path = main({ type: CalculationType.BasicPath }, dataProvider);

    const expectedPaths = ["No valid route found"];

    expect(expectedPaths).toContain(path);
  });

  it("handles multiple packages to the same destination", () => {
    jest.spyOn(dataProvider, 'fetchPackages').mockReturnValue([
      "София,Фурна,Пловдив,100",
      "София,Хладилник,Пловдив,50"
    ]);
    const path = main({ type: CalculationType.BasicPath }, dataProvider);

    const expectedPaths = ["София,Пловдив,София"];

    expect(expectedPaths).toContain(path);
  });

  it("handles packages with different destinations", () => {
    jest.spyOn(dataProvider, 'fetchPackages').mockReturnValue([
      "София,Фурна,Пловдив,100",
      "София,Хладилник,Велико Търново,100",
      "Пловдив,Цимент,Велико Търново,200",
      "Велико Търново,Пакет химикалки,София,2"
    ]);
    const path = main({ type: CalculationType.BasicPath }, dataProvider);

    const expectedPaths = ["София,Велико Търново,Пловдив,Велико Търново,София"];

    expect(expectedPaths).toContain(path);
  });

  it("handles no valid path due to package weight exceeding bus capacity", () => {
    jest.spyOn(dataProvider, 'fetchPackages').mockReturnValue([
      "София,Фурна,Пловдив,100",
      "София,Хладилник,Велико Търново,200",
      "Пловдив,Цимент,Велико Търново,200",
      "Велико Търново,Пакет химикалки,София,2"
    ]);
    const path = main({ type: CalculationType.BasicPath }, dataProvider);

    const expectedPaths = ["No valid route found"];

    expect(expectedPaths).toContain(path);
  });

  it("handles circular paths correctly", () => {
    jest.spyOn(dataProvider, 'fetchPaths').mockReturnValue([
      "София,Пловдив,100",
      "Пловдив,Велико Търново,100",
      "Велико Търново,София,100"
    ]);
    jest.spyOn(dataProvider, 'fetchPackages').mockReturnValue([
      "София,Фурна,Пловдив,50",
      "Пловдив,Цимент,Велико Търново,50",
      "Велико Търново,Пакет химикалки,София,50"
    ]);
    const path = main({ type: CalculationType.BasicPath }, dataProvider);

    const expectedPaths = ["София,Пловдив,Велико Търново,София"];

    expect(expectedPaths).toContain(path);
  });

  // Additional complex scenarios
  it("handles complex routes with multiple packages and paths", () => {
    jest.spyOn(dataProvider, 'fetchPaths').mockReturnValue([
      "София,Пловдив,146",
      "София,Велико Търново,219",
      "Пловдив,Велико Търново,213",
      "Пловдив,Бургас,250",
      "Бургас,Варна,120",
      "Варна,Велико Търново,180"
    ]);
    jest.spyOn(dataProvider, 'fetchPackages').mockReturnValue([
      "София,Фурна,Пловдив,50",
      "Пловдив,Хладилник,Бургас,60",
      "Бургас,Цимент,Варна,70",
      "Варна,Пакет химикалки,Велико Търново,30",
      "Велико Търново,Книги,София,20"
    ]);
    const path = main({ type: CalculationType.BasicPath }, dataProvider);

    const expectedPaths = [
      "София,Пловдив,Бургас,Варна,Велико Търново,София",
      "София,Велико Търново,Варна,Бургас,Пловдив,София"
    ];

    expect(expectedPaths).toContain(path);
  });
});

describe("Най-кратък маршрут", () => {
  let dataProvider: DataProvider;

  beforeEach(() => {
    dataProvider = new DataProvider();
  });

  it("follows the main scenario", () => {
    const pathAndDistance = main(
      { type: CalculationType.ShortestPath },
      dataProvider
    );

    const expectedPaths = [
      "София,Велико Търново,Пловдив,Велико Търново,София,864",
      "Пловдив,Велико Търново,София,Велико Търново,Пловдив,864",
      "Велико Търново,София,Велико Търново,Пловдив,Велико Търново,864",
    ];

    expect(expectedPaths).toContain(pathAndDistance);
  });
});

describe("Най-ефикасен маршрут", () => {
  let dataProvider: DataProvider;

  beforeEach(() => {
    dataProvider = new DataProvider();
  });

  it("follows the main scenario", () => {
    const pathAndFuel = main(
      { type: CalculationType.MostEfficientPath },
      dataProvider
    );

    const expectedPaths = [
      "Пловдив,Велико Търново,София,Велико Търново,Пловдив,97.2138",
      "Велико Търново,София,Велико Търново,Пловдив,Велико Търново,97.2138",
    ];

    expect(expectedPaths).toContain(pathAndFuel);
  });

  // Additional test for efficiency with different package configurations
  
});


