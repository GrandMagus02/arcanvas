import { WorldVec3, createWorldVec3, copyWorldVec3, cloneWorldVec3 } from "./WorldVec3";

/**
 * Interface for objects that have a world position and local position.
 */
export interface WorldPositioned {
  worldPosition: WorldVec3;
  localPosition: Float32Array;
  updateLocal(origin: WorldVec3): void;
}

/**
 * Options for WorldOrigin behavior.
 */
export interface WorldOriginOptions {
  recenterThreshold: number;
  autoRecenter: boolean;
  snapToGrid: boolean;
  gridSize: number;
}

const DEFAULT_OPTIONS: WorldOriginOptions = {
  recenterThreshold: 10000,
  autoRecenter: true,
  snapToGrid: false,
  gridSize: 1000,
};

/**
 * Manages the world origin for floating-point precision.
 * When objects move far from the origin, this can "recenter" them
 * to keep coordinates small enough for Float32.
 */
export class WorldOrigin {
  private _origin: WorldVec3;
  private _dirty: boolean = false;
  readonly options: WorldOriginOptions;

  constructor(options: Partial<WorldOriginOptions> = {}) {
    this._origin = createWorldVec3(0, 0, 0);
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  get origin(): WorldVec3 {
    return cloneWorldVec3(this._origin);
  }

  set origin(value: WorldVec3) {
    copyWorldVec3(this._origin, value);
    this._dirty = true;
  }

  get originRef(): Readonly<WorldVec3> {
    return this._origin;
  }

  get dirty(): boolean {
    return this._dirty;
  }

  clearDirty(): void {
    this._dirty = false;
  }

  /**
   * Updates the origin based on camera position.
   * Returns true if recentering occurred.
   */
  update(cameraPos: WorldVec3, objects: Iterable<WorldPositioned>): boolean {
    if (!this.options.autoRecenter) {
      return false;
    }

    const dist = cameraPos.distanceTo(this._origin);

    if (dist > this.options.recenterThreshold) {
      this.recenterTo(cameraPos, objects);
      return true;
    }

    return false;
  }

  /**
   * Recenters the origin to the given position.
   */
  recenterTo(newOrigin: WorldVec3, objects: Iterable<WorldPositioned>): void {
    let x = newOrigin.x;
    let y = newOrigin.y;
    let z = newOrigin.z;

    if (this.options.snapToGrid && this.options.gridSize > 0) {
      const g = this.options.gridSize;
      x = Math.round(x / g) * g;
      y = Math.round(y / g) * g;
      z = Math.round(z / g) * g;
    }

    this._origin.set(x, y, z);
    this.updateLocalPositions(objects);
    this._dirty = false;
  }

  /**
   * Updates local positions for all objects.
   */
  updateLocalPositions(objects: Iterable<WorldPositioned>): void {
    for (const obj of objects) {
      this.updateLocalPosition(obj);
    }
  }

  /**
   * Updates local position for a single object.
   */
  updateLocalPosition(obj: WorldPositioned): void {
    obj.updateLocal(this._origin);
  }

  /**
   * Converts a local position back to world position.
   */
  localToWorld(local: Float32Array | number[], offset: number = 0): WorldVec3 {
    return createWorldVec3(this._origin.x + (local[offset] ?? 0), this._origin.y + (local[offset + 1] ?? 0), this._origin.z + (local[offset + 2] ?? 0));
  }
}
