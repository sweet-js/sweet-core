// TODO: expand these
declare module immutable {
    declare function List(): any
}

declare module "babel-core" {
    declare function transform(x: any): any
}

declare module "shift-reducer" {
    declare function reduce(x: any): any
}

declare class Map {
    get(x: any): any;
    has(x: any): boolean;
    set(x: any, y: any): any;
}
