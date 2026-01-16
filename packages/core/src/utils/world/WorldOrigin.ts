import { WorldVec3, createWorldVec3, cloneWorldVec3, copyWorldVec3, distanceWorldVec3, subWorldVec3, worldVec3ToFloat32Into, type WorldVec3Like } from "./WorldVec3";

/**
 * Interface for objects that have a world-space position.
 * This is used by WorldOrigin to update local positions when recentering.
 */
export interface WorldPositioned {
  /**
   * The object's position in world-space (double precision).
   */
  worldPosition: WorldVec3Like;

  /**
   * The object's position relative to the current origin (float32-safe).
   * This is updated by WorldOrigin when recentering.
   */
  localPosition: Float32Array;
}

/**
 * Options for WorldOrigin behavior.
 */
export interface WorldOriginOptions {
  /**
   * Distance threshold for automatic recentering.
   * When the camera moves more than this distance from the origin,
   * the origin will be shifted to the camera position.
   * Default: 10,000 units (10km at 1 unit = 1 meter)
   */
  recenterThreshold: number;

  /**
   * If true, automatically recenter when updateOrigin is called
   * and the camera exceeds the threshold.
   * Default: true
   */
  autoRecenter: boolean;

  /**
   * If true, snap the origin to a grid when recentering.
   * This can help with floating point stability.
   * Default: false
   */
  snapToGrid: boolean;

  /**
   * Grid size for snapping (only used if snapToGrid is true).
   * Default: 1000
   */
  gridSize: number;
}

const DEFAULT_OPTIONS: WorldOriginOptions = {
  recenterThreshold: 10_000,
  autoRecenter: true,
  snapToGrid: false,
  gridSize: 1000,
};

/**
 * WorldOrigin manages the floating origin for large-world rendering.
 *
 * The key insight is that we want to keep coordinates small on the GPU
 * while supporting arbitrarily large world coordinates in the engine.
 *
 * This is achieved by:
 * 1. Storing all positions in double-precision world coordinates
 * 2. Maintaining a "world origin" point (also in doubles)
 * 3. Computing local positions as (world - origin) when needed for rendering
 * 4. Periodically shifting the origin to keep local coordinates small
 *
 * Two main strategies:
 *
 * **Floating Origin**: Origin shifts when camera moves far enough.
 * All local positions are updated. Good for continuous large worlds.
 *
 * **Camera-Relative**: Origin is always at camera position.
 * Local positions computed fresh each frame. Simpler but more computation.
 *
 * This implementation supports both - use `mode` option to choose.
 */
export class WorldOrigin {
  private _origin: WorldVec3;
  private _options: WorldOriginOptions;
  private _dirty: boolean = false;

  // Pre-allocated arrays for avoiding GC pressure during render
  private _tempLocal = new Float32Array(3);

