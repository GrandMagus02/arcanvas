import {
  BigInt64SizedArray,
  BigUint64SizedArray,
  Float32SizedArray,
  Float64SizedArray,
  Int16SizedArray,
  Int32SizedArray,
  Int8SizedArray,
  isIterable,
  setClassName,
  SizedArray,
  toBigInt,
  Uint8SizedArray,
} from "@arcanvas/array";

/**
 * Types from your code, repeated here for completeness.
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

type BigIntSizedCtor = new (
  size: number,
  init?: Iterable<bigint> | ((i: number) => bigint) | bigint | number
) => {
  length: number;
  get(i: number): bigint;
  set(i: number, v: bigint | number): void;
  toArray(): bigint[];
};

/**
 * Helpers for N-D shapes and indexing (row-major).
 */
const product = (dims: readonly number[]): number => dims.reduce((a, b) => a * b, 1);

const computeStrides = (dims: readonly number[]): number[] => {
  const n = dims.length;
  const strides = new Array<number>(n);
  let s = 1;
  for (let i = n - 1; i >= 0; i--) {
    strides[i] = s;
    s *= dims[i]!;
  }
  return strides;
};

const coordsToIndex = (dims: readonly number[], strides: readonly number[], coords: readonly number[]): number => {
  if (coords.length !== dims.length) {
    throw new RangeError(`Expected ${dims.length} indices, got ${coords.length}`);
  }
  let idx = 0;
  for (let i = 0; i < dims.length; i++) {
    const c = coords[i]!;
    const d = dims[i]!;
    if (c < 0 || c >= d || !Number.isInteger(c)) {
      throw new RangeError(`Index out of bounds at axis ${i}: ${c} not in [0, ${d})`);
    }
    idx += c * strides[i]!;
  }
  return idx;
};

const toNested = <T>(flat: { get(i: number): T }, dims: readonly number[], offset = 0, strides = computeStrides(dims), axis = 0): unknown => {
  if (axis === dims.length - 1) {
    const len = dims[axis]!;
    const arr = new Array<T>(len);
    const base = offset;
    for (let i = 0; i < len; i++) {
      arr[i] = flat.get(base + i * strides[axis]!);
    }
    return arr;
  }
  const len = dims[axis]!;
  const list: unknown[] = new Array(len);
  for (let i = 0; i < len; i++) {
    list[i] = toNested(flat, dims, offset + i * strides[axis]!, strides, axis + 1);
  }
  return list;
};

type Nested<T> = T | Iterable<Nested<T>>;

// Public shape types for factory returns to avoid self-referential return types
type NumberMatrixInstance = {
  [index: number]: number;
  length: number;
  get(i: number): number;
  set(i: number, v: number): void;
  toArray(): number[];
  getN(...coords: number[]): number;
  setN(v: number, ...coords: number[]): void;
  add(v: { get(i: number): number }): NumberMatrixInstance;
  sub(v: { get(i: number): number }): NumberMatrixInstance;
  scale(s: number): NumberMatrixInstance;
  dot(v: { get(i: number): number }): number;
  magnitude(): number;
  normalized(): NumberMatrixInstance;
  toNested(): unknown;
  matMul: (B: unknown) => NumberMatrixInstance;
};

type NumberMatrixClass = {
  new (...values: number[]): NumberMatrixInstance;
  readonly shape: readonly number[];
  readonly size: number;
  fromValues(values: ArrayLike<number> | Iterable<number> | Nested<number>): NumberMatrixInstance;
};

type BigIntMatrixInstance = {
  [index: number]: bigint;
  length: number;
  get(i: number): bigint;
  set(i: number, v: bigint | number): void;
  toArray(): bigint[];
  getN(...coords: number[]): bigint;
  setN(v: bigint | number, ...coords: number[]): void;
  add(v: { get(i: number): bigint }): BigIntMatrixInstance;
  sub(v: { get(i: number): bigint }): BigIntMatrixInstance;
  scale(s: bigint | number): BigIntMatrixInstance;
  dot(v: { get(i: number): bigint }): bigint;
  lengthApprox(): number;
  toNested(): unknown;
};

