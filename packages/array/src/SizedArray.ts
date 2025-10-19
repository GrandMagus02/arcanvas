import { boundsCheck, isIterable, toIndex } from "./utils";

// --- Type-level utilities for fixed-size index unions ---
/** Returns union 0..N-1 for literal N, or number when N is not specific. */
type BuildIndices<N extends number, A extends unknown[] = []> = number extends N ? number : A["length"] extends N ? A[number] : BuildIndices<N, [...A, A["length"]]>;

/** Union of valid indices for a fixed-size array length N. */
export type Indices<N extends number> = BuildIndices<N>;

type FixedIndexAccess<T, N extends number> = {
  [I in Indices<N>]: T;
};

/** Only enforce fixed index keys when N is a literal (not the broad number). */
type FixedIndexAccessIfLiteral<T, N extends number> = number extends N ? unknown : FixedIndexAccess<T, N>;

type FixedOps<T, N extends number> = {
  get(i: Indices<N>): T;
  set(i: Indices<N>, value: T): unknown;
  at(i: Indices<N>): T | undefined;
};

type WithFixedOps<V, T, N extends number> = Omit<V, "get" | "set" | "at"> & FixedOps<T, N>;

/**
 * Simple, fixed-size, generic array-like (no push/pop/splice).
 * - Holds any T
 * - Bounds-checked get/set
 * - Iterable; includes map/forEach/every/some/fill/clone/reduce
 * - Static from to preserve subclass type in map/clone
 */
export class SizedArray<T, N extends number = number> implements Iterable<T> {
  protected _data: T[];

  constructor(size: number, init?: Iterable<T> | ((i: number) => T) | T) {
    if (!Number.isInteger(size) || size < 0) {
      throw new TypeError("size must be a non-negative integer");
    }

    const data = new Array<T>(size);

    if (init === undefined) {
      // leave as undefined
    } else if (typeof init === "function") {
      for (let i = 0; i < size; i++) data[i] = (init as (i: number) => T)(i);
    } else if (isIterable<T>(init)) {
      let i = 0;
      for (const v of init) {
        if (i >= size) break;
        data[i++] = v;
      }
      // remaining stay undefined
    } else {
      data.fill(init as T);
    }

    this._data = data;

    // Define numeric index accessors (v[0], v[1], ...)
    for (let i = 0; i < size; i++) {
      Object.defineProperty(this, String(i), {
        get: () => this.get(i),
        set: (v: T) => {
          this.set(i, v);
        },
        enumerable: true,
        configurable: true,
      });
    }
  }

  static from<T, C extends SizedArray<T>>(this: new (size: number, init?: Iterable<T> | ((i: number) => T) | T) => C, values: ArrayLike<T> | Iterable<T>): C {
    const arr = Array.isArray(values) ? values : Array.from(values as Iterable<T>);
    return new this(arr.length, arr);
  }

  get length(): number {
    return this._data.length;
  }

  // Overloads restrict literal indices when N is known
  get(i: Indices<N>): T;
  get(i: number): T;
  get(i: number): T {
    const idx = toIndex(i, this.length);
    boundsCheck(idx, this.length);
    return this._data[idx]!;
  }

  set(i: Indices<N>, value: T): this;
  set(i: number, value: T): this;
  set(i: number, value: T): this {
    const idx = toIndex(i, this.length);
    boundsCheck(idx, this.length);
    this._data[idx] = value;
    return this;
  }

  at(i: Indices<N>): T | undefined;
  at(i: number): T | undefined;
  at(i: number): T | undefined {
    const idx = toIndex(i, this.length);
    if (idx < 0 || idx >= this.length) return undefined;
    return this._data[idx];
  }

  toArray(): T[] {
    return this._data.slice();
  }

  [Symbol.iterator](): IterableIterator<T> {
    return this.values();
  }

  values(): IterableIterator<T> {
    return this._data.values();
  }

  keys(): IterableIterator<number> {
    return this._data.keys();
  }

  entries(): IterableIterator<[number, T]> {
    return this._data.entries();
  }

