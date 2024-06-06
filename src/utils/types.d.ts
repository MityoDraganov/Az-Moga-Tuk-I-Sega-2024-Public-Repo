export interface IPackagesObjects {
    from: string;
    item: string;
    to: string;
    weight: number;
}

export interface IPathObject {
    from: string;
    to: string;
    distance: number;
}

export interface IQueueState {
    currentLocation: string;
    remainingPackages: IPackagesObjects[];
    currentLoad: IPackagesObjects[];
    route: string[];
}

interface IQueueStateExt extends IQueueState{
    distance: number;
}

export interface IRouteInfo {
    route: string[];
    distance: number;
}

export interface IRouteInfoFuel extends IRouteInfo {
    totalFuel: number;
}

export interface IRouteInfoFuelExt extends IRouteInfoFuel {
    estimatedTotalFuel: number;
    currentLocation: string;
}

interface State extends IQueueStateExt {
    totalFuel: number;
    estimatedTotalFuel: number;
}