type BigIntMatrixClass = {
  new (...values: (bigint | number)[]): BigIntMatrixInstance;
  readonly shape: readonly number[];
  readonly size: number;
  fromValues(values: ArrayLike<bigint | number | string> | Iterable<bigint | number | string> | Nested<bigint | number | string>): BigIntMatrixInstance;
};

/**
 * Flatten a (possibly nested) iterable into a flat array up to given shape.
 * Missing items are padded with `pad` (default 0 for number, 0n for bigint, undefined for generic).
 */
function flattenToShape<T>(value: Nested<T>, dims: readonly number[], pad: T, out: T[] = []): T[] {
  const total = product(dims);

  const recurse = (v: Nested<T>) => {
    if (!isIterable(v) || typeof v === "string") {
      // Single scalar
      out.push(v as T);
    } else {
      for (const item of v as Iterable<Nested<T>>) {
        if (!isIterable(item) || typeof item === "string") {
          out.push(item as T);
        } else {
          recurse(item);
        }
        if (out.length >= total) break;
      }
    }
  };

  recurse(value);

  if (out.length < total) {
    out.push(...Array.from({ length: total - out.length }, () => pad));
  } else if (out.length > total) {
    out.length = total;
  }
  return out;
}

/**
 * GENERIC: any-type N-D Matrix/Tensor (no arithmetic).
 */
export function createGenericMatrixClass(name: string, dims: readonly number[]) {
  const SHAPE = Object.freeze([...dims]);
  const SIZE = product(SHAPE);
  const STRIDES = computeStrides(SHAPE);

  /**
   * Generic Matrix class
   */
  class Matrix<T> extends SizedArray<T> {
    // Overload similar to your generic vectors.
    constructor(size: number, init?: Iterable<T> | ((i: number) => T) | T);
    constructor(...values: T[]);
    constructor(a: number | T, b?: Iterable<T> | ((i: number) => T) | T, ...rest: T[]) {
      if (typeof a === "number" && rest.length === 0 && (typeof b === "function" || Array.isArray(b) || b === undefined)) {
        super(a, b as Iterable<T> | ((i: number) => T) | T);
      } else {
        const values = [a as T, ...(b === undefined ? [] : [b as T]), ...rest];
        const init = Array.from({ length: SIZE }, (_, i) => values[i]!);
        super(SIZE, init);
      }
    }

    static readonly shape = SHAPE;
    static readonly size = SIZE;

    getShape(): readonly number[] {
      return SHAPE;
    }

    indexOf(...coords: number[]): number {
      return coordsToIndex(SHAPE, STRIDES, coords);
    }

    getN(...coords: number[]): T {
      return this.get(this.indexOf(...coords));
    }

    setN(v: T, ...coords: number[]): void {
      this.set(this.indexOf(...coords), v);
    }

    toNested(): unknown {
      return toNested<T>(this, SHAPE);
    }

    // Accept nested or flat values; clip/pad to SIZE
    static fromValues<T2, C extends SizedArray<T2>>(this: new (size: number, init?: T2 | Iterable<T2> | ((i: number) => T2)) => C, values: ArrayLike<T2> | Iterable<T2> | Nested<T2>): C {
      const isNestedLike =
        typeof values !== "string" &&
        !Array.isArray(values) &&
        isIterable(values) &&
        // Heuristic: if first item is iterable we treat as nested
        (() => {
          const it = (values as Iterable<unknown>)[Symbol.iterator]();
          const n = it.next();
          return !n.done && !!n.value && typeof n.value !== "string" && isIterable(n.value as unknown);
        })();

      let flat: T2[];
      if (Array.isArray(values)) {
        const first = (values as unknown[])[0];
        const firstLooksNested = first !== undefined && typeof first !== "string" && isIterable(first);
        if (firstLooksNested) {
          flat = flattenToShape(values as Nested<T2>, SHAPE, undefined as T2);
        } else {
          flat = (values as unknown[]).slice(0, SIZE) as T2[];
          if (flat.length < SIZE) {
            flat.push(...Array.from({ length: SIZE - flat.length }, () => undefined as T2));
          }
        }
      } else if (isNestedLike) {
        flat = flattenToShape(values as Nested<T2>, SHAPE, undefined as T2);
      } else {
        // Generic iterable (flat)
        flat = Array.from(values as Iterable<T2>);
        if (flat.length < SIZE) {
          flat.push(...Array.from({ length: SIZE - flat.length }, () => undefined as T2));
        } else if (flat.length > SIZE) {
          flat.length = SIZE;
        }
      }
      return new this(SIZE, flat);
    }

    static override from<T, C extends SizedArray<T>>(this: new (size: number, init?: T | Iterable<T> | ((i: number) => T)) => C, values: ArrayLike<T> | Iterable<T>): C {
      const arr = Array.isArray(values) ? Array.from(values) : Array.from(values as Iterable<T>);
      return new this(arr.length, arr);
    }
  }

  return setClassName(Matrix as unknown as { new <T>(...v: T[]): SizedArray<T> }, name) as unknown as {
    new <T>(...v: T[]): SizedArray<T> & {
      [index: number]: T;
    };
    readonly shape: readonly number[];
    readonly size: number;
    fromValues<T2>(values: ArrayLike<T2> | Iterable<T2> | Nested<T2>): SizedArray<T2>;
    from<T2>(values: ArrayLike<T2> | Iterable<T2>): SizedArray<T2>;
  };
}

