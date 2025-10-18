import {
  BigInt64SizedArray,
  BigUint64SizedArray,
  Float32SizedArray,
  Float64SizedArray,
  Int16SizedArray,
  Int32SizedArray,
  Int8SizedArray,
  setClassName,
  SizedArray,
  Uint8SizedArray,
} from "@arcanvas/array";

/**
 * Define component aliases on a prototype.
 */
function defineComponentAliases<T>(proto: object, names: string[], count: number, get: (i: number) => T, set: (i: number, v: T) => void) {
  for (let i = 0; i < Math.min(names.length, count); i++) {
    const key = names[i]!;
    Object.defineProperty(proto, key, {
      get(): T {
        return get.call(this, i);
      },
      set(v: T) {
        set.call(this, i, v);
      },
      enumerable: true,
      configurable: true,
    });
  }
}

/**
 * Number-sized base ctor type (your typed-sized arrays match this shape)
 */
type NumberSizedCtor = new (
  size: number,
  init?: Iterable<number> | ((i: number) => number) | number
) => {
  length: number;
  get(i: number): number;
  set(i: number, v: number): void;
  toArray(): number[];
};

/**
 * Bigint-sized base ctor type
 */
type BigIntSizedCtor = new (
  size: number,
  init?: Iterable<bigint> | ((i: number) => bigint) | bigint | number
) => {
  length: number;
  get(i: number): bigint;
  set(i: number, v: bigint | number): void;
  toArray(): bigint[];
};

const toBigInt = (x: unknown): bigint => {
  if (typeof x === "bigint") return x;
  if (typeof x === "number") return BigInt(Math.trunc(x));
  if (typeof x === "string") return BigInt(x);
  throw new TypeError("Cannot convert value to bigint");
};

/**
 * FACTORY: generic any-type vector class of fixed dimension.
 * - Returns a generic class Vector<T> extends SizedArray<T>
 * - No arithmetic (since T can be any type), only component aliases.
 */
export function createGenericVectorClass<D extends number>(name: string, dim: D) {
  /**
   *
   */
  class Vector<T> extends SizedArray<T> {
    constructor(size: number, init?: Iterable<T> | ((i: number) => T) | T);
    constructor(...values: T[]);
    constructor(a: number | T, b?: Iterable<T> | ((i: number) => T) | T, ...rest: T[]) {
      if (typeof a === "number" && rest.length === 0 && (typeof b === "function" || Array.isArray(b) || b === undefined)) {
        // Treat as (size, init?) form when no extra rest values
        super(a, b as Iterable<T> | ((i: number) => T) | T);
      } else {
        // Variadic values form; clip/pad to dim
        const values = [a as T, ...(b === undefined ? [] : [b as T]), ...rest];
        const init = Array.from({ length: dim }, (_, i) => values[i]!);
        super(dim, init);
      }
    }
    static fromValues<T2, C extends SizedArray<T2>>(this: new (size: number, init?: T2 | Iterable<T2> | ((i: number) => T2)) => C, values: ArrayLike<T2> | Iterable<T2>): C {
      const arr = Array.isArray(values) ? Array.from(values) : Array.from(values as Iterable<T2>);
      const clipped = arr.slice(0, dim);
      return new this(dim, clipped);
    }

    static override from<T, C extends SizedArray<T>>(this: new (size: number, init?: T | Iterable<T> | ((i: number) => T)) => C, values: ArrayLike<T> | Iterable<T>): C {
      const arr = Array.isArray(values) ? Array.from(values) : Array.from(values as Iterable<T>);
      return new this(arr.length, arr);
    }
  }

  // Add x,y,z,w aliases (and rgba)
  defineComponentAliases(
    Vector.prototype,
    ["x", "y", "z", "w"],
    dim,
    function (this: SizedArray<unknown>, i: number) {
      return this.get(i);
    },
    function (this: SizedArray<unknown>, i: number, v: unknown) {
      this.set(i, v as never);
    }
  );
  defineComponentAliases(
    Vector.prototype,
    ["r", "g", "b", "a"],
    dim,
    function (this: SizedArray<unknown>, i: number) {
      return this.get(i);
    },
    function (this: SizedArray<unknown>, i: number, v: unknown) {
      this.set(i, v as never);
    }
  );

  return setClassName(Vector as unknown as { new <T>(...values: T[]): SizedArray<T> }, name) as unknown as {
    new <T>(...values: T[]): SizedArray<T> & {
      [index: number]: T;
      // surface a few common aliases for small dims (for TS ergonomics)
      x?: T;
      y?: T;
      z?: T;
      w?: T;
    };
    fromValues<T2>(values: ArrayLike<T2> | Iterable<T2>): SizedArray<T2>;
    from<T2>(values: ArrayLike<T2> | Iterable<T2>): SizedArray<T2>;
  };
}

