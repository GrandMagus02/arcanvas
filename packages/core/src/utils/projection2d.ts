/**
 * Composes a 2D camera matrix as a 4x4 (row-major):
 * M = P · Rz(rotation) · T(-x, -y, 0)
 *
 * - Maps pixel coordinates to clip space:
 *   x ∈ [0, width]  -> clipX ∈ [-1, 1]
 *   y ∈ [0, height] -> clipY ∈ [ 1,-1] (Y flipped)
 * - Applies camera rotation and translation (pan).
 * - Leaves Z unchanged (good for 2D at z=0).
 *
 * @param width - Canvas width in pixels
 * @param height - Canvas height in pixels
 * @param x - Camera X position in pixels (default: 0)
 * @param y - Camera Y position in pixels (default: 0)
 * @param rotation - Camera rotation in radians (default: 0)
 * @returns Row-major 4x4 matrix as Float32Array(16)
 */
export function compose2DProjection4x4(width: number, height: number, x: number = 0, y: number = 0, rotation: number = 0): Float32Array {
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);

  // Pixel -> clip
  const sx = 2 / Math.max(1, width);
  const sy = -2 / Math.max(1, height);
  const tx = -1;
  const ty = 1;

  // Z left as-is (suitable for 2D at z = 0). If you want actual clip-space
  // mapping (e.g., OpenGL z ∈ [-1, 1] or D3D/Vulkan z ∈ [0, 1]),
  // replace sz/tz accordingly.
  const sz = 1;
  const tz = 0;

  // Final matrix (row-major):
  // [ sx*cos,  -sx*sin, 0, tx - sx*cos*x + sx*sin*y ]
  // [ sy*sin,   sy*cos, 0, ty - sy*sin*x - sy*cos*y ]
  // [ 0,        0,      sz, tz                      ]
  // [ 0,        0,      0,  1                       ]
  const m00 = sx * cos;
  const m01 = -sx * sin;
  const m02 = 0;
  const m03 = tx - sx * cos * x + sx * sin * y;

  const m10 = sy * sin;
  const m11 = sy * cos;
  const m12 = 0;
  const m13 = ty - sy * sin * x - sy * cos * y;

  const m20 = 0;
  const m21 = 0;
  const m22 = sz;
  const m23 = tz;

  const m30 = 0;
  const m31 = 0;
  const m32 = 0;
  const m33 = 1;

  return new Float32Array([m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33]);
}