/**
 * NUMBER: N-D Matrix/Tensor with elementwise arithmetic.
 */
export function createNumberMatrixClass(name: string, Base: NumberSizedCtor, dims: readonly number[]): NumberMatrixClass {
  const SHAPE = Object.freeze([...dims]);
  const SIZE = product(SHAPE);
  const STRIDES = computeStrides(SHAPE);

  /**
   *
   */
  class NumberMatrix extends Base {
    constructor(...values: number[]) {
      const init = Array.from({ length: SIZE }, (_, i) => Number(values[i] ?? 0));
      super(SIZE, init);
    }

    static readonly shape = SHAPE;
    static readonly size = SIZE;

    getShape(): readonly number[] {
      return SHAPE;
    }

    indexOf(...coords: number[]): number {
      return coordsToIndex(SHAPE, STRIDES, coords);
    }

    getN(...coords: number[]): number {
      return this.get(this.indexOf(...coords));
    }

    setN(v: number, ...coords: number[]): void {
      this.set(this.indexOf(...coords), v);
    }

    // Frobenius helpers
    add(v: { get(i: number): number }): NumberMatrix {
      const Ctor = this.constructor as unknown as {
        new (...values: number[]): NumberMatrix;
      };
      const out = Array.from({ length: SIZE }, (_, i) => this.get(i) + v.get(i));
      return new Ctor(...out);
    }

    sub(v: { get(i: number): number }): NumberMatrix {
      const Ctor = this.constructor as unknown as {
        new (...values: number[]): NumberMatrix;
      };
      const out = Array.from({ length: SIZE }, (_, i) => this.get(i) - v.get(i));
      return new Ctor(...out);
    }

    scale(s: number): NumberMatrix {
      const Ctor = this.constructor as unknown as {
        new (...values: number[]): NumberMatrix;
      };
      const k = +s;
      const out = Array.from({ length: SIZE }, (_, i) => this.get(i) * k);
      return new Ctor(...out);
    }

    // Inner product (sum over all elements)
    dot(v: { get(i: number): number }): number {
      let acc = 0;
      for (let i = 0; i < SIZE; i++) acc += this.get(i) * v.get(i);
      return acc;
    }

    magnitude(): number {
      let acc = 0;
      for (let i = 0; i < SIZE; i++) {
        const x = this.get(i);
        acc += x * x;
      }
      return Math.sqrt(acc);
    }

    normalized(): NumberMatrix {
      const len = this.magnitude() || 1;
      return this.scale(1 / len);
    }

    toNested(): unknown {
      return toNested<number>(this, SHAPE);
    }

    static fromValues<C extends SizedArray<number>>(this: new (...values: number[]) => C, values: ArrayLike<number> | Iterable<number> | Nested<number>): C {
      // Accept nested; clip/pad with 0
      let flat: number[];
      const total = SIZE;

      const looksNested = (val: unknown): boolean => {
        if (!isIterable(val) || typeof val === "string") return false;
        const iterator = val[Symbol.iterator]();
        const first = iterator.next();
        return !first.done && isIterable(first.value);
      };

      if (Array.isArray(values)) {
        const first = (values as unknown[])[0];
        const firstLooksNested = first !== undefined && typeof first !== "string" && isIterable(first);
        if (firstLooksNested) {
          flat = flattenToShape(values as Nested<number>, SHAPE, 0);
        } else {
          flat = (values as unknown[]).slice(0, total).map((v) => +((v as number) ?? 0));
          if (flat.length < total) {
            flat.push(...Array.from({ length: total - flat.length }, () => 0));
          }
        }
      } else if (looksNested(values)) {
        flat = flattenToShape(values as Nested<number>, SHAPE, 0);
      } else {
        flat = Array.from(values as Iterable<number>, (v) => +v);
        if (flat.length < total) {
          flat.push(...Array.from({ length: total - flat.length }, () => 0));
        } else if (flat.length > total) {
          flat.length = total;
        }
      }

      return new this(...flat);
    }

    static from<C extends SizedArray<number>>(this: new (size: number, init?: number | Iterable<number> | ((i: number) => number)) => C, values: ArrayLike<number> | Iterable<number>): C {
      const arr = Array.isArray(values) ? Array.from(values, (v) => +v) : Array.from(values as Iterable<number>, (v) => +v);
      return new this(arr.length, arr);
    }

    // 2D-only matrix multiply (row-major). Returns a new class instance matching
    // [A.rows, B.cols] at runtime. If B has shape [SHAPE[1], K].
    // Note: This returns a dynamically constructed class for the result shape.
    matMul<BType extends { constructor: { shape?: readonly [number, number]; name?: string }; getN(i: number, j: number): number }>(
      this: NumberMatrix,
      B: BType
    ): InstanceType<ReturnType<typeof createNumberMatrixClass>> {
      if (SHAPE.length !== 2) {
        throw new Error("matMul is only available for 2D matrices.");
      }
      const [ar, ac] = SHAPE as [number, number];
      const bShape: readonly number[] =
        (B.constructor as { shape?: readonly number[] }).shape ??
        (() => {
          throw new Error("Right-hand matrix must be a NumberMatrix with static shape.");
        })();

      if (bShape.length !== 2) {
        throw new Error("Right-hand matrix must be 2D.");
      }
      const [br, bc] = bShape as [number, number];
      if (ac !== br) {
        throw new Error(`Shape mismatch for matMul: [${ar}x${ac}] x [${br}x${bc}]`);
      }

      // Build result class on the fly using same Base
      const thisName = (this.constructor as { name?: string }).name ?? "A";
      const bName = (B.constructor as { name?: string }).name ?? "B";
      const ResultClass = createNumberMatrixClass(`${thisName}x${bName}`, Base, [ar, bc]) as unknown as { new (): unknown };

      const CUnknown = new (ResultClass as { new (): unknown })();

      for (let i = 0; i < ar; i++) {
        for (let k = 0; k < bc; k++) {
          let sum = 0;
          for (let j = 0; j < ac; j++) {
            const a_ik = this.getN(i, j);
            const b_jk = B.getN(j, k);
            sum += a_ik * b_jk;
          }

          (CUnknown as { setN(v: number, i: number, k: number): void }).setN(sum, i, k);
        }
      }
      return CUnknown as InstanceType<ReturnType<typeof createNumberMatrixClass>>;
    }
  }

  return setClassName(NumberMatrix as unknown as { new (...values: number[]): unknown }, name) as unknown as NumberMatrixClass;
}