/**
 * FACTORY: numeric vector class of fixed dimension (works for all number typed arrays).
 * - Loops over dimension, so adding sizes 2,3,4,5... is trivial.
 * - Adds arithmetic: add, sub, scale, dot, length, normalized
 * - Adds cross when dim === 3
 */
export function createNumberVectorClass<D extends number>(name: string, Base: NumberSizedCtor, dim: D) {
  /**
   *
   */
  class NumberVector extends Base {
    constructor(...values: number[]) {
      const init = Array.from({ length: dim }, (_, i) => Number(values[i] ?? 0));
      super(dim, init);
    }
    static fromValues<C extends SizedArray<number>>(this: new (size: number, init?: number | Iterable<number> | ((i: number) => number)) => C, values: ArrayLike<number> | Iterable<number>): C {
      const arr = Array.isArray(values) ? Array.from(values) : Array.from(values as Iterable<number>);
      const clipped = arr.slice(0, dim).map((v) => +v);
      return new this(dim, clipped);
    }

    static from<C extends SizedArray<number>>(this: new (size: number, init?: number | Iterable<number> | ((i: number) => number)) => C, values: ArrayLike<number> | Iterable<number>): C {
      const arr = Array.isArray(values) ? Array.from(values) : Array.from(values as Iterable<number>);
      return new this(arr.length, arr);
    }

    add(v: { get(i: number): number }): NumberVector {
      const Ctor = this.constructor as unknown as { new (...values: number[]): NumberVector };
      const vals = Array.from({ length: dim }, (_, i) => this.get(i) + v.get(i));
      return new Ctor(...vals);
    }

    sub(v: { get(i: number): number }): NumberVector {
      const Ctor = this.constructor as unknown as { new (...values: number[]): NumberVector };
      const vals = Array.from({ length: dim }, (_, i) => this.get(i) - v.get(i));
      return new Ctor(...vals);
    }

    scale(s: number): NumberVector {
      const Ctor = this.constructor as unknown as { new (...values: number[]): NumberVector };
      const k = +s;
      const vals = Array.from({ length: dim }, (_, i) => this.get(i) * k);
      return new Ctor(...vals);
    }

    dot(v: { get(i: number): number }): number {
      let acc = 0;
      for (let i = 0; i < dim; i++) acc += this.get(i) * v.get(i);
      return acc;
    }

    magnitude(): number {
      return Math.sqrt(this.dot(this));
    }

    normalized(): NumberVector {
      const len = this.magnitude() || 1;
      return this.scale(1 / len);
    }
  }

  // Add component aliases x,y,z,w (and rgba)
  defineComponentAliases(
    NumberVector.prototype,
    ["x", "y", "z", "w"],
    dim,
    function (this: NumberVector, i: number) {
      return this.get(i);
    },
    function (this: NumberVector, i: number, v: number) {
      this.set(i, v);
    }
  );
  defineComponentAliases(
    NumberVector.prototype,
    ["r", "g", "b", "a"],
    dim,
    function (this: NumberVector, i: number) {
      return this.get(i);
    },
    function (this: NumberVector, i: number, v: number) {
      this.set(i, v);
    }
  );

  // Add cross for 3D vectors only (no method added for other dims)
  if (dim === 3) {
    Object.defineProperty(NumberVector.prototype, "cross", {
      value: function (this: NumberVector, v: { get(i: number): number }) {
        const ax = this.get(0);
        const ay = this.get(1);
        const az = this.get(2);
        const bx = v.get(0);
        const by = v.get(1);
        const bz = v.get(2);
        const Ctor = this.constructor as unknown as { new (x: number, y: number, z: number): NumberVector };
        return new Ctor(ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx);
      },
      writable: false,
      enumerable: false,
      configurable: true,
    });
  }

  return setClassName(NumberVector as unknown as { new (...values: number[]): NumberVector }, name) as unknown as {
    new (...values: number[]): {
      [index: number]: number;
      length: number;
      get(i: number): number;
      set(i: number, v: number): void;
      toArray(): number[];
      add(v: { get(i: number): number }): NumberVector;
      sub(v: { get(i: number): number }): NumberVector;
      scale(s: number): NumberVector;
      dot(v: { get(i: number): number }): number;
      magnitude(): number;
      normalized(): NumberVector;
      cross?: (v: { get(i: number): number }) => NumberVector; // present only for dim === 3
      x?: number;
      y?: number;
      z?: number;
      w?: number;
    };
    fromValues(values: ArrayLike<number> | Iterable<number>): NumberVector;
  };
}