  forEach(fn: (value: T, index: number, self: this) => void, thisArg?: unknown): void {
    for (let i = 0; i < this.length; i++) {
      fn.call(thisArg, this._data[i]!, i, this);
    }
  }

  map(fn: (value: T, index: number, self: this) => T, thisArg?: unknown): this {
    const out = new Array<T>(this.length);
    for (let i = 0; i < this.length; i++) {
      out[i] = fn.call(thisArg, this._data[i]!, i, this);
    }
    const Ctor = this.constructor as new (size: number, init?: Iterable<T> | ((i: number) => T) | T) => SizedArray<T>;
    return new Ctor(out.length, out) as unknown as this;
  }

  // reduce overloads
  reduce(callbackfn: (prev: T, curr: T, i: number, self: this) => T): T;
  reduce<U>(callbackfn: (prev: U, curr: T, i: number, self: this) => U, initial: U): U;
  reduce<U>(callbackfn: (prev: U, curr: T, i: number, self: this) => U, initial?: U): U | T {
    if (arguments.length >= 2) {
      let acc = initial as U;
      for (let i = 0; i < this.length; i++) {
        acc = callbackfn(acc, this._data[i]!, i, this);
      }
      return acc;
    }
    if (this.length === 0) {
      throw new TypeError("Reduce of empty SizedArray with no initial value");
    }
    let acc = this._data[0] as T;
    for (let i = 1; i < this.length; i++) {
      acc = (callbackfn as unknown as (prev: T, curr: T, i: number, self: this) => T)(acc, this._data[i]!, i, this);
    }
    return acc;
  }

  some(fn: (value: T, index: number, self: this) => boolean, thisArg?: unknown): boolean {
    for (let i = 0; i < this.length; i++) {
      if (fn.call(thisArg, this._data[i]!, i, this)) return true;
    }
    return false;
  }

  every(fn: (value: T, index: number, self: this) => boolean, thisArg?: unknown): boolean {
    for (let i = 0; i < this.length; i++) {
      if (!fn.call(thisArg, this._data[i]!, i, this)) return false;
    }
    return true;
  }

  fill(value: T): this {
    this._data.fill(value);
    return this;
  }

  clone(): this {
    const Ctor = this.constructor as new (size: number, init?: Iterable<T> | ((i: number) => T) | T) => SizedArray<T>;
    return new Ctor(this.length, this._data) as unknown as this;
  }

  equals(other: SizedArray<T> | { length: number; get?(i: number): T; [index: number]: T }, eq: (this: void, a: T | undefined, b: T | undefined) => boolean = Object.is): boolean {
    if (!other || typeof (other as { length: number }).length !== "number") return false;
    if ((other as { length: number }).length !== this.length) return false;
    for (let i = 0; i < this.length; i++) {
      const a = this._data[i];
      const b = typeof (other as { get?(i: number): T }).get === "function" ? (other as { get(i: number): T }).get(i) : (other as { [index: number]: T })[i];
      if (!eq(a, b)) return false;
    }
    return true;
  }

  toString(): string {
    return `${this.constructor.name}(${this.toArray().join(", ")})`;
  }

  // NOTE: intentionally no numeric index signature here.
}

import { setClassName, toBigInt } from "./utils";

/**
 * Factory for number-typed arrays (Int8/Uint8/.../Float64).
 */
