/**
 * A color class
 */
export abstract class ColorBase<TArray extends ArrayLike<number>> {
  protected _values: TArray;

  protected constructor(values: TArray) {
    this._values = values;
  }

  protected abstract newInstance(values: number[]): this;

  toArray(): number[] {
    return Array.from(this._values as unknown as number[]);
  }

  toString(): string {
    return `Color(${this.toArray().join(", ")})`;
  }

  equals(other: this): boolean {
    const a = this.toArray();
    const b = other.toArray();
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }
}
