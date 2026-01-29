import { Vector2 } from "@arcanvas/math";

export class BezierUtils {
  static flattenQuadraticBezier(p0: Vector2, p1: Vector2, p2: Vector2, tolerance: number = 0.5, points: number[] = []): void {
    // Check if the curve is flat enough
    // Distance from control point p1 to line segment p0-p2

    // Vector p0 -> p2
    const dx = p2.x - p0.x;
    const dy = p2.y - p0.y;

    // Distance calculation
    // area = |x1(y2 - y3) + x2(y3 - y1) + x3(y1 - y2)| / 2
    // height = 2 * area / base

    // Simplified: check if p1 is close to midpoint of p0p2 is not enough,
    // strictly we need distance to line.

    const d = Math.abs((p2.x - p0.x) * (p0.y - p1.y) - (p0.x - p1.x) * (p2.y - p0.y)) / Math.sqrt(dx * dx + dy * dy);

    if (d < tolerance || (dx === 0 && dy === 0)) {
      points.push(p2.x, p2.y);
      return;
    }

    // Subdivide
    const p01x = (p0.x + p1.x) * 0.5;
    const p01y = (p0.y + p1.y) * 0.5;
    const p12x = (p1.x + p2.x) * 0.5;
    const p12y = (p1.y + p2.y) * 0.5;
    const p012x = (p01x + p12x) * 0.5;
    const p012y = (p01y + p12y) * 0.5;

    // We don't allocate new Vector2s to avoid GC pressure in recursion if possible,
    // but Vector2 is efficient.
    // Ideally we'd pass raw numbers but for now using Vector2.of is clean.
    // Actually, creating Vector2 objects in tight loop is bad.
    // Let's refactor to use raw numbers in recursion.

    this.flattenQuadraticBezierRaw(p0.x, p0.y, p1.x, p1.y, p2.x, p2.y, tolerance, points);
  }

  static flattenQuadraticBezierRaw(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, tolerance: number, points: number[]): void {
    // Distance from control point to line segment
    const dx = x2 - x0;
    const dy = y2 - y0;

    let d = 0;
    if (dx === 0 && dy === 0) {
      d = 0;
    } else {
      d = Math.abs((x2 - x0) * (y0 - y1) - (x0 - x1) * (y2 - y0)) / Math.sqrt(dx * dx + dy * dy);
    }

    if (d < tolerance) {
      points.push(x2, y2);
      return;
    }

    const x01 = (x0 + x1) * 0.5;
    const y01 = (y0 + y1) * 0.5;
    const x12 = (x1 + x2) * 0.5;
    const y12 = (y1 + y2) * 0.5;
    const x012 = (x01 + x12) * 0.5;
    const y012 = (y01 + y12) * 0.5;

    this.flattenQuadraticBezierRaw(x0, y0, x01, y01, x012, y012, tolerance, points);
    this.flattenQuadraticBezierRaw(x012, y012, x12, y12, x2, y2, tolerance, points);
  }

  static flattenCubicBezier(p0: Vector2, p1: Vector2, p2: Vector2, p3: Vector2, tolerance: number = 0.5, points: number[] = []): void {
    this.flattenCubicBezierRaw(p0.x, p0.y, p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, tolerance, points);
  }

  static flattenCubicBezierRaw(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, tolerance: number, points: number[]): void {
    // Check flatness.
    // Measure distance of p1 and p2 from line p0-p3.
    // If both are within tolerance, we stop.

    const dx = x3 - x0;
    const dy = y3 - y0;
    let d1 = 0;
    let d2 = 0;

    if (dx === 0 && dy === 0) {
      d1 = 0;
      d2 = 0;
    } else {
      const len = Math.sqrt(dx * dx + dy * dy);
      d1 = Math.abs((x3 - x0) * (y0 - y1) - (x0 - x1) * (y3 - y0)) / len;
      d2 = Math.abs((x3 - x0) * (y0 - y2) - (x0 - x2) * (y3 - y0)) / len;
    }

    if (d1 < tolerance && d2 < tolerance) {
      points.push(x3, y3);
      return;
    }

    // Subdivide
    const x01 = (x0 + x1) * 0.5;
    const y01 = (y0 + y1) * 0.5;
    const x12 = (x1 + x2) * 0.5;
    const y12 = (y1 + y2) * 0.5;
    const x23 = (x2 + x3) * 0.5;
    const y23 = (y2 + y3) * 0.5;

    const x012 = (x01 + x12) * 0.5;
    const y012 = (y01 + y12) * 0.5;
    const x123 = (x12 + x23) * 0.5;
    const y123 = (y12 + y23) * 0.5;

    const x0123 = (x012 + x123) * 0.5;
    const y0123 = (y012 + y123) * 0.5;

    this.flattenCubicBezierRaw(x0, y0, x01, y01, x012, y012, x0123, y0123, tolerance, points);
    this.flattenCubicBezierRaw(x0123, y0123, x123, y123, x23, y23, x3, y3, tolerance, points);
  }
}
