import { describe, expect, it } from "bun:test";
import { ColorRGB, ColorRGBA } from "../index";

describe("ColorRGB", () => {
  it("constructs from numeric components", () => {
    const c = new ColorRGB(10, 20, 30);
    expect(c.toArray()).toEqual([10, 20, 30]);
    expect(c.toString()).toBe("Color(10, 20, 30)");
  });

  it("constructs from hex short #rgb", () => {
    const c = new ColorRGB("#0af");
    expect(c.toArray()).toEqual([0, 170, 255]);
  });

  it("constructs from hex long #rrggbb", () => {
    const c = new ColorRGB("#00aaff");
    expect(c.toArray()).toEqual([0, 170, 255]);
  });

  it("constructs from rgba hex by ignoring alpha (#rgba and #rrggbbaa)", () => {
    expect(new ColorRGB("#0af8").toArray()).toEqual([0, 170, 255]);
    expect(new ColorRGB("#00aaff80").toArray()).toEqual([0, 170, 255]);
  });

  it("constructs from css rgb/rgba() strings (ignores alpha for RGB)", () => {
    expect(new ColorRGB("rgb(0,170,255)").toArray()).toEqual([0, 170, 255]);
    expect(new ColorRGB("rgba(0,170,255,0.2)").toArray()).toEqual([0, 170, 255]);
  });

  it("parses via static methods parse/parseHEX/parseCSS", () => {
    expect(ColorRGB.parse("#0af")).toEqual(new ColorRGB(0, 170, 255));
    expect(ColorRGB.parseHEX("#0af")).toEqual(new ColorRGB(0, 170, 255));
    expect(ColorRGB.parseCSS("rgb(0,170,255)")).toEqual(new ColorRGB(0, 170, 255));
  });

  it("fromArray works and errors on invalid input", () => {
    expect(ColorRGB.fromArray([1, 2, 3]).toArray()).toEqual([1, 2, 3]);
    expect(() => ColorRGB.fromArray([1, 2])).toThrow();
  });

  it("equals compares component-wise", () => {
    const a = ColorRGB.fromArray([1, 2, 3]);
    const b = new ColorRGB(1, 2, 3);
    const c = new ColorRGB(1, 2, 4);
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });

  it("clamps and rounds component values when parsing CSS", () => {
    // 300 -> 255, -20 -> 0, 260.6 -> 261 (rounded then clamped to 255)
    expect(ColorRGB.parseCSS("rgb(300, -20, 260.6)")).toEqual(new ColorRGB(255, 0, 255));
  });

  it("throws on invalid strings", () => {
    expect(() => ColorRGB.parse("not a color")).toThrow();
    expect(() => ColorRGB.parseCSS("rgb(10, 20)")).toThrow();
  });
});
describe("ColorRGBA", () => {
  it("constructs from numeric components including alpha", () => {
    const c = new ColorRGBA(10, 20, 30, 0.5);
    expect(c.toArray()).toEqual([10, 20, 30, 0.5]);
    expect(c.toString()).toBe("Color(10, 20, 30, 0.5)");
  });

  it("constructs from hex including short #rgba and long #rrggbbaa", () => {
    const s = new ColorRGBA("#0af8").toArray();
    expect(s[0]).toBe(0);
    expect(s[1]).toBe(170);
    expect(s[2]).toBe(255);
    expect(s[3]).toBeCloseTo(0.5333, 3);

    const l = new ColorRGBA("#00aaff80").toArray();
    expect(l[0]).toBe(0);
    expect(l[1]).toBe(170);
    expect(l[2]).toBe(255);
    expect(l[3]).toBeCloseTo(0.502, 3);
  });

  it("constructs from css rgba() and clamps/rounds", () => {
    const c = new ColorRGBA("rgba(0,170,255,0.5)").toArray();
    expect(c).toEqual([0, 170, 255, 0.5]);
    // alpha clamped
    const c2 = ColorRGBA.parseCSS("rgba(0,170,255, 1.5)");
    expect(c2.alpha).toBe(1);
  });

  it("parses via static methods parse/parseHEX/parseCSS", () => {
    expect(ColorRGBA.parse("#0af8")).toEqual(new ColorRGBA(0, 170, 255, 0.5333));
    expect(ColorRGBA.parseHEX("#0af8")).toEqual(new ColorRGBA(0, 170, 255, 0.5333));
    expect(ColorRGBA.parseCSS("rgba(0,170,255,0.5)")).toEqual(new ColorRGBA(0, 170, 255, 0.5));
  });

  it("equals compares component-wise including alpha", () => {
    const a = new ColorRGBA(1, 2, 3, 0.4);
    const b = ColorRGBA.fromArray([1, 2, 3, 0.4]);
    const c = new ColorRGBA(1, 2, 3, 0.5);
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });

  it("throws on invalid strings", () => {
    expect(() => ColorRGBA.parse("#zzzzzz")).toThrow();
    expect(() => ColorRGBA.parseCSS("rgba(1,2,3)")).toThrow();
  });
});