/**
 * BIGINT: N-D Matrix/Tensor with bigint arithmetic.
 */
export function createBigIntMatrixClass(name: string, Base: BigIntSizedCtor, dims: readonly number[]): BigIntMatrixClass {
  const SHAPE = Object.freeze([...dims]);
  const SIZE = product(SHAPE);
  const STRIDES = computeStrides(SHAPE);

  /**
   *
   */
  class BigIntMatrix extends Base {
    constructor(...values: (bigint | number)[]) {
      const init = Array.from({ length: SIZE }, (_, i) => toBigInt(values[i] ?? 0n));
      super(SIZE, init);
    }

    static readonly shape = SHAPE;
    static readonly size = SIZE;

    getShape(): readonly number[] {
      return SHAPE;
    }

    indexOf(...coords: number[]): number {
      return coordsToIndex(SHAPE, STRIDES, coords);
    }

    getN(...coords: number[]): bigint {
      return this.get(this.indexOf(...coords));
    }

    setN(v: bigint | number, ...coords: number[]): void {
      this.set(this.indexOf(...coords), v);
    }

    add(v: { get(i: number): bigint }): BigIntMatrix {
      const Ctor = this.constructor as unknown as {
        new (...values: (bigint | number)[]): BigIntMatrix;
      };
      const out = Array.from({ length: SIZE }, (_, i) => this.get(i) + v.get(i));
      return new Ctor(...out);
    }

    sub(v: { get(i: number): bigint }): BigIntMatrix {
      const Ctor = this.constructor as unknown as {
        new (...values: (bigint | number)[]): BigIntMatrix;
      };
      const out = Array.from({ length: SIZE }, (_, i) => this.get(i) - v.get(i));
      return new Ctor(...out);
    }

    scale(s: bigint | number): BigIntMatrix {
      const Ctor = this.constructor as unknown as {
        new (...values: (bigint | number)[]): BigIntMatrix;
      };
      const k = toBigInt(s);
      const out = Array.from({ length: SIZE }, (_, i) => this.get(i) * k);
      return new Ctor(...out);
    }

    dot(v: { get(i: number): bigint }): bigint {
      let acc = 0n;
      for (let i = 0; i < SIZE; i++) acc += this.get(i) * v.get(i);
      return acc;
    }

    lengthApprox(): number {
      // sqrt(Number(dot(self, self))) — beware overflow for huge values
      let acc = 0n;
      for (let i = 0; i < SIZE; i++) {
        const x = this.get(i);
        acc += x * x;
      }
      return Math.sqrt(Number(acc));
    }

    toNested(): unknown {
      return toNested<bigint>(this, SHAPE);
    }

    static fromValues<C extends SizedArray<bigint>>(
      this: new (...values: (bigint | number)[]) => C,
      values: ArrayLike<bigint | number | string> | Iterable<bigint | number | string> | Nested<bigint | number | string>
    ): C {
      const total = SIZE;
      const looksNested = (val: unknown): boolean => {
        if (!isIterable(val) || typeof val === "string") return false;
        const iterator = val[Symbol.iterator]();
        const first = iterator.next();
        return !first.done && isIterable(first.value);
      };

      let flat: (bigint | number | string)[];
      if (Array.isArray(values)) {
        const first = (values as unknown[])[0];
        const firstLooksNested = first !== undefined && typeof first !== "string" && isIterable(first);
        if (firstLooksNested) {
          flat = flattenToShape(values as Nested<bigint | number | string>, SHAPE, 0n);
        } else {
          flat = (values as ReadonlyArray<bigint | number | string>).slice(0, total);
          if (flat.length < total) {
            flat.push(...Array.from({ length: total - flat.length }, () => 0n));
          }
        }
      } else if (looksNested(values)) {
        flat = flattenToShape(values as Nested<bigint | number | string>, SHAPE, 0n);
      } else {
        flat = Array.from(values as Iterable<bigint | number | string>);
        if (flat.length < total) {
          flat.push(...Array.from({ length: total - flat.length }, () => 0n));
        } else if (flat.length > total) {
          flat.length = total;
        }
      }
      const coerced = flat.map((v) => toBigInt(v));
      return new this(...(coerced as unknown as (bigint | number)[]));
    }

    static from<C extends SizedArray<bigint>>(this: new (size: number, init?: bigint | Iterable<bigint> | ((i: number) => bigint)) => C, values: ArrayLike<bigint> | Iterable<bigint>): C {
      const arr = Array.isArray(values) ? Array.from(values) : Array.from(values as Iterable<bigint>);
      return new this(arr.length, arr);
    }
  }

  return setClassName(
    BigIntMatrix as unknown as {
      new (...values: (bigint | number)[]): unknown;
    },
    name
  ) as unknown as BigIntMatrixClass;
}