export function createNumberSizedArrayClass<A extends Int8Array | Uint8Array | Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array>(
  name: string,
  ArrayCtor: new (size: number) => A
) {
  /**
   * Class representing a sized array of numbers
   */
  class NumberSizedArray<N extends number = number> implements Iterable<number> {
    protected _data: A;

    constructor(size: N, init?: Iterable<number> | ((i: number) => number) | number) {
      if (!Number.isInteger(size) || size < 0) {
        throw new TypeError("size must be a non-negative integer");
      }

      const data = new ArrayCtor(size);

      if (init === undefined) {
        // zeros by default
      } else if (typeof init === "function") {
        for (let i = 0; i < size; i++) data[i] = +(init as (i: number) => number)(i);
      } else if (isIterable<number>(init)) {
        let i = 0;
        for (const v of init) {
          if (i >= size) break;
          data[i++] = +v;
        }
      } else {
        data.fill(+init);
      }

      this._data = data;
    }

    static from<TThis extends NumberSizedArray>(this: new (size: number, init?: Iterable<number> | ((i: number) => number) | number) => TThis, values: ArrayLike<number> | Iterable<number>): TThis {
      const arr = Array.isArray(values) ? values : Array.from(values as Iterable<number>);
      return new this(arr.length, arr);
    }

    get length(): number {
      return this._data.length;
    }

    get(i: Indices<N>): number;
    get(i: number): number;
    get(i: number): number {
      const idx = toIndex(i, this.length);
      boundsCheck(idx, this.length);
      return this._data[idx]!;
    }

    set(i: Indices<N>, value: number): this;
    set(i: number, value: number): this;
    set(i: number, value: number): this {
      const idx = toIndex(i, this.length);
      boundsCheck(idx, this.length);
      this._data[idx] = +value;
      return this;
    }

    at(i: Indices<N>): number | undefined;
    at(i: number): number | undefined;
    at(i: number): number | undefined {
      const idx = toIndex(i, this.length);
      if (idx < 0 || idx >= this.length) return undefined;
      return this._data[idx];
    }

    toArray(): number[] {
      return Array.from(this._data);
    }

    [Symbol.iterator](): IterableIterator<number> {
      return this.values();
    }

    values(): IterableIterator<number> {
      return this._data.values();
    }

    keys(): IterableIterator<number> {
      return this._data.keys();
    }

    entries(): IterableIterator<[number, number]> {
      return this._data.entries();
    }

    forEach(fn: (value: number, index: number, self: this) => void, thisArg?: unknown): void {
      for (let i = 0; i < this.length; i++) {
        fn.call(thisArg, this._data[i]!, i, this);
      }
    }

    map(fn: (value: number, index: number, self: this) => number, thisArg?: unknown): this {
      const out = new ArrayCtor(this.length);
      for (let i = 0; i < this.length; i++) {
        out[i] = +fn.call(thisArg, this._data[i]!, i, this);
      }
      const Ctor = this.constructor as typeof NumberSizedArray;
      return Ctor.from(out) as unknown as this;
    }

    // reduce overloads
    reduce(callbackfn: (prev: number, curr: number, index: number, self: this) => number): number;
    reduce<U>(callbackfn: (prev: U, curr: number, index: number, self: this) => U, initial: U): U;
    reduce<U>(callbackfn: (prev: U, curr: number, index: number, self: this) => U, initial?: U): U | number {
      let i = 0;
      let acc: U | number;
      if (arguments.length >= 2) {
        acc = initial as U;
      } else {
        if (this.length === 0) {
          throw new TypeError(`Reduce of empty ${name} with no initial value`);
        }
        acc = this._data[0]!;
        i = 1;
      }
      for (; i < this.length; i++) {
        acc = callbackfn(acc as U, this._data[i]!, i, this);
      }
      return acc;
    }

    some(fn: (value: number, index: number, self: this) => boolean, thisArg?: unknown): boolean {
      for (let i = 0; i < this.length; i++) {
        if (fn.call(thisArg, this._data[i]!, i, this)) return true;
      }
      return false;
    }

    every(fn: (value: number, index: number, self: this) => boolean, thisArg?: unknown): boolean {
      for (let i = 0; i < this.length; i++) {
        if (!fn.call(thisArg, this._data[i]!, i, this)) return false;
      }
      return true;
    }

    fill(value: number): this {
      this._data.fill(+value);
      return this;
    }

    clone(): this {
      const Ctor = this.constructor as typeof NumberSizedArray;
      return Ctor.from(this._data) as unknown as this;
    }

    equals(other: NumberSizedArray, eps = 0): boolean {
      if (!other || typeof other.length !== "number") return false;
      if (other.length !== this.length) return false;
      for (let i = 0; i < this.length; i++) {
        const a = this._data[i]!;
        const b = other.get(i);
        if (eps === 0 ? a !== b : Math.abs(a - b) > eps) return false;
      }
      return true;
    }

    toString(): string {
      return `${name}(${this.toArray().join(", ")})`;
    }
  }

  return setClassName(NumberSizedArray, name);
}