/**
 * FACTORY: bigint vector class of fixed dimension (for BigInt64/BigUint64).
 * - Arithmetic in bigint (scale accepts bigint or number)
 * - No normalized (floating division doesn't exist in bigint). You can add
 *   lengthApprox() returning number if desired.
 */
export function createBigIntVectorClass<D extends number>(name: string, Base: BigIntSizedCtor, dim: D) {
  /**
   *
   */
  class BigIntVector extends Base {
    constructor(...values: (bigint | number)[]) {
      const init = Array.from({ length: dim }, (_, i) => toBigInt(values[i] ?? 0n));
      super(dim, init);
    }
    static fromValues<C extends SizedArray<bigint>>(this: new (size: number, init?: bigint | Iterable<bigint> | ((i: number) => bigint)) => C, values: ArrayLike<bigint> | Iterable<bigint>): C {
      const arr = Array.isArray(values) ? Array.from(values) : Array.from(values as Iterable<bigint>);
      const clipped = arr.slice(0, dim);
      return new this(dim, clipped);
    }

    static from<C extends SizedArray<bigint>>(this: new (size: number, init?: bigint | Iterable<bigint> | ((i: number) => bigint)) => C, values: ArrayLike<bigint> | Iterable<bigint>): C {
      const arr = Array.isArray(values) ? Array.from(values) : Array.from(values as Iterable<bigint>);
      return new this(arr.length, arr);
    }

    add(v: { get(i: number): bigint }): BigIntVector {
      const Ctor = this.constructor as unknown as { new (...values: (bigint | number)[]): BigIntVector };
      const vals = Array.from({ length: dim }, (_, i) => this.get(i) + v.get(i));
      return new Ctor(...vals);
    }

    sub(v: { get(i: number): bigint }): BigIntVector {
      const Ctor = this.constructor as unknown as { new (...values: (bigint | number)[]): BigIntVector };
      const vals = Array.from({ length: dim }, (_, i) => this.get(i) - v.get(i));
      return new Ctor(...vals);
    }

    scale(s: bigint | number): BigIntVector {
      const Ctor = this.constructor as unknown as { new (...values: (bigint | number)[]): BigIntVector };
      const k = toBigInt(s);
      const vals = Array.from({ length: dim }, (_, i) => this.get(i) * k);
      return new Ctor(...vals);
    }

    dot(v: { get(i: number): bigint }): bigint {
      let acc = 0n;
      for (let i = 0; i < dim; i++) acc += this.get(i) * v.get(i);
      return acc;
    }

    // Optional: approximate Euclidean length as number
    lengthApprox(): number {
      // sqrt(Number(dot(self, self))) — beware overflow for huge values
      return Math.sqrt(Number(this.dot(this)));
    }
  }

  defineComponentAliases(
    BigIntVector.prototype,
    ["x", "y", "z", "w"],
    dim,
    function (this: BigIntVector, i: number) {
      return this.get(i);
    },
    function (this: BigIntVector, i: number, v: bigint | number) {
      this.set(i, v);
    }
  );
  defineComponentAliases(
    BigIntVector.prototype,
    ["r", "g", "b", "a"],
    dim,
    function (this: BigIntVector, i: number) {
      return this.get(i);
    },
    function (this: BigIntVector, i: number, v: bigint | number) {
      this.set(i, v);
    }
  );

  return setClassName(BigIntVector as unknown as { new (...values: (bigint | number)[]): BigIntVector }, name) as unknown as {
    new (...values: (bigint | number)[]): BigIntVector;
    fromValues(values: ArrayLike<bigint> | Iterable<bigint>): BigIntVector;
  };
}