export const GenericMatrix2x2 = createGenericMatrixClass("GenericMatrix2x2", [2, 2]);
export const GenericMatrix2x3 = createGenericMatrixClass("GenericMatrix2x3", [2, 3]);
export const GenericMatrix3x2 = createGenericMatrixClass("GenericMatrix3x2", [3, 2]);
export const GenericMatrix3x3 = createGenericMatrixClass("GenericMatrix3x3", [3, 3]);
export const GenericMatrix4x4 = createGenericMatrixClass("GenericMatrix4x4", [4, 4]);
export const GenericMatrix2x2x2 = createGenericMatrixClass("GenericMatrix2x2x2", [2, 2, 2]);
export const GenericMatrix2x3x2 = createGenericMatrixClass("GenericMatrix2x3x2", [2, 3, 2]);
export const GenericMatrix3x2x2 = createGenericMatrixClass("GenericMatrix3x2x2", [3, 2, 2]);
export const GenericMatrix3x3x3 = createGenericMatrixClass("GenericMatrix3x3x3", [3, 3, 3]);
export const GenericMatrix4x4x4 = createGenericMatrixClass("GenericMatrix4x4x4", [4, 4, 4]);

export const Int8Matrix2x2 = createNumberMatrixClass("Int8Matrix2x2", Int8SizedArray, [2, 2]);
export const Int8Matrix2x3 = createNumberMatrixClass("Int8Matrix2x3", Int8SizedArray, [2, 3]);
export const Int8Matrix3x2 = createNumberMatrixClass("Int8Matrix3x2", Int8SizedArray, [3, 2]);
export const Int8Matrix3x3 = createNumberMatrixClass("Int8Matrix3x3", Int8SizedArray, [3, 3]);
export const Int8Matrix4x4 = createNumberMatrixClass("Int8Matrix4x4", Int8SizedArray, [4, 4]);
export const Int8Matrix2x2x2 = createNumberMatrixClass("Int8Matrix2x2x2", Int8SizedArray, [2, 2, 2]);
export const Int8Matrix2x3x2 = createNumberMatrixClass("Int8Matrix2x3x2", Int8SizedArray, [2, 3, 2]);
export const Int8Matrix3x2x2 = createNumberMatrixClass("Int8Matrix3x2x2", Int8SizedArray, [3, 2, 2]);
export const Int8Matrix3x3x3 = createNumberMatrixClass("Int8Matrix3x3x3", Int8SizedArray, [3, 3, 3]);
export const Int8Matrix4x4x4 = createNumberMatrixClass("Int8Matrix4x4x4", Int8SizedArray, [4, 4, 4]);