/**
 * Factory for bigint-typed arrays (BigInt64/BigUint64).
 */
export function createBigIntSizedArrayClass<A extends BigInt64Array | BigUint64Array>(name: string, ArrayCtor: new (size: number) => A) {
  /**
   * Class representing a sized array of bigints
   */
  class BigIntSizedArray<N extends number = number> implements Iterable<bigint> {
    protected _data: A;

    constructor(size: number, init?: Iterable<bigint> | ((i: number) => bigint) | bigint | number) {
      if (!Number.isInteger(size) || size < 0) {
        throw new TypeError("size must be a non-negative integer");
      }

      const data = new ArrayCtor(size);

      if (init === undefined) {
        // 0n by default
      } else if (typeof init === "function") {
        for (let i = 0; i < size; i++) data[i] = toBigInt((init as (i: number) => bigint)(i));
      } else if (isIterable<bigint | number>(init)) {
        let i = 0;
        for (const v of init as Iterable<bigint | number>) {
          if (i >= size) break;
          data[i++] = toBigInt(v);
        }
      } else {
        data.fill(toBigInt(init));
      }

      this._data = data;
    }

    static from<TThis extends BigIntSizedArray>(
      this: new (size: number, init?: Iterable<bigint> | ((i: number) => bigint) | bigint | number) => TThis,
      values: ArrayLike<bigint> | Iterable<bigint>
    ): TThis {
      const arr = Array.isArray(values) ? values : Array.from(values as Iterable<bigint>);
      return new this(arr.length, arr);
    }

    get length(): number {
      return this._data.length;
    }

    get(i: Indices<N>): bigint;
    get(i: number): bigint;
    get(i: number): bigint {
      const idx = toIndex(i, this.length);
      boundsCheck(idx, this.length);
      return this._data[idx]!;
    }

    set(i: Indices<N>, value: bigint | number): this;
    set(i: number, value: bigint | number): this;
    set(i: number, value: bigint | number): this {
      const idx = toIndex(i, this.length);
      boundsCheck(idx, this.length);
      this._data[idx] = toBigInt(value);
      return this;
    }

    at(i: Indices<N>): bigint | undefined;
    at(i: number): bigint | undefined;
    at(i: number): bigint | undefined {
      const idx = toIndex(i, this.length);
      if (idx < 0 || idx >= this.length) return undefined;
      return this._data[idx];
    }

    toArray(): bigint[] {
      return Array.from(this._data);
    }

    [Symbol.iterator](): IterableIterator<bigint> {
      return this.values();
    }

    values(): IterableIterator<bigint> {
      return this._data.values();
    }

    keys(): IterableIterator<number> {
      return this._data.keys();
    }

    entries(): IterableIterator<[number, bigint]> {
      return this._data.entries();
    }

    forEach(fn: (value: bigint, index: number, self: this) => void, thisArg?: unknown): void {
      for (let i = 0; i < this.length; i++) {
        fn.call(thisArg, this._data[i]!, i, this);
      }
    }

    map(fn: (value: bigint, index: number, self: this) => bigint | number, thisArg?: unknown): this {
      const out = new ArrayCtor(this.length);
      for (let i = 0; i < this.length; i++) {
        out[i] = toBigInt(fn.call(thisArg, this._data[i]!, i, this));
      }
      const Ctor = this.constructor as typeof BigIntSizedArray;
      return Ctor.from(out) as unknown as this;
    }

    // reduce overloads
    reduce(callbackfn: (prev: bigint, curr: bigint, index: number, self: this) => bigint): bigint;
    reduce<U>(callbackfn: (prev: U, curr: bigint, index: number, self: this) => U, initial: U): U;
    reduce<U>(callbackfn: (prev: U, curr: bigint, index: number, self: this) => U, initial?: U): U | bigint {
      let i = 0;
      let acc: U | bigint;
      if (arguments.length >= 2) {
        acc = initial as U;
      } else {
        if (this.length === 0) {
          throw new TypeError(`Reduce of empty ${name} with no initial value`);
        }
        acc = this._data[0]!;
        i = 1;
      }
      for (; i < this.length; i++) {
        acc = callbackfn(acc as U, this._data[i]!, i, this);
      }
      return acc;
    }

    some(fn: (value: bigint, index: number, self: this) => boolean, thisArg?: unknown): boolean {
      for (let i = 0; i < this.length; i++) {
        if (fn.call(thisArg, this._data[i]!, i, this)) return true;
      }
      return false;
    }

    every(fn: (value: bigint, index: number, self: this) => boolean, thisArg?: unknown): boolean {
      for (let i = 0; i < this.length; i++) {
        if (!fn.call(thisArg, this._data[i]!, i, this)) return false;
      }
      return true;
    }

    fill(value: bigint | number): this {
      this._data.fill(toBigInt(value));
      return this;
    }

    clone(): this {
      const Ctor = this.constructor as typeof BigIntSizedArray;
      return Ctor.from(this._data) as unknown as this;
    }

    equals(other: BigIntSizedArray): boolean {
      if (!other || typeof other.length !== "number") return false;
      if (other.length !== this.length) return false;
      for (let i = 0; i < this.length; i++) {
        if (this._data[i] !== other.get(i)) return false;
      }
      return true;
    }

    toString(): string {
      return `${name}(${this.toArray().join(", ")})`;
    }
  }

  return setClassName(BigIntSizedArray, name);
}

