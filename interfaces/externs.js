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

declare module 'ramda-fantasy' {
  declare class Maybe<A> {
    static Just<B>(x: B): Maybe<B>;
    static Nothing(): Maybe<A>;
    static maybe<C, D>(default: D): (t: (a: C) => D) => (m: Maybe<C>) => D;
    static of<B>(x: B): Maybe<B>;
    static isJust<B>(m: Maybe<B>): boolean;

    getOrElse(default: A): A;
    map<B>(f: (a: A) => B): B;
  }
}

declare module 'shift-parser/dist/tokenizer' {
    declare var TokenClass: any;
    declare var TokenType: any;
}

type predicate = (...x: any) => boolean;
type transform = (...x: any) => any;

declare module 'ramda' {
    declare var whereEq: (x: {[key: string]: any}) => (y: {[key: string]: any}) => boolean;
    declare var anyPass: (predicates: Array<predicate>) => predicate;
    declare var allPass: (predicates: Array<predicate>) => predicate;
    declare var cond: (x: Array<[predicate, transform]>) => (...args: any) => any;
    declare var T: (...x: any) => boolean;
    declare var F: (...x: any) => boolean;
    declare var curry: (...x: any) => any;
    declare var compose: (...f: any) => (...x: any) => any;
    declare var any: (p: predicate) => (x: Array<any>) => boolean;
    declare function chain(x: any): any;
    declare function none(p: predicate): (x: Array<any>) => boolean;
    declare function none(p: predicate, x: Array<any>): boolean;
    declare var equals: (a: any) => (b: any) => boolean;
    declare var pipe: (...f: any) => (...x: any) => any;
    declare var pipeK: (...f: any) => (...x: any) => any;
    declare var ifElse: (p: predicate) => (tru: transform) => (fls: transform) => transform;
    declare function map<A, B>(t: (a: A) => B):  (x: any) => B;
    declare function identity<A>(x: A): A;
    declare function always<A>(x: A): (...x: any) => A;
}

declare class Map {
    get(x: any): any;
    has(x: any): boolean;
    set(x: any, y: any): any;
}