export const Uint8Matrix2x2 = createNumberMatrixClass("Uint8Matrix2x2", Uint8SizedArray, [2, 2]);
export const Uint8Matrix2x3 = createNumberMatrixClass("Uint8Matrix2x3", Uint8SizedArray, [2, 3]);
export const Uint8Matrix3x2 = createNumberMatrixClass("Uint8Matrix3x2", Uint8SizedArray, [3, 2]);
export const Uint8Matrix3x3 = createNumberMatrixClass("Uint8Matrix3x3", Uint8SizedArray, [3, 3]);
export const Uint8Matrix4x4 = createNumberMatrixClass("Uint8Matrix4x4", Uint8SizedArray, [4, 4]);
export const Uint8Matrix2x2x2 = createNumberMatrixClass("Uint8Matrix2x2x2", Uint8SizedArray, [2, 2, 2]);
export const Uint8Matrix2x3x2 = createNumberMatrixClass("Uint8Matrix2x3x2", Uint8SizedArray, [2, 3, 2]);
export const Uint8Matrix3x2x2 = createNumberMatrixClass("Uint8Matrix3x2x2", Uint8SizedArray, [3, 2, 2]);
export const Uint8Matrix3x3x3 = createNumberMatrixClass("Uint8Matrix3x3x3", Uint8SizedArray, [3, 3, 3]);
export const Uint8Matrix4x4x4 = createNumberMatrixClass("Uint8Matrix4x4x4", Uint8SizedArray, [4, 4, 4]);

