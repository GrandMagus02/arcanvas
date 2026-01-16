/**
 * Double-precision 3D vector for world coordinates.
 * Uses JS numbers (64-bit floats) for positions that may be extremely large.
 */
export class WorldVec3 {
  x: number;
  y: number;
  z: number;

  constructor(x: number = 0, y: number = 0, z: number = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  set(x: number, y: number, z: number): this {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  copy(other: WorldVec3): this {
    this.x = other.x;
    this.y = other.y;
    this.z = other.z;
    return this;
  }

  clone(): WorldVec3 {
    return new WorldVec3(this.x, this.y, this.z);
  }

  add(other: WorldVec3): this {
    this.x += other.x;
    this.y += other.y;
    this.z += other.z;
    return this;
  }

  sub(other: WorldVec3): this {
    this.x -= other.x;
    this.y -= other.y;
    this.z -= other.z;
    return this;
  }

  scale(s: number): this {
    this.x *= s;
    this.y *= s;
    this.z *= s;
    return this;
  }

  lengthSquared(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  length(): number {
    return Math.sqrt(this.lengthSquared());
  }

  distanceTo(other: WorldVec3): number {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    const dz = this.z - other.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
}

/**
 * Creates a new WorldVec3.
 */
export function createWorldVec3(x: number = 0, y: number = 0, z: number = 0): WorldVec3 {
  return new WorldVec3(x, y, z);
}

/**
 * Copies values from source to target.
 */
export function copyWorldVec3(target: WorldVec3, source: { x: number; y: number; z: number }): void {
  target.x = source.x;
  target.y = source.y;
  target.z = source.z;
}

/**
 * Creates a clone of the given WorldVec3.
 */
export function cloneWorldVec3(v: WorldVec3): WorldVec3 {
  return new WorldVec3(v.x, v.y, v.z);
}