// Any-type vectors (generic)
export const Vector2 = createGenericVectorClass("Vector2", 2);
export const Vector3 = createGenericVectorClass("Vector3", 3);
export const Vector4 = createGenericVectorClass("Vector4", 4);

// Numeric typed vectors
export const Int8Vector2 = createNumberVectorClass("Int8Vector2", Int8SizedArray, 2);
export const Int8Vector3 = createNumberVectorClass("Int8Vector3", Int8SizedArray, 3);
export const Int8Vector4 = createNumberVectorClass("Int8Vector4", Int8SizedArray, 4);

export const Uint8Vector2 = createNumberVectorClass("Uint8Vector2", Uint8SizedArray, 2);
export const Uint8Vector3 = createNumberVectorClass("Uint8Vector3", Uint8SizedArray, 3);
export const Uint8Vector4 = createNumberVectorClass("Uint8Vector4", Uint8SizedArray, 4);

export const Int16Vector2 = createNumberVectorClass("Int16Vector2", Int16SizedArray, 2);
export const Int16Vector3 = createNumberVectorClass("Int16Vector3", Int16SizedArray, 3);
export const Int16Vector4 = createNumberVectorClass("Int16Vector4", Int16SizedArray, 4);

export const Int32Vector2 = createNumberVectorClass("Int32Vector2", Int32SizedArray, 2);
export const Int32Vector3 = createNumberVectorClass("Int32Vector3", Int32SizedArray, 3);
export const Int32Vector4 = createNumberVectorClass("Int32Vector4", Int32SizedArray, 4);

export const Float32Vector2 = createNumberVectorClass("Float32Vector2", Float32SizedArray, 2);
export const Float32Vector3 = createNumberVectorClass("Float32Vector3", Float32SizedArray, 3);
export const Float32Vector4 = createNumberVectorClass("Float32Vector4", Float32SizedArray, 4);

export const Float64Vector2 = createNumberVectorClass("Float64Vector2", Float64SizedArray, 2);
export const Float64Vector3 = createNumberVectorClass("Float64Vector3", Float64SizedArray, 3);
export const Float64Vector4 = createNumberVectorClass("Float64Vector4", Float64SizedArray, 4);

// Bigint typed vectors
export const BigInt64Vector2 = createBigIntVectorClass("BigInt64Vector2", BigInt64SizedArray, 2);
export const BigInt64Vector3 = createBigIntVectorClass("BigInt64Vector3", BigInt64SizedArray, 3);
export const BigInt64Vector4 = createBigIntVectorClass("BigInt64Vector4", BigInt64SizedArray, 4);

export const BigUint64Vector2 = createBigIntVectorClass("BigUint64Vector2", BigUint64SizedArray, 2);
export const BigUint64Vector3 = createBigIntVectorClass("BigUint64Vector3", BigUint64SizedArray, 3);
export const BigUint64Vector4 = createBigIntVectorClass("BigUint64Vector4", BigUint64SizedArray, 4);
