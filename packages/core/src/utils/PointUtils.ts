/**
 * Type for point arrays. Can be a flat array [x0, y0, x1, y1, ...] or array of arrays [[x0, y0], [x1, y1], ...].
 * If a flat array has odd length, the last value is treated as X and Y defaults to 0.
 */
export type PointsArray = number[] | number[][];

/**
 * Utility class for working with point arrays.
 */
export class PointUtils {
  /**
   * Parse points from either a flat array [x0, y0, x1, y1, ...] or array of arrays [[x0, y0], [x1, y1], ...].
   * If a flat array has odd length, the last value is treated as X and Y defaults to 0.
   * @param points - Array of points in either format.
   * @returns Array of parsed points with x and y properties.
   */
  static points2DFromArray(points: PointsArray): { x: number; y: number }[] {
    const parsedPoints: { x: number; y: number }[] = [];

    if (points.length === 0) {
      return parsedPoints;
    }

    if (Array.isArray(points[0])) {
      // Handle number[][]
      for (const p of points as number[][]) {
        if (p.length >= 2 && typeof p[0] === "number" && typeof p[1] === "number") {
          parsedPoints.push({ x: p[0], y: p[1] });
        } else if (p.length === 1 && typeof p[0] === "number") {
          // Single value, treat as X with Y=0
          parsedPoints.push({ x: p[0], y: 0 });
        }
      }
    } else {
      // Handle number[]
      const flat = points as number[];
      // Process pairs, and if odd length, handle the last value with Y=0
      for (let i = 0; i < flat.length; i += 2) {
        const x = flat[i];
        if (typeof x === "number") {
          if (i + 1 < flat.length) {
            // We have a pair
            const y = flat[i + 1];
            if (typeof y === "number") {
              parsedPoints.push({ x, y });
            }
          } else {
            // Odd length - last value, Y defaults to 0
            parsedPoints.push({ x, y: 0 });
          }
        }
      }
    }

    return parsedPoints;
  }

  /**
   * Convert points to a flat Float32Array of 2D coordinates [x0, y0, x1, y1, ...].
   * @param points - Array of points in either format.
   * @returns Float32Array with 2D coordinates.
   */
  static toFlat2D(points: PointsArray | number[]): Float32Array {
    const parsedPoints = PointUtils.points2DFromArray(points);
    const flat = new Float32Array(parsedPoints.length * 2);
    for (let i = 0; i < parsedPoints.length; i++) {
      const p = parsedPoints[i];
      if (p) {
        flat[i * 2] = p.x;
        flat[i * 2 + 1] = p.y;
      }
    }
    return flat;
  }

  /**
   * Convert points to a flat Float32Array of 3D coordinates [x0, y0, z0, x1, y1, z1, ...].
   * @param points - Array of points in either format.
   * @param zDefault - The Z coordinate to use for all points (default: 0).
   * @returns Float32Array with 3D coordinates.
   */
  static toFlat3D(points: PointsArray | number[], zDefault: number = 0): Float32Array {
    // If input is already 3D (length divisible by 3), use it directly
    if (points.length > 0 && typeof points[0] === "number") {
      const flat = points as number[];
      if (flat.length % 3 === 0) {
        return new Float32Array(flat);
      }
    }

    // Otherwise, parse as 2D and add Z coordinate
    const parsedPoints = PointUtils.points2DFromArray(points);
    const flat = new Float32Array(parsedPoints.length * 3);
    for (let i = 0; i < parsedPoints.length; i++) {
      const p = parsedPoints[i];
      if (p) {
        flat[i * 3] = p.x;
        flat[i * 3 + 1] = p.y;
        flat[i * 3 + 2] = zDefault;
      }
    }
    return flat;
  }
}