export const Int16Matrix2x2 = createNumberMatrixClass("Int16Matrix2x2", Int16SizedArray, [2, 2]);
export const Int16Matrix2x3 = createNumberMatrixClass("Int16Matrix2x3", Int16SizedArray, [2, 3]);
export const Int16Matrix3x2 = createNumberMatrixClass("Int16Matrix3x2", Int16SizedArray, [3, 2]);
export const Int16Matrix3x3 = createNumberMatrixClass("Int16Matrix3x3", Int16SizedArray, [3, 3]);
export const Int16Matrix4x4 = createNumberMatrixClass("Int16Matrix4x4", Int16SizedArray, [4, 4]);
export const Int16Matrix2x2x2 = createNumberMatrixClass("Int16Matrix2x2x2", Int16SizedArray, [2, 2, 2]);
export const Int16Matrix2x3x2 = createNumberMatrixClass("Int16Matrix2x3x2", Int16SizedArray, [2, 3, 2]);
export const Int16Matrix3x2x2 = createNumberMatrixClass("Int16Matrix3x2x2", Int16SizedArray, [3, 2, 2]);
export const Int16Matrix3x3x3 = createNumberMatrixClass("Int16Matrix3x3x3", Int16SizedArray, [3, 3, 3]);
export const Int16Matrix4x4x4 = createNumberMatrixClass("Int16Matrix4x4x4", Int16SizedArray, [4, 4, 4]);

export const Int32Matrix2x2 = createNumberMatrixClass("Int32Matrix2x2", Int32SizedArray, [2, 2]);
export const Int32Matrix2x3 = createNumberMatrixClass("Int32Matrix2x3", Int32SizedArray, [2, 3]);
export const Int32Matrix3x2 = createNumberMatrixClass("Int32Matrix3x2", Int32SizedArray, [3, 2]);
export const Int32Matrix3x3 = createNumberMatrixClass("Int32Matrix3x3", Int32SizedArray, [3, 3]);
export const Int32Matrix4x4 = createNumberMatrixClass("Int32Matrix4x4", Int32SizedArray, [4, 4]);
export const Int32Matrix2x2x2 = createNumberMatrixClass("Int32Matrix2x2x2", Int32SizedArray, [2, 2, 2]);
export const Int32Matrix2x3x2 = createNumberMatrixClass("Int32Matrix2x3x2", Int32SizedArray, [2, 3, 2]);
export const Int32Matrix3x2x2 = createNumberMatrixClass("Int32Matrix3x2x2", Int32SizedArray, [3, 2, 2]);
export const Int32Matrix3x3x3 = createNumberMatrixClass("Int32Matrix3x3x3", Int32SizedArray, [3, 3, 3]);
export const Int32Matrix4x4x4 = createNumberMatrixClass("Int32Matrix4x4x4", Int32SizedArray, [4, 4, 4]);

export const Float32Matrix2x2 = createNumberMatrixClass("Float32Matrix2x2", Float32SizedArray, [2, 2]);
export const Float32Matrix2x3 = createNumberMatrixClass("Float32Matrix2x3", Float32SizedArray, [2, 3]);
export const Float32Matrix3x2 = createNumberMatrixClass("Float32Matrix3x2", Float32SizedArray, [3, 2]);
export const Float32Matrix3x3 = createNumberMatrixClass("Float32Matrix3x3", Float32SizedArray, [3, 3]);
export const Float32Matrix4x4 = createNumberMatrixClass("Float32Matrix4x4", Float32SizedArray, [4, 4]);
export const Float32Matrix2x2x2 = createNumberMatrixClass("Float32Matrix2x2x2", Float32SizedArray, [2, 2, 2]);
export const Float32Matrix2x3x2 = createNumberMatrixClass("Float32Matrix2x3x2", Float32SizedArray, [2, 3, 2]);
export const Float32Matrix3x2x2 = createNumberMatrixClass("Float32Matrix3x2x2", Float32SizedArray, [3, 2, 2]);
export const Float32Matrix3x3x3 = createNumberMatrixClass("Float32Matrix3x3x3", Float32SizedArray, [3, 3, 3]);
export const Float32Matrix4x4x4 = createNumberMatrixClass("Float32Matrix4x4x4", Float32SizedArray, [4, 4, 4]);

