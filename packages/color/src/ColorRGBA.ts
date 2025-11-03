import { ColorAlphaBase } from "./ColorAlphaBase";

/**
 * A color class
 */
export class ColorRGBA extends ColorAlphaBase<number[]> {
  constructor(r: number, g: number, b: number, a: number);
  constructor(input: string);
  constructor(input: number | string, g?: number, b?: number, a?: number) {
    if (typeof input === "string") {
      const color = ColorRGBA.parse(input);
      super(color.values, color.alpha);
      return;
    }
    if (typeof input === "number" && typeof g === "number" && typeof b === "number" && typeof a === "number") {
      const r = input;
      super([r, g, b], a);
      return;
    }
    if (typeof input === "number") {
      const color = ColorRGBA.fromNumber(input);
      super(color.values, color.alpha);
      return;
    }
    throw new Error("Invalid color input");
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

  static fromArray(array: number[]): ColorRGBA {
    if (array.length < 4 || array[0] === undefined || array[1] === undefined || array[2] === undefined || array[3] === undefined) {
      throw new Error("ColorRGBA must have at least 4 elements");
    }
    return new ColorRGBA(array[0], array[1], array[2], array[3]);
  }

  static parse(input: string): ColorRGBA {
    const result = ColorRGBA.tryParse(input);
    if (result) return result;
    throw new Error(`Invalid color string: ${input}`);
  }

  static tryParse(input: string): ColorRGBA | undefined {
    const str = input.trim().toLowerCase();
    if (str.startsWith("#")) return ColorRGBA.tryParseHEX(str);
    return ColorRGBA.tryParseCSS(str);
  }

  static parseHEX(input: string): ColorRGBA {
    const result = ColorRGBA.tryParseHEX(input);
    if (result) return result;
    throw new Error(`Invalid hex color: ${input}`);
  }

  static parseCSS(input: string): ColorRGBA {
    const result = ColorRGBA.tryParseCSS(input);
    if (result) return result;
    throw new Error(`Invalid css color: ${input}`);
  }

  static tryParseHEX(input: string): ColorRGBA | undefined {
    const clampByte = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
    const clampAlpha = (n: number) => Math.max(0, Math.min(1, n));
    const roundAlpha = (n: number) => Math.round(n * 10000) / 10000;
    const str = input.trim().toLowerCase();
    if (!str.startsWith("#")) return undefined;
    const hex = str.slice(1);
    if (hex.length === 3) {
      const r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
      const g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
      const b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
      if ([r, g, b].some((n) => Number.isNaN(n))) return undefined;
      return new ColorRGBA(clampByte(r), clampByte(g), clampByte(b), 1);
    }
    if (hex.length === 4) {
      const r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
      const g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
      const b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
      const a = parseInt(hex.charAt(3) + hex.charAt(3), 16) / 255;
      if ([r, g, b, a].some((n) => Number.isNaN(n))) return undefined;
      return new ColorRGBA(clampByte(r), clampByte(g), clampByte(b), roundAlpha(clampAlpha(a)));
    }
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      if ([r, g, b].some((n) => Number.isNaN(n))) return undefined;
      return new ColorRGBA(clampByte(r), clampByte(g), clampByte(b), 1);
    }
    if (hex.length === 8) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      const a = parseInt(hex.slice(6, 8), 16) / 255;
      if ([r, g, b, a].some((n) => Number.isNaN(n))) return undefined;
      return new ColorRGBA(clampByte(r), clampByte(g), clampByte(b), roundAlpha(clampAlpha(a)));
    }
    return undefined;
  }

  static tryParseCSS(input: string): ColorRGBA | undefined {
    const clampByte = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
    const clampAlpha = (n: number) => Math.max(0, Math.min(1, n));
    const roundAlpha = (n: number) => Math.round(n * 10000) / 10000;
    const str = input.trim().toLowerCase();
    const rgbLike = /^rgba?\(([^)]+)\)$/i.exec(str);
    if (!rgbLike) return undefined;
    const group = rgbLike[1];
    if (group === null || group === undefined) return undefined;
    const parts = group.split(/\s*,\s*/);
    const isRGBA = str.startsWith("rgba(");
    const isRGB = !isRGBA && str.startsWith("rgb(");
    if (isRGBA && parts.length !== 4) return undefined;
    if (isRGB && parts.length !== 3) return undefined;
    const [sr, sg, sb] = parts as [string, string, string];
    const r = parseFloat(sr);
    const g = parseFloat(sg);
    const b = parseFloat(sb);
    if ([r, g, b].some((n) => Number.isNaN(n))) return undefined;
    let a = 1;
    if (parts.length === 4) {
      a = parseFloat(parts[3]!);
      if (Number.isNaN(a)) return undefined;
    }
    return new ColorRGBA(clampByte(r), clampByte(g), clampByte(b), roundAlpha(clampAlpha(a)));
  }

  static fromNumber(n: number): ColorRGBA {
    if (typeof n !== "number" || !Number.isFinite(n)) {
      throw new Error("Invalid packed numeric color");
    }
    const value = Math.max(0, Math.min(0xffffffff, Math.round(n)));
    const hasAlpha = value > 0xffffff;
    const r = (value >> 24) & 0xff;
    const g = (value >> 16) & 0xff;
    const b = (value >> 8) & 0xff;
    const aByte = value & 0xff;
    if (hasAlpha) {
      const a = Math.round((aByte / 255) * 10000) / 10000;
      return new ColorRGBA(r, g, b, a);
    }
    // treat as 0xRRGGBB when <= 0xFFFFFF
    const rr = (value >> 16) & 0xff;
    const gg = (value >> 8) & 0xff;
    const bb = value & 0xff;
    return new ColorRGBA(rr, gg, bb, 1);
  }

  protected newInstance(values: number[]): this {
    return ColorRGBA.fromArray(values) as unknown as this;
  }

  toCSSString(): string {
    return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.alpha})`;
  }

  toHEXString(): string {
    return `#${this.r.toString(16).padStart(2, "0")}${this.g.toString(16).padStart(2, "0")}${this.b.toString(16).padStart(2, "0")}${this.alpha.toString(16).padStart(2, "0")}`;
  }
}