// Number-typed
/**
 * Type representing a 3-element Int8 array.
 */
const Int8SizedArrayBase = createNumberSizedArrayClass("Int8SizedArray", Int8Array);
/**
 *
 */
export type Int8SizedArray<N extends number = number> = WithFixedOps<InstanceType<typeof Int8SizedArrayBase>, number, N> & FixedIndexAccessIfLiteral<number, N>;
export const Int8SizedArray: {
  new <N extends number>(size: N, init?: Iterable<number> | ((i: number) => number) | number): Int8SizedArray<N>;
  from(values: ArrayLike<number> | Iterable<number>): Int8SizedArray<number>;
} = Int8SizedArrayBase as unknown as {
  new <N extends number>(size: N, init?: Iterable<number> | ((i: number) => number) | number): Int8SizedArray<N>;
  from(values: ArrayLike<number> | Iterable<number>): Int8SizedArray<number>;
};
/**
 * Type representing a 3-element Uint8 array.
 */
const Uint8SizedArrayBase = createNumberSizedArrayClass("Uint8SizedArray", Uint8Array);
/**
 *
 */
export type Uint8SizedArray<N extends number = number> = WithFixedOps<InstanceType<typeof Uint8SizedArrayBase>, number, N> & FixedIndexAccessIfLiteral<number, N>;
export const Uint8SizedArray: {
  new <N extends number>(size: N, init?: Iterable<number> | ((i: number) => number) | number): Uint8SizedArray<N>;
  from(values: ArrayLike<number> | Iterable<number>): Uint8SizedArray<number>;
} = Uint8SizedArrayBase as unknown as {
  new <N extends number>(size: N, init?: Iterable<number> | ((i: number) => number) | number): Uint8SizedArray<N>;
  from(values: ArrayLike<number> | Iterable<number>): Uint8SizedArray<number>;
};
/**
 * Type representing a 3-element Uint8Clamped array.
 */
const Uint8ClampedSizedArrayBase = createNumberSizedArrayClass("Uint8ClampedSizedArray", Uint8ClampedArray);
/**
 *
 */
