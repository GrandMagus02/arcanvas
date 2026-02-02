/**
 * Bezier curve flattening utilities.
 *
 * Converts quadratic and cubic bezier curves to line segments
 * for polygon triangulation.
 */
export class BezierUtils {
  /**
   * Flatten a quadratic bezier curve to line segments.
   *
   * @param x0 - Start point X
   * @param y0 - Start point Y
   * @param x1 - Control point X
   * @param y1 - Control point Y
   * @param x2 - End point X
   * @param y2 - End point Y
   * @param tolerance - Maximum deviation from curve
   * @param points - Output array for flattened points [x, y, x, y, ...]
   */
  static flattenQuadraticBezierRaw(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, tolerance: number, points: number[]): void {
    const dx = x2 - x0;
    const dy = y2 - y0;
    let d = 0;

    if (dx !== 0 || dy !== 0) {
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

    BezierUtils.flattenQuadraticBezierRaw(x0, y0, x01, y01, x012, y012, tolerance, points);
    BezierUtils.flattenQuadraticBezierRaw(x012, y012, x12, y12, x2, y2, tolerance, points);
  }

  /**
   * Flatten a cubic bezier curve to line segments.
   *
   * @param x0 - Start point X
   * @param y0 - Start point Y
   * @param x1 - Control point 1 X
   * @param y1 - Control point 1 Y
   * @param x2 - Control point 2 X
   * @param y2 - Control point 2 Y
   * @param x3 - End point X
   * @param y3 - End point Y
   * @param tolerance - Maximum deviation from curve
   * @param points - Output array for flattened points [x, y, x, y, ...]
   */
  static flattenCubicBezierRaw(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, tolerance: number, points: number[]): void {
    const dx = x3 - x0;
    const dy = y3 - y0;
    let d1 = 0;
    let d2 = 0;

    if (dx !== 0 || dy !== 0) {
      const len = Math.sqrt(dx * dx + dy * dy);
      d1 = Math.abs((x3 - x0) * (y0 - y1) - (x0 - x1) * (y3 - y0)) / len;
      d2 = Math.abs((x3 - x0) * (y0 - y2) - (x0 - x2) * (y3 - y0)) / len;
    }

    if (d1 < tolerance && d2 < tolerance) {
      points.push(x3, y3);
      return;
    }

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

    BezierUtils.flattenCubicBezierRaw(x0, y0, x01, y01, x012, y012, x0123, y0123, tolerance, points);
    BezierUtils.flattenCubicBezierRaw(x0123, y0123, x123, y123, x23, y23, x3, y3, tolerance, points);
  }
}
