import { Vector3 } from "@arcanvas/math";

/**
 * WorldVec3 represents a position in world-space using double-precision numbers.
 *
 * JavaScript numbers are 64-bit IEEE 754 doubles, which provide:
 * - ~15-17 significant decimal digits
 * - Safe integer range up to ±9,007,199,254,740,991 (Number.MAX_SAFE_INTEGER)
 *
 * For world coordinates, this allows representing positions with sub-millimeter
 * precision across solar system scales (~10^12 meters).
 *
 * This class extends Vector3 with Float64Array for double-precision storage,
 * while maintaining compatibility with the simple object interface { x, y, z }.
 */
export class WorldVec3 extends Vector3<Float64Array> {
  /**
   * Creates a new WorldVec3 with the given coordinates.
   */
  constructor(x: number = 0, y: number = 0, z: number = 0) {
    super(new Float64Array([x, y, z]));
  }

  /**
   * Gets the x component.
   */
  override get x(): number {
    return this._data[0]!;
  }

  /**
   * Sets the x component.
   */
  override set x(value: number) {
    this._data[0] = value;
  }

  /**
   * Gets the y component.
   */
  override get y(): number {
    return this._data[1]!;
  }

  /**
   * Sets the y component.
   */
  override set y(value: number) {
    this._data[1] = value;
  }

  /**
   * Gets the z component.
   */
  override get z(): number {
    return this._data[2]!;
  }

  /**
   * Sets the z component.
   */
  override set z(value: number) {
    this._data[2] = value;
  }

  /**
   * Creates a copy of this WorldVec3.
   */
  override clone(): WorldVec3 {
    return new WorldVec3(this.x, this.y, this.z);
  }

  /**
   * Creates a new WorldVec3 from an object with x, y, z properties.
   */
  static fromObject(obj: { x: number; y: number; z: number }): WorldVec3 {
    return new WorldVec3(obj.x, obj.y, obj.z);
  }

  /**
   * Creates a new WorldVec3 from a Vector3 (converts to double precision).
   */
  static fromVector3(v: Vector3): WorldVec3 {
    return new WorldVec3(v.x, v.y, v.z);
  }

  /**
   * Converts this WorldVec3 to a plain object.
   */
  toObject(): { x: number; y: number; z: number } {
    return { x: this.x, y: this.y, z: this.z };
  }

  /**
   * Converts this WorldVec3 to a Float32Array for GPU operations.
   * WARNING: This conversion loses precision for large coordinates!
   * Only use this for relative/local coordinates that are small (< 1e6).
   */
  override toFloat32Array(): Float32Array {
    return new Float32Array([this.x, this.y, this.z]);
  }

  /**
   * Writes this WorldVec3 to a Float32Array at the given offset.
   * This avoids allocation when updating frequently.
   */
  toFloat32ArrayInto(target: Float32Array, offset: number = 0): void {
    target[offset] = this.x;
    target[offset + 1] = this.y;
    target[offset + 2] = this.z;
  }

  /**
   * Checks if this WorldVec3 is safe to convert to Float32 without significant precision loss.
   * Float32 has ~7 significant decimal digits, so values > ~1e6 start losing unit-level precision.
   */
  isFloat32Safe(threshold: number = 1e6): boolean {
    return Math.abs(this.x) < threshold && Math.abs(this.y) < threshold && Math.abs(this.z) < threshold;
  }

  /**
   * Computes the relative position of this vector with respect to an origin.
   * Result = this - origin
   */
  relativeTo(origin: WorldVec3): WorldVec3 {
    return new WorldVec3(this.x - origin.x, this.y - origin.y, this.z - origin.z);
  }

  /**
   * Computes relative position and writes directly to a Float32Array.
   * This is optimized for the render loop where we want to avoid allocations.
   */
  relativeToInto(origin: WorldVec3, target: Float32Array, offset: number = 0): void {
    target[offset] = this.x - origin.x;
    target[offset + 1] = this.y - origin.y;
    target[offset + 2] = this.z - origin.z;
  }

  /**
   * Linearly interpolates between this vector and another.
   * Result = this + t * (other - this)
   */
  lerp(other: WorldVec3, t: number): WorldVec3 {
    return new WorldVec3(this.x + t * (other.x - this.x), this.y + t * (other.y - this.y), this.z + t * (other.z - this.z));
  }

  /**
   * Checks if this vector is approximately equal to another within a tolerance.
   */
  equalsApprox(other: WorldVec3, epsilon: number = 1e-10): boolean {
    return Math.abs(this.x - other.x) < epsilon && Math.abs(this.y - other.y) < epsilon && Math.abs(this.z - other.z) < epsilon;
  }