export type Uint8ClampedSizedArray<N extends number = number> = WithFixedOps<InstanceType<typeof Uint8ClampedSizedArrayBase>, number, N> & FixedIndexAccessIfLiteral<number, N>;
export const Uint8ClampedSizedArray: {
  new <N extends number>(size: N, init?: Iterable<number> | ((i: number) => number) | number): Uint8ClampedSizedArray<N>;
  from(values: ArrayLike<number> | Iterable<number>): Uint8ClampedSizedArray<number>;
} = Uint8ClampedSizedArrayBase as unknown as {
  new <N extends number>(size: N, init?: Iterable<number> | ((i: number) => number) | number): Uint8ClampedSizedArray<N>;
  from(values: ArrayLike<number> | Iterable<number>): Uint8ClampedSizedArray<number>;
};
/**
 * Type representing a 3-element Int16 array.
 */
const Int16SizedArrayBase = createNumberSizedArrayClass("Int16SizedArray", Int16Array);
/**
 *
 */
export type Int16SizedArray<N extends number = number> = WithFixedOps<InstanceType<typeof Int16SizedArrayBase>, number, N> & FixedIndexAccessIfLiteral<number, N>;
export const Int16SizedArray: {
  new <N extends number>(size: N, init?: Iterable<number> | ((i: number) => number) | number): Int16SizedArray<N>;
  from(values: ArrayLike<number> | Iterable<number>): Int16SizedArray<number>;
} = Int16SizedArrayBase as unknown as {
  new <N extends number>(size: N, init?: Iterable<number> | ((i: number) => number) | number): Int16SizedArray<N>;
  from(values: ArrayLike<number> | Iterable<number>): Int16SizedArray<number>;
};
/**
 * Type representing a 3-element Uint16 array.
 */
const Uint16SizedArrayBase = createNumberSizedArrayClass("Uint16SizedArray", Uint16Array);
/**
 *
 */
export type Uint16SizedArray<N extends number = number> = WithFixedOps<InstanceType<typeof Uint16SizedArrayBase>, number, N> & FixedIndexAccessIfLiteral<number, N>;
export const Uint16SizedArray: {
  new <N extends number>(size: N, init?: Iterable<number> | ((i: number) => number) | number): Uint16SizedArray<N>;
  from(values: ArrayLike<number> | Iterable<number>): Uint16SizedArray<number>;
} = Uint16SizedArrayBase as unknown as {
  new <N extends number>(size: N, init?: Iterable<number> | ((i: number) => number) | number): Uint16SizedArray<N>;
  from(values: ArrayLike<number> | Iterable<number>): Uint16SizedArray<number>;
};
/**
 * Type representing a 3-element Int32 array.
 */
const Int32SizedArrayBase = createNumberSizedArrayClass("Int32SizedArray", Int32Array);
/**
 *
 */
export type Int32SizedArray<N extends number = number> = WithFixedOps<InstanceType<typeof Int32SizedArrayBase>, number, N> & FixedIndexAccessIfLiteral<number, N>;
export const Int32SizedArray: {
  new <N extends number>(size: N, init?: Iterable<number> | ((i: number) => number) | number): Int32SizedArray<N>;
  from(values: ArrayLike<number> | Iterable<number>): Int32SizedArray<number>;
} = Int32SizedArrayBase as unknown as {
  new <N extends number>(size: N, init?: Iterable<number> | ((i: number) => number) | number): Int32SizedArray<N>;
  from(values: ArrayLike<number> | Iterable<number>): Int32SizedArray<number>;
};
/**
 * Type representing a 3-element Uint32 array.
 */
const Uint32SizedArrayBase = createNumberSizedArrayClass("Uint32SizedArray", Uint32Array);
/**
 *
 */
export type Uint32SizedArray<N extends number = number> = WithFixedOps<InstanceType<typeof Uint32SizedArrayBase>, number, N> & FixedIndexAccessIfLiteral<number, N>;
export const Uint32SizedArray: {
  new <N extends number>(size: N, init?: Iterable<number> | ((i: number) => number) | number): Uint32SizedArray<N>;
  from(values: ArrayLike<number> | Iterable<number>): Uint32SizedArray<number>;
} = Uint32SizedArrayBase as unknown as {
  new <N extends number>(size: N, init?: Iterable<number> | ((i: number) => number) | number): Uint32SizedArray<N>;
  from(values: ArrayLike<number> | Iterable<number>): Uint32SizedArray<number>;
};
/**
 * Type representing a 3-element Float32 array.
 */
