/* eslint-disable @typescript-eslint/no-explicit-any */
type Constructor<T> = new (...args: any[]) => T;

/**
 * VectorMixin adds common vector operations to any numeric ArrayLike host
 * (e.g., Float32Array, Int8Array, or subclasses of typed arrays).
 *
 * Construction of new instances prefers a static fromArray(values) on the
 * concrete class if available; otherwise it calls the constructor with a
 * single array-like argument, which works for built-in typed arrays.
 */
export function VectorMixin<TBase extends Constructor<ArrayLike<number>>>(
  Base: TBase,
  size?: number
) {
  return class Vector extends Base {
    /**
     * Construct from an ArrayLike/Iterable of numbers. Enforces size (if provided).
     */
    static from(input: ArrayLike<number> | Iterable<number>) {
      let values = Array.from(input as ArrayLike<number>);
      if (size !== undefined) {
        if (values.length < size) {
          throw new Error(
            `Vector values length ${values.length} does not match required size ${size}`
          );
        }
        if (values.length > size) values = values.slice(0, size);
      }
      const Ctor = this as unknown as {
        new (arg: ArrayLike<number> | Iterable<number>): Vector;
      };
      return new Ctor(values);
    }

    constructor(...args: any[]) {
      // Accept array-like/iterable; slice extra values when size is fixed
      const input = args[0] as ArrayLike<number> | Iterable<number>;
      let values = Array.from(input as ArrayLike<number>);
      if (size !== undefined) {
        if (values.length < size) {
          throw new Error(
            `Vector values length ${values.length} does not match required size ${size}`
          );
        }
        if (values.length > size) values = values.slice(0, size);
      }
      super(values as unknown as ArrayLike<number>);
    }

    /** Convert to a plain number[] */
    toArray(): number[] {
      return Array.from(this as unknown as ArrayLike<number>);
    }

    /** String representation: Vector(1, 2, 3) */
    override toString(): string {
      return `${this.constructor.name}(${this.toArray().join(", ")})`;
    }

    /** Safe value accessor (same as direct index access) */
    at(index: number): number {
      return (this as unknown as { [k: number]: number | undefined })[index]!;
    }

    /** Element-wise equality */
    equals(other: this): boolean {
      const a = this.toArray();
      const b = other.toArray();
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
      return true;
    }

    /** Element-wise scalar multiply; returns a new instance of the same class */
    multiply(scalar: number): this {
      const a = this.toArray();
      return this._createLike(a.map((v) => v * scalar));
    }

    /** Element-wise add; returns a new instance of the same class */
    add(other: this): this {
      const a = this.toArray();
      const b = other.toArray();
      return this._createLike(a.map((v, i) => v + b[i]!));
    }

    /** Element-wise subtract; returns a new instance of the same class */
    subtract(other: this): this {
      const a = this.toArray();
      const b = other.toArray();
      return this._createLike(a.map((v, i) => v - b[i]!));
    }

    /** Dot product */
    dot(other: this): number {
      const a = this.toArray();
      const b = other.toArray();
      let sum = 0;
      for (let i = 0; i < a.length; i++) sum += a[i]! * b[i]!;
      return sum;
    }

    /** Euclidean norm as magnitude to avoid overriding native length semantics */
    get magnitude(): number {
      const a = this.toArray();
      let sum = 0;
      for (let i = 0; i < a.length; i++) sum += a[i]! * a[i]!;
      return Math.sqrt(sum);
    }

    /** Normalized vector; returns a new instance of the same class */
    normalize(): this {
      const len = this.magnitude;
      if (len === 0) return this._createLike(this.toArray());
      return this.multiply(1 / len);
    }

    /** Distance to another vector */
    distance(other: this): number {
      const a = this.toArray();
      const b = other.toArray();
      let sum = 0;
      for (let i = 0; i < a.length; i++) {
        const d = a[i]! - b[i]!;
        sum += d * d;
      }
      return Math.sqrt(sum);
    }

    /**
     * Create a new instance of the same runtime class with provided values.
     * Prefers a static fromArray if present; otherwise uses the constructor
     * with a single array-like argument (works for built-in typed arrays).
     */
    protected _createLike(values: number[]): this {
      if (size !== undefined) {
        if (values.length < size) {
          throw new Error(
            `Vector values length ${values.length} does not match required size ${size}`
          );
        }
        if (values.length > size) values = values.slice(0, size);
      }
      const Ctor = this.constructor as unknown as {
        new (arg: ArrayLike<number> | Iterable<number>): any;
        from?: (values: number[]) => any;
      };
      if (typeof Ctor.from === "function") {
        return Ctor.from(values) as this;
      }
      return new Ctor(values) as this;
    }

    /** Utility: determine element count for typed arrays vs arrays */
    private static getElementCount(obj: unknown): number {
      const anyObj = obj as { byteLength?: number; constructor?: { BYTES_PER_ELEMENT?: number } };
      if (
        typeof anyObj.byteLength === "number" &&
        anyObj.constructor &&
        typeof anyObj.constructor.BYTES_PER_ELEMENT === "number"
      ) {
        const bpe = anyObj.constructor.BYTES_PER_ELEMENT;
        return Math.floor(anyObj.byteLength / bpe);
      }
      return Array.from(obj as ArrayLike<number>).length;
    }
  };
}
