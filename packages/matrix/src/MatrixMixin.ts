/* eslint-disable @typescript-eslint/no-explicit-any */
type Constructor<T> = new (...args: any[]) => T;

/**
 * MatrixMixin adds common matrix operations to a flat numeric ArrayLike host
 * (e.g., Float64Array). Storage is row-major in a 1D buffer.
 * If rows/cols are provided, enforces rows*cols element count, slicing extras
 * and throwing when fewer.
 */
export function MatrixMixin<TBase extends Constructor<any>>(
  Base: TBase,
  rows?: number,
  cols?: number
) {
  const hasShape = typeof rows === "number" && typeof cols === "number";
  const required = hasShape ? rows * cols : undefined;

  return class Matrix extends Base {
    static from(input: ArrayLike<number> | Iterable<number>) {
      let values = Array.from(input as ArrayLike<number>);
      if (required !== undefined) {
        if (values.length < required) {
          throw new Error(
            `Matrix values length ${values.length} does not match required size ${required}`
          );
        }
        if (values.length > required) values = values.slice(0, required);
      }
      const Ctor = this as unknown as {
        new (arg: ArrayLike<number> | Iterable<number>): Matrix;
      };
      return new Ctor(values);
    }

    constructor(...args: any[]) {
      const input = args[0] as ArrayLike<number> | Iterable<number>;
      let values = Array.from(input as ArrayLike<number>);
      if (required !== undefined) {
        if (values.length < required) {
          throw new Error(
            `Matrix values length ${values.length} does not match required size ${required}`
          );
        }
        if (values.length > required) values = values.slice(0, required);
      }
      super(values as unknown as ArrayLike<number>);
    }

    toArray(): number[] {
      return Array.from(this as unknown as ArrayLike<number>);
    }

    to2DArray(): number[][] {
      if (!hasShape) return [this.toArray()];
      const out: number[][] = [];
      const r = rows;
      const c = cols;
      const flat = this.toArray();
      for (let i = 0; i < r; i++) {
        out.push(flat.slice(i * c, i * c + c));
      }
      return out;
    }

    get numRows(): number {
      if (hasShape) return rows;
      // Infer as 1 row if unspecified
      return 1;
    }

    get numCols(): number {
      if (hasShape) return cols;
      return this.toArray().length;
    }

    at(row: number, col: number): number {
      const c = hasShape ? cols : this.numCols;
      const idx = row * c + col;
      return (this as unknown as { [k: number]: number | undefined })[idx]!;
    }

    set(row: number, col: number, value: number): void {
      const c = hasShape ? cols : this.numCols;
      const idx = row * c + col;
      (this as unknown as { [k: number]: number })[idx] = value;
    }

    equals(other: this): boolean {
      const a = this.toArray();
      const b = other.toArray();
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
      return true;
    }

    add(other: this): this {
      const a = this.toArray();
      const b = other.toArray();
      return this._createLike(a.map((v, i) => v + b[i]!));
    }

    subtract(other: this): this {
      const a = this.toArray();
      const b = other.toArray();
      return this._createLike(a.map((v, i) => v - b[i]!));
    }

    multiplyScalar(scalar: number): this {
      const a = this.toArray();
      return this._createLike(a.map((v) => v * scalar));
    }

    multiplyMatrix(other: this): this {
      const r1 = this.numRows;
      const c1 = this.numCols;
      const r2 = other.numRows;
      const c2 = other.numCols;
      if (c1 !== r2) throw new Error("Incompatible shapes for matrix multiplication");
      const out = new Array<number>(r1 * c2).fill(0);
      for (let i = 0; i < r1; i++) {
        for (let k = 0; k < c1; k++) {
          const aik = this.at(i, k);
          for (let j = 0; j < c2; j++) {
            const idx = i * c2 + j;
            out[idx] = (out[idx] ?? 0) + aik * other.at(k, j);
          }
        }
      }
      return this._createLike(out);
    }

    transpose(): this {
      const r = this.numRows;
      const c = this.numCols;
      const out = new Array<number>(r * c);
      for (let i = 0; i < r; i++) {
        for (let j = 0; j < c; j++) {
          out[j * r + i] = this.at(i, j);
        }
      }
      return this._createLike(out);
    }

    protected _createLike(values: number[]): this {
      if (required !== undefined) {
        if (values.length < required) {
          throw new Error(
            `Matrix values length ${values.length} does not match required size ${required}`
          );
        }
        if (values.length > required) values = values.slice(0, required);
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
  };
}
