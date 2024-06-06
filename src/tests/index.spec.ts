import { CalculationType, main } from "../index";
import { DataProvider } from "../data/data-provider";

describe("Основи на маршрутизатора", () => {
  let dataProvider: DataProvider;

  beforeEach(() => {
    dataProvider = new DataProvider();
  });

  it("follows the main scenario", () => {
    const path = main({ type: CalculationType.BasicPath }, dataProvider);

    const expectedPaths = ["София,Велико Търново,Пловдив,Велико Търново,София"];

    expect(expectedPaths).toContainEqual(path);
  });

  //aditional tests
  it("follows the main scenario", () => {
    const path = main({ type: CalculationType.BasicPath }, dataProvider);

    const expectedPaths = ["София,Велико Търново,Пловдив,Велико Търново,София"];

    expect(expectedPaths).toContainEqual(path);
  });

  it("handles no packages", () => {
    jest.spyOn(dataProvider, 'fetchPackages').mockReturnValue([]);
    const path = main({ type: CalculationType.BasicPath }, dataProvider);

    const expectedPaths = ["София"];

    expect(expectedPaths).toContainEqual(path);
  });

  it("handles single package", () => {
    jest.spyOn(dataProvider, 'fetchPackages').mockReturnValue([
      "София,Фурна,Пловдив,100"
    ]);
    const path = main({ type: CalculationType.BasicPath }, dataProvider);

    const expectedPaths = ["София,Пловдив,София"];

    expect(expectedPaths).toContainEqual(path);
  });

  it("handles capacity exceeded", () => {
    jest.spyOn(dataProvider, 'fetchPackages').mockReturnValue([
      "София,Фурна,Пловдив,300"
    ]);
    const path = main({ type: CalculationType.BasicPath }, dataProvider);

    const expectedPaths = ["No valid route found"];

    expect(expectedPaths).toContainEqual(path);
  });

  it("handles multiple packages to the same destination", () => {
    jest.spyOn(dataProvider, 'fetchPackages').mockReturnValue([
      "София,Фурна,Пловдив,100",
      "София,Хладилник,Пловдив,50"
    ]);
    const path = main({ type: CalculationType.BasicPath }, dataProvider);

    const expectedPaths = ["София,Пловдив,София"];

    expect(expectedPaths).toContainEqual(path);
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

    expect(expectedPaths).toContainEqual(path);
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

    expect(expectedPaths).toContainEqual(path);
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

    expect(expectedPaths).toContainEqual(path);
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

    expect(expectedPaths).toContainEqual(pathAndDistance);
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

    expect(expectedPaths).toContainEqual(pathAndFuel);
  });
});