  /**
   * Calculates the squared distance to another WorldVec3.
   */
  distanceSquared(other: WorldVec3): number {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    const dz = this.z - other.z;
    return dx * dx + dy * dy + dz * dz;
  }

  /**
   * Calculates the distance to another WorldVec3.
   */
  distance(other: WorldVec3): number {
    return Math.sqrt(this.distanceSquared(other));
  }
}

/**
 * Type alias for backward compatibility.
 * WorldVec3 can be used as both a class and an interface-like type.
 */
export type WorldVec3Like = WorldVec3 | { x: number; y: number; z: number };

/**
 * Creates a new WorldVec3 with the given coordinates.
 * For backward compatibility with existing code.
 */
export function createWorldVec3(x: number = 0, y: number = 0, z: number = 0): WorldVec3 {
  return new WorldVec3(x, y, z);
}

/**
 * Creates a copy of a WorldVec3.
 * Handles both class instances and plain objects.
 */
export function cloneWorldVec3(v: WorldVec3Like): WorldVec3 {
  if (v instanceof WorldVec3) {
    return v.clone();
  }
  return new WorldVec3(v.x, v.y, v.z);
}

/**
 * Subtracts b from a, returning a new WorldVec3.
 * Result = a - b
 */
export function subWorldVec3(a: WorldVec3Like, b: WorldVec3Like): WorldVec3 {
  const ax = a instanceof WorldVec3 ? a.x : a.x;
  const ay = a instanceof WorldVec3 ? a.y : a.y;
  const az = a instanceof WorldVec3 ? a.z : a.z;
  const bx = b instanceof WorldVec3 ? b.x : b.x;
  const by = b instanceof WorldVec3 ? b.y : b.y;
  const bz = b instanceof WorldVec3 ? b.z : b.z;
  return new WorldVec3(ax - bx, ay - by, az - bz);
}

/**
 * Adds two WorldVec3 values, returning a new WorldVec3.
 * Result = a + b
 */
export function addWorldVec3(a: WorldVec3Like, b: WorldVec3Like): WorldVec3 {
  const ax = a instanceof WorldVec3 ? a.x : a.x;
  const ay = a instanceof WorldVec3 ? a.y : a.y;
  const az = a instanceof WorldVec3 ? a.z : a.z;
  const bx = b instanceof WorldVec3 ? b.x : b.x;
  const by = b instanceof WorldVec3 ? b.y : b.y;
  const bz = b instanceof WorldVec3 ? b.z : b.z;
  return new WorldVec3(ax + bx, ay + by, az + bz);
}

/**
 * Sets the values of a WorldVec3 in place.
 */
export function setWorldVec3(target: WorldVec3, x: number, y: number, z: number): WorldVec3 {
  target.x = x;
  target.y = y;
  target.z = z;
  return target;
}

/**
 * Copies values from source to target.
 */
export function copyWorldVec3(target: WorldVec3, source: WorldVec3Like): WorldVec3 {
  if (source instanceof WorldVec3) {
    target.x = source.x;
    target.y = source.y;
    target.z = source.z;
  } else {
    target.x = source.x;
    target.y = source.y;
    target.z = source.z;
  }
  return target;
}

/**
 * Calculates the squared distance between two WorldVec3 points.
 * Use this when comparing distances to avoid the sqrt operation.
 */
export function distanceSquaredWorldVec3(a: WorldVec3Like, b: WorldVec3Like): number {
  const ax = a instanceof WorldVec3 ? a.x : a.x;
  const ay = a instanceof WorldVec3 ? a.y : a.y;
  const az = a instanceof WorldVec3 ? a.z : a.z;
  const bx = b instanceof WorldVec3 ? b.x : b.x;
  const by = b instanceof WorldVec3 ? b.y : b.y;
  const bz = b instanceof WorldVec3 ? b.z : b.z;
  const dx = ax - bx;
  const dy = ay - by;
  const dz = az - bz;
  return dx * dx + dy * dy + dz * dz;
}

/**
 * Calculates the distance between two WorldVec3 points.
 */
export function distanceWorldVec3(a: WorldVec3Like, b: WorldVec3Like): number {
  return Math.sqrt(distanceSquaredWorldVec3(a, b));
}

/**
 * Calculates the length (magnitude) of a WorldVec3.
 */