export const Float64Matrix2x2 = createNumberMatrixClass("Float64Matrix2x2", Float64SizedArray, [2, 2]);
export const Float64Matrix2x3 = createNumberMatrixClass("Float64Matrix2x3", Float64SizedArray, [2, 3]);
export const Float64Matrix3x2 = createNumberMatrixClass("Float64Matrix3x2", Float64SizedArray, [3, 2]);
export const Float64Matrix3x3 = createNumberMatrixClass("Float64Matrix3x3", Float64SizedArray, [3, 3]);
export const Float64Matrix4x4 = createNumberMatrixClass("Float64Matrix4x4", Float64SizedArray, [4, 4]);
export const Float64Matrix2x2x2 = createNumberMatrixClass("Float64Matrix2x2x2", Float64SizedArray, [2, 2, 2]);
export const Float64Matrix2x3x2 = createNumberMatrixClass("Float64Matrix2x3x2", Float64SizedArray, [2, 3, 2]);
export const Float64Matrix3x2x2 = createNumberMatrixClass("Float64Matrix3x2x2", Float64SizedArray, [3, 2, 2]);
export const Float64Matrix3x3x3 = createNumberMatrixClass("Float64Matrix3x3x3", Float64SizedArray, [3, 3, 3]);
export const Float64Matrix4x4x4 = createNumberMatrixClass("Float64Matrix4x4x4", Float64SizedArray, [4, 4, 4]);

export const BigInt64Matrix2x2 = createBigIntMatrixClass("BigInt64Matrix2x2", BigInt64SizedArray, [2, 2]);
export const BigInt64Matrix2x3 = createBigIntMatrixClass("BigInt64Matrix2x3", BigInt64SizedArray, [2, 3]);
export const BigInt64Matrix3x2 = createBigIntMatrixClass("BigInt64Matrix3x2", BigInt64SizedArray, [3, 2]);
export const BigInt64Matrix3x3 = createBigIntMatrixClass("BigInt64Matrix3x3", BigInt64SizedArray, [3, 3]);
export const BigInt64Matrix4x4 = createBigIntMatrixClass("BigInt64Matrix4x4", BigInt64SizedArray, [4, 4]);
export const BigInt64Matrix2x2x2 = createBigIntMatrixClass("BigInt64Matrix2x2x2", BigInt64SizedArray, [2, 2, 2]);
export const BigInt64Matrix2x3x2 = createBigIntMatrixClass("BigInt64Matrix2x3x2", BigInt64SizedArray, [2, 3, 2]);
export const BigInt64Matrix3x2x2 = createBigIntMatrixClass("BigInt64Matrix3x2x2", BigInt64SizedArray, [3, 2, 2]);
export const BigInt64Matrix3x3x3 = createBigIntMatrixClass("BigInt64Matrix3x3x3", BigInt64SizedArray, [3, 3, 3]);
export const BigInt64Matrix4x4x4 = createBigIntMatrixClass("BigInt64Matrix4x4x4", BigInt64SizedArray, [4, 4, 4]);

export const BigUint64Matrix2x2 = createBigIntMatrixClass("BigUint64Matrix2x2", BigUint64SizedArray, [2, 2]);
export const BigUint64Matrix2x3 = createBigIntMatrixClass("BigUint64Matrix2x3", BigUint64SizedArray, [2, 3]);
export const BigUint64Matrix3x2 = createBigIntMatrixClass("BigUint64Matrix3x2", BigUint64SizedArray, [3, 2]);
export const BigUint64Matrix3x3 = createBigIntMatrixClass("BigUint64Matrix3x3", BigUint64SizedArray, [3, 3]);
export const BigUint64Matrix4x4 = createBigIntMatrixClass("BigUint64Matrix4x4", BigUint64SizedArray, [4, 4]);
export const BigUint64Matrix2x2x2 = createBigIntMatrixClass("BigUint64Matrix2x2x2", BigUint64SizedArray, [2, 2, 2]);
export const BigUint64Matrix2x3x2 = createBigIntMatrixClass("BigUint64Matrix2x3x2", BigUint64SizedArray, [2, 3, 2]);
export const BigUint64Matrix3x2x2 = createBigIntMatrixClass("BigUint64Matrix3x2x2", BigUint64SizedArray, [3, 2, 2]);
export const BigUint64Matrix3x3x3 = createBigIntMatrixClass("BigUint64Matrix3x3x3", BigUint64SizedArray, [3, 3, 3]);
export const BigUint64Matrix4x4x4 = createBigIntMatrixClass("BigUint64Matrix4x4x4", BigUint64SizedArray, [4, 4, 4]);
