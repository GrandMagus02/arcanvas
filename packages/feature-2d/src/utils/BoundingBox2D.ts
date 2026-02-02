import { Matrix4, Vector2 } from "@arcanvas/math";
import type { Transform3D } from "@arcanvas/scene";
import type { BoundingBox } from "@arcanvas/selection";
import type { Polygon2DObject } from "../meshes/polygon/Polygon2DObject";

/**
 * 2D bounding box implementation.
 * Represents an axis-aligned bounding box in 2D space.
 */
export class BoundingBox2D implements BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;

  constructor(minX: number, minY: number, maxX: number, maxY: number) {
    this.minX = minX;
    this.minY = minY;
    this.maxX = maxX;
    this.maxY = maxY;
  }

  /**
   * Creates a bounding box from an array of 2D points.
   */
  static fromPoints(points: Vector2[] | { x: number; y: number }[]): BoundingBox2D {
    if (points.length === 0) {
      return new BoundingBox2D(0, 0, 0, 0);
    }

    let minX = points[0]!.x;
    let minY = points[0]!.y;
    let maxX = points[0]!.x;
    let maxY = points[0]!.y;

    for (let i = 1; i < points.length; i++) {
      const p = points[i]!;
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    }

    return new BoundingBox2D(minX, minY, maxX, maxY);
  }

  /**
   * Creates a bounding box from a Polygon2DObject.
   * Extracts points from the polygon's mesh vertices.
   */
  static fromPolygon(polygon: Polygon2DObject, transform?: Transform3D): BoundingBox2D {
    // Get vertices from the mesh
    const vertices = polygon.mesh.vertices;
    const pointCount = vertices.length / 3; // Assuming 3 components per vertex (x, y, z)

    const points: { x: number; y: number }[] = [];
    for (let i = 0; i < pointCount; i++) {
      const x = vertices[i * 3]!;
      const y = vertices[i * 3 + 1]!;
      points.push({ x, y });
    }

    if (transform) {
      return BoundingBox2D.fromTransformedPoints(points, transform.matrix);
    }

    return BoundingBox2D.fromPoints(points);
  }

  /**
   * Creates a bounding box from points transformed by a matrix.
   * Transforms each point and then computes the bounding box.
   */
  static fromTransformedPoints(points: { x: number; y: number }[], matrix: Matrix4): BoundingBox2D {
    if (points.length === 0) {
      return new BoundingBox2D(0, 0, 0, 0);
    }

    // Transform first point
    const first = this.transformPoint(points[0]!, matrix);
    let minX = first.x;
    let minY = first.y;
    let maxX = first.x;
    let maxY = first.y;

    // Transform remaining points
    for (let i = 1; i < points.length; i++) {
      const transformed = this.transformPoint(points[i]!, matrix);
      minX = Math.min(minX, transformed.x);
      minY = Math.min(minY, transformed.y);
      maxX = Math.max(maxX, transformed.x);
      maxY = Math.max(maxY, transformed.y);
    }

    return new BoundingBox2D(minX, minY, maxX, maxY);
  }

  /**
   * Transforms a 2D point by a 4x4 matrix.
   * Assumes the point is at z=0 and w=1.
   */
  private static transformPoint(point: { x: number; y: number }, matrix: Matrix4): { x: number; y: number } {
    // Matrix is stored in column-major order
    // For a 4x4 matrix: data = [m00, m10, m20, m30, m01, m11, m21, m31, m02, m12, m22, m32, m03, m13, m23, m33]
    // Where m00 is at index 0 (column 0, row 0), m01 is at index 4 (column 1, row 0), etc.
    const data = matrix.data;

    // Extract matrix elements (column-major)
    const m00 = data[0]!;
    const m10 = data[1]!;
    const m20 = data[2]!;
    const m30 = data[3]!;
    const m01 = data[4]!;
    const m11 = data[5]!;
    const m21 = data[6]!;
    const m31 = data[7]!;
    const m03 = data[12]!;
    const m13 = data[13]!;
    const m23 = data[14]!;
    const m33 = data[15]!;

    // Transform point: [x', y', z', w'] = M * [x, y, 0, 1]
    const x = m00 * point.x + m01 * point.y + m03;
    const y = m10 * point.x + m11 * point.y + m13;
    const w = m30 * point.x + m31 * point.y + m33;

    // Perspective divide (if w != 1)
    if (Math.abs(w) > 1e-6) {
      return { x: x / w, y: y / w };
    }

    return { x, y };
  }

  /**
   * Transforms this bounding box by a matrix.
   * Transforms all four corners and computes a new axis-aligned bounding box.
   */
  transform(matrix: Matrix4): BoundingBox2D {
    const corners = this.getCorners();
    return BoundingBox2D.fromTransformedPoints(corners, matrix);
  }

  /**
   * Gets the four corners of the bounding box.
   */
  getCorners(): { x: number; y: number }[] {
    return [
      { x: this.minX, y: this.minY }, // Bottom-left
      { x: this.maxX, y: this.minY }, // Bottom-right
      { x: this.maxX, y: this.maxY }, // Top-right
      { x: this.minX, y: this.maxY }, // Top-left
    ];
  }

  /**
   * Gets the center point of the bounding box.
   */
  getCenter(): { x: number; y: number } {
    return {
      x: (this.minX + this.maxX) / 2,
      y: (this.minY + this.maxY) / 2,
    };
  }

  /**
   * Gets the width of the bounding box.
   */
  getWidth(): number {
    return this.maxX - this.minX;
  }

  /**
   * Gets the height of the bounding box.
   */
  getHeight(): number {
    return this.maxY - this.minY;
  }

  /**
   * Checks if a point is inside the bounding box.
   */
  contains(point: { x: number; y: number; z?: number }): boolean {
    return point.x >= this.minX && point.x <= this.maxX && point.y >= this.minY && point.y <= this.maxY;
  }

  /**
   * Checks if this bounding box intersects with another.
   */
  intersects(other: BoundingBox2D): boolean {
    return this.minX <= other.maxX && this.maxX >= other.minX && this.minY <= other.maxY && this.maxY >= other.minY;
  }

  /**
   * Creates a union of this bounding box with another.
   */
  union(other: BoundingBox2D): BoundingBox2D {
    return new BoundingBox2D(Math.min(this.minX, other.minX), Math.min(this.minY, other.minY), Math.max(this.maxX, other.maxX), Math.max(this.maxY, other.maxY));
  }

  /**
   * Creates an empty bounding box.
   */
  static empty(): BoundingBox2D {
    return new BoundingBox2D(0, 0, 0, 0);
  }
}