export function lengthWorldVec3(v: WorldVec3Like): number {
  const x = v instanceof WorldVec3 ? v.x : v.x;
  const y = v instanceof WorldVec3 ? v.y : v.y;
  const z = v instanceof WorldVec3 ? v.z : v.z;
  return Math.sqrt(x * x + y * y + z * z);
}

/**
 * Converts a WorldVec3 to a Float32Array for GPU operations.
 * WARNING: This conversion loses precision for large coordinates!
 * Only use this for relative/local coordinates that are small (< 1e6).
 */
export function worldVec3ToFloat32(v: WorldVec3Like): Float32Array {
  if (v instanceof WorldVec3) {
    return v.toFloat32Array();
  }
  return new Float32Array([v.x, v.y, v.z]);
}

/**
 * Converts a WorldVec3 to a Float32Array, writing to an existing array.
 * This avoids allocation when updating frequently.
 */
export function worldVec3ToFloat32Into(v: WorldVec3Like, target: Float32Array, offset: number = 0): void {
  if (v instanceof WorldVec3) {
    v.toFloat32ArrayInto(target, offset);
  } else {
    target[offset] = v.x;
    target[offset + 1] = v.y;
    target[offset + 2] = v.z;
  }
}

/**
 * Checks if a WorldVec3 is safe to convert to Float32 without significant precision loss.
 * Float32 has ~7 significant decimal digits, so values > ~1e6 start losing unit-level precision.
 * @param threshold The maximum safe magnitude (default: 1,000,000)
 */
export function isFloat32Safe(v: WorldVec3Like, threshold: number = 1e6): boolean {
  if (v instanceof WorldVec3) {
    return v.isFloat32Safe(threshold);
  }
  return Math.abs(v.x) < threshold && Math.abs(v.y) < threshold && Math.abs(v.z) < threshold;
}

/**
 * Computes the relative position of `position` with respect to `origin`.
 * Result = position - origin
 *
 * This is the core operation for camera-relative rendering.
 * The result should be small enough to safely convert to Float32.
 */
export function computeRelativePosition(position: WorldVec3Like, origin: WorldVec3Like): WorldVec3 {
  return subWorldVec3(position, origin);
}

/**
 * Computes relative position and writes directly to a Float32Array.
 * This is optimized for the render loop where we want to avoid allocations.
 */
export function computeRelativePositionToFloat32(position: WorldVec3Like, origin: WorldVec3Like, target: Float32Array, offset: number = 0): void {
  const px = position instanceof WorldVec3 ? position.x : position.x;
  const py = position instanceof WorldVec3 ? position.y : position.y;
  const pz = position instanceof WorldVec3 ? position.z : position.z;
  const ox = origin instanceof WorldVec3 ? origin.x : origin.x;
  const oy = origin instanceof WorldVec3 ? origin.y : origin.y;
  const oz = origin instanceof WorldVec3 ? origin.z : origin.z;
  target[offset] = px - ox;
  target[offset + 1] = py - oy;
  target[offset + 2] = pz - oz;
}

/**
 * Linearly interpolates between two WorldVec3 positions.
 * Result = a + t * (b - a)
 */
export function lerpWorldVec3(a: WorldVec3Like, b: WorldVec3Like, t: number): WorldVec3 {
  const ax = a instanceof WorldVec3 ? a.x : a.x;
  const ay = a instanceof WorldVec3 ? a.y : a.y;
  const az = a instanceof WorldVec3 ? a.z : a.z;
  const bx = b instanceof WorldVec3 ? b.x : b.x;
  const by = b instanceof WorldVec3 ? b.y : b.y;
  const bz = b instanceof WorldVec3 ? b.z : b.z;
  return new WorldVec3(ax + t * (bx - ax), ay + t * (by - ay), az + t * (bz - az));
}

/**
 * Checks if two WorldVec3 are approximately equal within a tolerance.
 */
export function equalsWorldVec3(a: WorldVec3Like, b: WorldVec3Like, epsilon: number = 1e-10): boolean {
  if (a instanceof WorldVec3 && b instanceof WorldVec3) {
    return a.equalsApprox(b, epsilon);
  }
  const ax = a instanceof WorldVec3 ? a.x : a.x;
  const ay = a instanceof WorldVec3 ? a.y : a.y;
  const az = a instanceof WorldVec3 ? a.z : a.z;
  const bx = b instanceof WorldVec3 ? b.x : b.x;
  const by = b instanceof WorldVec3 ? b.y : b.y;
  const bz = b instanceof WorldVec3 ? b.z : b.z;
  return Math.abs(ax - bx) < epsilon && Math.abs(ay - by) < epsilon && Math.abs(az - bz) < epsilon;
}
