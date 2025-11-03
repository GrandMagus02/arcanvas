import { ColorBase } from "./ColorBase";

/**
 * A color class
 */
export class ColorRGB extends ColorBase<number[]> {
  constructor(r: number, g: number, b: number);
  constructor(input: string | number);
  constructor(input: number | string, g?: number, b?: number) {
    if (typeof input === "string") {
      const color = ColorRGB.parse(input);
      super(color.values);
      return;
    }
    if (typeof input === "number" && typeof g === "number" && typeof b === "number") {
      const r = input;
      super([r, g, b]);
      return;
    }
    if (typeof input === "number") {
      const color = ColorRGB.fromNumber(input);
      super(color.values);
      return;
    }
  }

  get r(): number {
    return this._values[0]!;
  }
  get g(): number {
    return this._values[1]!;
  }
  get b(): number {
    return this._values[2]!;
  }

  get values() {
    return this._values;
  }

  static fromArray(array: number[]): ColorRGB {
    if (array.length < 3 || array[0] === undefined || array[1] === undefined || array[2] === undefined) {
      throw new Error("ColorRGB must have at least 3 elements");
    }
    return new ColorRGB(array[0], array[1], array[2]);
  }

  static parse(input: string): ColorRGB {
    const result = ColorRGB.tryParse(input);
    if (result) return result;
    throw new Error(`Invalid color string: ${input}`);
  }

  static tryParse(input: string): ColorRGB | undefined {
    const str = input.trim().toLowerCase();
    if (str.startsWith("#")) return ColorRGB.tryParseHEX(str);
    return ColorRGB.tryParseCSS(str);
  }

  static parseHEX(input: string): ColorRGB {
    const result = ColorRGB.tryParseHEX(input);
    if (result) return result;
    throw new Error(`Invalid hex color: ${input}`);
  }

  static parseCSS(input: string): ColorRGB {
    const result = ColorRGB.tryParseCSS(input);
    if (result) return result;
    throw new Error(`Invalid css color: ${input}`);
  }

  static tryParseHEX(input: string): ColorRGB | undefined {
    const clampByte = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
    const str = input.trim().toLowerCase();
    if (!str.startsWith("#")) return undefined;
    const hex = str.slice(1);
    if (hex.length === 3) {
      const r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
      const g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
      const b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
      if ([r, g, b].some((n) => Number.isNaN(n))) return undefined;
      return new ColorRGB(clampByte(r), clampByte(g), clampByte(b));
    }
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      if ([r, g, b].some((n) => Number.isNaN(n))) return undefined;
      return new ColorRGB(clampByte(r), clampByte(g), clampByte(b));
    }
    if (hex.length === 4) {
      const r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
      const g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
      const b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
      if ([r, g, b].some((n) => Number.isNaN(n))) return undefined;
      return new ColorRGB(clampByte(r), clampByte(g), clampByte(b));
    }
    if (hex.length === 8) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      if ([r, g, b].some((n) => Number.isNaN(n))) return undefined;
      return new ColorRGB(clampByte(r), clampByte(g), clampByte(b));
    }
    return undefined;
  }

  static tryParseCSS(input: string): ColorRGB | undefined {
    const clampByte = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
    const str = input.trim().toLowerCase();
    const rgbLike = /^rgba?\(([^)]+)\)$/i.exec(str);
    if (!rgbLike) return undefined;
    const group = rgbLike[1];
    if (group === null || group === undefined) return undefined;
    const parts = group.split(/\s*,\s*/).slice(0, 3);
    if (parts.length !== 3) return undefined;
    const [sr, sg, sb] = parts as [string, string, string];
    const r = parseFloat(sr);
    const g = parseFloat(sg);
    const b = parseFloat(sb);
    if ([r, g, b].some((n) => Number.isNaN(n))) return undefined;
    return new ColorRGB(clampByte(r), clampByte(g), clampByte(b));
  }

  static fromNumber(n: number): ColorRGB {
    if (typeof n !== "number" || !Number.isFinite(n)) {
      throw new Error("Invalid packed numeric color");
    }
    const value = Math.max(0, Math.min(0xffffff, Math.round(n)));
    const r = (value >> 16) & 0xff;
    const g = (value >> 8) & 0xff;
    const b = value & 0xff;
    return new ColorRGB(r, g, b);
  }

  protected newInstance(values: number[]): this {
    return ColorRGB.fromArray(values) as unknown as this;
  }

  toCSSString(): string {
    return `rgb(${this.r}, ${this.g}, ${this.b})`;
  }

  toHEXString(): string {
    return `#${this.r.toString(16).padStart(2, "0")}${this.g.toString(16).padStart(2, "0")}${this.b.toString(16).padStart(2, "0")}`;
  }
}