  constructor(options: Partial<WorldOriginOptions> = {}) {
    this._origin = createWorldVec3(0, 0, 0);
    this._options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Gets the current world origin position.
   */
  get origin(): WorldVec3 {
    return cloneWorldVec3(this._origin);
  }

  /**
   * Sets the world origin directly.
   * Use this sparingly - prefer recenterTo() which handles snapping.
   */
  set origin(value: WorldVec3) {
    copyWorldVec3(this._origin, value);
    this._dirty = true;
  }

  /**
   * Gets the raw origin reference (for performance in tight loops).
   * DO NOT MODIFY the returned object!
   */
  get originRef(): Readonly<WorldVec3> {
    return this._origin;
  }

  /**
   * Whether the origin has changed since last clearDirty().
   */
  get dirty(): boolean {
    return this._dirty;
  }

  /**
   * Clears the dirty flag.
   */
  clearDirty(): void {
    this._dirty = false;
  }

  /**
   * Checks if the given position is far enough from the origin to trigger recentering.
   */
  needsRecenter(position: WorldVec3Like): boolean {
    const distance = distanceWorldVec3(position, this._origin);
    return distance > this._options.recenterThreshold;
  }

  /**
   * Recenters the origin to a new position.
   *
   * If snapToGrid is enabled, the position will be snapped to the nearest grid point.
   *
   * @param newOrigin The new origin position (typically camera position)
   * @param objects Optional iterable of objects to update local positions for
   */
  recenterTo(newOrigin: WorldVec3Like, objects?: Iterable<WorldPositioned>): void {
    let targetOrigin: WorldVec3;

    // Snap to grid if enabled
    if (this._options.snapToGrid) {
      const gridSize = this._options.gridSize;
      const nx = newOrigin instanceof WorldVec3 ? newOrigin.x : newOrigin.x;
      const ny = newOrigin instanceof WorldVec3 ? newOrigin.y : newOrigin.y;
      const nz = newOrigin instanceof WorldVec3 ? newOrigin.z : newOrigin.z;
      targetOrigin = createWorldVec3(Math.round(nx / gridSize) * gridSize, Math.round(ny / gridSize) * gridSize, Math.round(nz / gridSize) * gridSize);
    } else {
      targetOrigin = newOrigin instanceof WorldVec3 ? newOrigin : createWorldVec3(newOrigin.x, newOrigin.y, newOrigin.z);
    }

    // Update origin
    copyWorldVec3(this._origin, targetOrigin);
    this._dirty = true;

    // Update all object local positions if provided
    if (objects) {
      this.updateLocalPositions(objects);
    }
  }

  /**
   * Updates local positions for a set of objects based on current origin.
   * Call this after recentering or when objects are added to the scene.
   */
  updateLocalPositions(objects: Iterable<WorldPositioned>): void {
    for (const obj of objects) {
      this.updateLocalPosition(obj);
    }
  }

  /**
   * Updates a single object's local position based on current origin.
   */
  updateLocalPosition(obj: WorldPositioned): void {
    const local = subWorldVec3(obj.worldPosition, this._origin);
    worldVec3ToFloat32Into(local, obj.localPosition, 0);
  }

  /**
   * Computes the local position for a world position without storing it.
   * Useful for temporary calculations.
   */
  computeLocal(worldPos: WorldVec3Like): Float32Array {
    worldVec3ToFloat32Into(subWorldVec3(worldPos, this._origin), this._tempLocal, 0);
    return this._tempLocal;
  }

  /**
   * Computes local position into a provided array.
   * More efficient when you need to store the result.
   */
  computeLocalInto(worldPos: WorldVec3Like, target: Float32Array, offset: number = 0): void {
    const px = worldPos instanceof WorldVec3 ? worldPos.x : worldPos.x;
    const py = worldPos instanceof WorldVec3 ? worldPos.y : worldPos.y;
    const pz = worldPos instanceof WorldVec3 ? worldPos.z : worldPos.z;
    target[offset] = px - this._origin.x;
    target[offset + 1] = py - this._origin.y;
    target[offset + 2] = pz - this._origin.z;
  }

  /**
   * Call this each frame (or when camera moves significantly).
   * Checks if recentering is needed and performs it if autoRecenter is enabled.
   *
   * @param cameraWorldPos Current camera position in world space
   * @param objects Objects to update if recentering occurs
   * @returns true if recentering occurred
   */
  update(cameraWorldPos: WorldVec3Like, objects?: Iterable<WorldPositioned>): boolean {
    if (!this._options.autoRecenter) {
      return false;
    }

    if (this.needsRecenter(cameraWorldPos)) {
      this.recenterTo(cameraWorldPos, objects);
      return true;
    }

    return false;
  }

  /**
   * Converts a local position back to world position.
   * Useful for raycasting, picking, etc.
   */
  localToWorld(local: Float32Array | number[], offset: number = 0): WorldVec3 {
    return createWorldVec3(local[offset]! + this._origin.x, local[offset + 1]! + this._origin.y, local[offset + 2]! + this._origin.z);
  }

  /**
   * Updates options dynamically.
   */
  setOptions(options: Partial<WorldOriginOptions>): void {
    this._options = { ...this._options, ...options };
  }

  /**
   * Gets current options.
   */
  get options(): Readonly<WorldOriginOptions> {
    return this._options;
  }
}
