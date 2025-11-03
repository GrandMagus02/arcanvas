import { ColorBase } from "./ColorBase";

/**
 * A color class
 */
export abstract class ColorAlphaBase<TArray extends ArrayLike<number>> extends ColorBase<TArray> {
  private _alpha: number = 1;

  protected constructor(values: TArray, alpha: number = 1) {
    super(values);
    this._alpha = alpha;
  }

  get alpha(): number {
    return this._alpha;
  }

  set alpha(alpha: number) {
    this._alpha = alpha;
  }

  override toArray(): number[] {
    return [...super.toArray(), this._alpha];
  }

  override equals(other: this): boolean {
    return super.equals(other) && this._alpha === other._alpha;
  }
}