const Float32SizedArrayBase = createNumberSizedArrayClass("Float32SizedArray", Float32Array);
/**
 *
 */
export type Float32SizedArray<N extends number = number> = WithFixedOps<InstanceType<typeof Float32SizedArrayBase>, number, N> & FixedIndexAccessIfLiteral<number, N>;
export const Float32SizedArray: {
  new <N extends number>(size: N, init?: Iterable<number> | ((i: number) => number) | number): Float32SizedArray<N>;
  from(values: ArrayLike<number> | Iterable<number>): Float32SizedArray<number>;
} = Float32SizedArrayBase as unknown as {
  new <N extends number>(size: N, init?: Iterable<number> | ((i: number) => number) | number): Float32SizedArray<N>;
  from(values: ArrayLike<number> | Iterable<number>): Float32SizedArray<number>;
};
/**
 * Type representing a 3-element Float64 array.
 */
const Float64SizedArrayBase = createNumberSizedArrayClass("Float64SizedArray", Float64Array);
/**
 *
 */
export type Float64SizedArray<N extends number = number> = WithFixedOps<InstanceType<typeof Float64SizedArrayBase>, number, N> & FixedIndexAccessIfLiteral<number, N>;
export const Float64SizedArray: {
  new <N extends number>(size: N, init?: Iterable<number> | ((i: number) => number) | number): Float64SizedArray<N>;
  from(values: ArrayLike<number> | Iterable<number>): Float64SizedArray<number>;
} = Float64SizedArrayBase as unknown as {
  new <N extends number>(size: N, init?: Iterable<number> | ((i: number) => number) | number): Float64SizedArray<N>;
  from(values: ArrayLike<number> | Iterable<number>): Float64SizedArray<number>;
};

// BigInt-typed (note: there is no Int64Array/Uint64Array; these are BigInt*)
/**
 * Type representing a 3-element BigInt64 array.
 */
const BigInt64SizedArrayBase = createBigIntSizedArrayClass("BigInt64SizedArray", BigInt64Array);
/**
 *
 */
export type BigInt64SizedArray<N extends number = number> = WithFixedOps<InstanceType<typeof BigInt64SizedArrayBase>, bigint, N> & FixedIndexAccessIfLiteral<bigint, N>;
export const BigInt64SizedArray: {
  new <N extends number>(size: N, init?: Iterable<bigint> | ((i: number) => bigint) | bigint | number): BigInt64SizedArray<N>;
  from(values: ArrayLike<bigint> | Iterable<bigint>): BigInt64SizedArray<number>;
} = BigInt64SizedArrayBase as unknown as {
  new <N extends number>(size: N, init?: Iterable<bigint> | ((i: number) => bigint) | bigint | number): BigInt64SizedArray<N>;
  from(values: ArrayLike<bigint> | Iterable<bigint>): BigInt64SizedArray<number>;
};
/**
 * Type representing a 3-element BigUint64 array.
 */
const BigUint64SizedArrayBase = createBigIntSizedArrayClass("BigUint64SizedArray", BigUint64Array);
/**
 *
 */
export type BigUint64SizedArray<N extends number = number> = WithFixedOps<InstanceType<typeof BigUint64SizedArrayBase>, bigint, N> & FixedIndexAccessIfLiteral<bigint, N>;
export const BigUint64SizedArray: {
  new <N extends number>(size: N, init?: Iterable<bigint> | ((i: number) => bigint) | bigint | number): BigUint64SizedArray<N>;
  from(values: ArrayLike<bigint> | Iterable<bigint>): BigUint64SizedArray<number>;
} = BigUint64SizedArrayBase as unknown as {
  new <N extends number>(size: N, init?: Iterable<bigint> | ((i: number) => bigint) | bigint | number): BigUint64SizedArray<N>;
  from(values: ArrayLike<bigint> | Iterable<bigint>): BigUint64SizedArray<number>;
};
