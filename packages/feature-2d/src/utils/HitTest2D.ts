import type { Camera } from "@arcanvas/core";
import { Matrix4 } from "@arcanvas/math";
import type { Transform3D } from "@arcanvas/scene";
import type { Polygon2DObject } from "../meshes/polygon/Polygon2DObject";
import { BoundingBox2D } from "./BoundingBox2D";

/**
 * 2D hit-testing utilities for point-in-shape detection.
 */
export class HitTest2D {
  /**
   * Point-in-polygon test using ray casting algorithm.
   * Casts a ray from the point to infinity and counts intersections with polygon edges.
   * @param point - Point to test
   * @param vertices - Array of polygon vertices (closed polygon, last vertex should connect to first)
   * @returns True if point is inside the polygon
   */
  static pointInPolygon(point: { x: number; y: number }, vertices: { x: number; y: number }[]): boolean {
    if (vertices.length < 3) {
      return false;
    }

    let inside = false;
    const x = point.x;
    const y = point.y;

    // Ray casting algorithm: cast a horizontal ray to the right
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
      const xi = vertices[i]!.x;
      const yi = vertices[i]!.y;
      const xj = vertices[j]!.x;
      const yj = vertices[j]!.y;

      // Check if ray crosses this edge
      const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) {
        inside = !inside;
      }
    }

    return inside;
  }

  /**
   * Point-in-bounding-box test.
   * @param point - Point to test
   * @param bounds - Bounding box to test against
   * @returns True if point is inside the bounding box
   */
  static pointInBounds(point: { x: number; y: number }, bounds: BoundingBox2D): boolean {
    return bounds.contains(point);
  }

  /**
   * Hit test against a Polygon2DObject.
   * Accounts for the object's transform and converts screen coordinates to world coordinates.
   * @param screenPoint - Point in screen coordinates (pixels, origin at top-left)
   * @param polygon - Polygon object to test
   * @param transform - Transform of the polygon
   * @param camera - Camera for coordinate conversion
   * @returns True if the screen point hits the polygon
   */
  static hitTestPolygon(screenPoint: { x: number; y: number }, polygon: Polygon2DObject, transform: Transform3D, camera: Camera): boolean {
    // Convert screen to world coordinates
    const worldPoint = this.screenToWorld(screenPoint, camera);

    // Use original polygon points (not triangulated mesh vertices)
    const localPoints = polygon.getOriginalPoints();
    if (localPoints.length === 0) {
      return false;
    }

    // Transform world point to object's local space
    // We need to invert the transform matrix
    const invMatrix = this.invertMatrix(transform.matrix);
    const localPoint = this.transformPoint(worldPoint, invMatrix);

    // Test point in local space
    return this.pointInPolygon(localPoint, localPoints);
  }

  /**
   * Converts screen coordinates to world coordinates.
   * @param screenPoint - Point in screen coordinates (pixels, origin at top-left)
   * @param camera - Camera for coordinate conversion
   * @returns Point in world coordinates
   */
  static screenToWorld(screenPoint: { x: number; y: number }, camera: Camera): { x: number; y: number } {
    // Get viewport dimensions
    const canvas = camera.arcanvas?.canvas;
    if (!canvas) {
      return { x: 0, y: 0 };
    }

    // Get canvas internal pixel dimensions (actual rendering size)
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Get canvas display dimensions (CSS size, may be different due to CSS scaling)
    const displayWidth = canvas.clientWidth || canvasWidth;
    const displayHeight = canvas.clientHeight || canvasHeight;

    // Calculate scale factor if canvas is scaled via CSS
    // Avoid division by zero
    const scaleX = displayWidth > 0 ? canvasWidth / displayWidth : 1;
    const scaleY = displayHeight > 0 ? canvasHeight / displayHeight : 1;

    // Convert screen coordinates (which are in CSS pixels relative to canvas element)
    // to canvas internal pixel coordinates
    const pixelX = screenPoint.x * scaleX;
    const pixelY = screenPoint.y * scaleY;

    // For 2D orthographic cameras, use projection bounds directly
    const proj = camera.projection;
    if (proj.left !== undefined && proj.right !== undefined && proj.top !== undefined && proj.bottom !== undefined) {
      const worldWidth = proj.right - proj.left;
      const worldHeight = proj.top - proj.bottom;

      // Normalize pixel coordinates to [0, 1] using canvas internal dimensions
      const normalizedX = pixelX / canvasWidth;
      const normalizedY = pixelY / canvasHeight;

      // Map to world coordinates using projection bounds
      // Projection bounds are in camera-relative space (centered at camera)
      const cameraRelativeX = proj.left + normalizedX * worldWidth;
      const cameraRelativeY = proj.top - normalizedY * worldHeight; // Flip Y (screen Y increases downward, world Y increases upward)

      // Get camera position and add it to get world coordinates
      const cameraPos = camera.position;
      const cameraX = cameraPos.x;
      const cameraY = cameraPos.y;

      // Convert camera-relative to world coordinates
      return {
        x: cameraX + cameraRelativeX,
        y: cameraY + cameraRelativeY,
      };
    }

    // Fallback: use NDC conversion (for perspective or if projection bounds not available)
    const ndcX = (pixelX / canvasWidth) * 2 - 1;
    const ndcY = 1 - (pixelY / canvasHeight) * 2; // Flip Y axis

    // Get view-projection matrix
    const vpMatrix = camera.getViewProjectionMatrix();
    const vpData = vpMatrix.data;

    // Invert view-projection matrix to go from NDC to world
    const invMatrix = this.invertMatrix4x4(vpData);

    // Transform NDC point to world space
    const worldPoint = this.transformPointNDC({ x: ndcX, y: ndcY }, invMatrix);

    return worldPoint;
  }

  /**
   * Transforms a point by a 4x4 matrix (for NDC to world conversion).
   */
  private static transformPointNDC(point: { x: number; y: number }, matrix: Float32Array): { x: number; y: number } {
    // Matrix is in column-major order
    const m00 = matrix[0]!;
    const m10 = matrix[1]!;
    const m20 = matrix[2]!;
    const m30 = matrix[3]!;
    const m01 = matrix[4]!;
    const m11 = matrix[5]!;
    const m21 = matrix[6]!;
    const m31 = matrix[7]!;
    const m03 = matrix[12]!;
    const m13 = matrix[13]!;
    const m23 = matrix[14]!;
    const m33 = matrix[15]!;

    // Transform: [x', y', z', w'] = M * [x, y, 0, 1]
    const x = m00 * point.x + m01 * point.y + m03;
    const y = m10 * point.x + m11 * point.y + m13;
    const w = m30 * point.x + m31 * point.y + m33;

    // Perspective divide
    if (Math.abs(w) > 1e-6) {
      return { x: x / w, y: y / w };
    }

    return { x, y };
  }

  /**
   * Transforms a 2D point by a 4x4 matrix.
   */
  private static transformPoint(point: { x: number; y: number }, matrix: Matrix4): { x: number; y: number } {
    const data = matrix.data;
    const m00 = data[0]!;
    const m10 = data[1]!;
    const m30 = data[3]!;
    const m01 = data[4]!;
    const m11 = data[5]!;
    const m31 = data[7]!;
    const m03 = data[12]!;
    const m13 = data[13]!;
    const m33 = data[15]!;

    const x = m00 * point.x + m01 * point.y + m03;
    const y = m10 * point.x + m11 * point.y + m13;
    const w = m30 * point.x + m31 * point.y + m33;

    if (Math.abs(w) > 1e-6) {
      return { x: x / w, y: y / w };
    }

    return { x, y };
  }

  /**
   * Inverts a 4x4 matrix.
   * Uses a simple inversion algorithm (for affine transforms, this should work).
   * For more complex cases, consider using a library.
   */
  private static invertMatrix(matrix: Matrix4): Matrix4 {
    // For now, create a simple identity-based inversion
    // This is a placeholder - proper matrix inversion would be more complex
    // For 2D transforms (translate, rotate, scale), we can compute inverse directly
    const data = matrix.data;

    // Extract translation
    const tx = data[12]!;
    const ty = data[13]!;

    // Extract scale and rotation from upper-left 2x2
    const m00 = data[0]!;
    const m01 = data[4]!;
    const m10 = data[1]!;
    const m11 = data[5]!;

    // Determinant of 2x2 rotation/scale matrix
    const det = m00 * m11 - m01 * m10;

    if (Math.abs(det) < 1e-6) {
      // Singular matrix, return identity
      return Matrix4.identity();
    }

    // Inverse of 2x2: [a b; c d]^-1 = (1/det) * [d -b; -c a]
    const invDet = 1 / det;
    const inv00 = invDet * m11;
    const inv01 = invDet * -m01;
    const inv10 = invDet * -m10;
    const inv11 = invDet * m00;

    // Inverse translation: -R^-1 * T
    const invTx = -(inv00 * tx + inv01 * ty);
    const invTy = -(inv10 * tx + inv11 * ty);

    // Build inverse matrix (column-major)
    return Matrix4.fromValues(inv00, inv10, 0, 0, inv01, inv11, 0, 0, 0, 0, 1, 0, invTx, invTy, 0, 1);
  }

  /**
   * Inverts a 4x4 matrix stored as Float32Array (column-major).
   */
  private static invertMatrix4x4(matrix: Float32Array): Float32Array {
    // Similar to invertMatrix but for Float32Array
    const tx = matrix[12]!;
    const ty = matrix[13]!;
    const m00 = matrix[0]!;
    const m01 = matrix[4]!;
    const m10 = matrix[1]!;
    const m11 = matrix[5]!;

    const det = m00 * m11 - m01 * m10;

    if (Math.abs(det) < 1e-6) {
      return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    }

    const invDet = 1 / det;
    const inv00 = invDet * m11;
    const inv01 = invDet * -m01;
    const inv10 = invDet * -m10;
    const inv11 = invDet * m00;
    const invTx = -(inv00 * tx + inv01 * ty);
    const invTy = -(inv10 * tx + inv11 * ty);

    return new Float32Array([inv00, inv10, 0, 0, inv01, inv11, 0, 0, 0, 0, 1, 0, invTx, invTy, 0, 1]);
  }
}
