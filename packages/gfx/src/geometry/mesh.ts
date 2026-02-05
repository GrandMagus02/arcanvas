/**
 * @arcanvas/gfx - Mesh abstraction
 *
 * Backend-agnostic mesh representation for geometry data.
 */

import type { GfxVertexBufferLayout } from "../pipeline/vertexLayout.js";
import type { IndexFormat } from "../types/formats.js";
import type { PrimitiveTopology } from "../types/states.js";

// ============================================================================
// Mesh Descriptor
// ============================================================================

/**
 * Mesh vertex data source.
 */
export interface MeshVertexData {
  /** Vertex data buffer */
  data: Float32Array | Uint8Array | Int8Array | Uint16Array | Int16Array;
  /** Vertex layout description */
  layout: GfxVertexBufferLayout;
}

/**
 * Mesh index data source.
 */
export interface MeshIndexData {
  /** Index data buffer */
  data: Uint16Array | Uint32Array;
  /** Index format (inferred from data type) */
  format: IndexFormat;
}

/**
 * Submesh definition for multi-material meshes.
 */
export interface MeshSubmesh {
  /** First index (or vertex if not indexed) */
  start: number;
  /** Number of indices (or vertices) */
  count: number;
  /** Material index (application-defined) */
  materialIndex?: number;
}

/**
 * Axis-aligned bounding box.
 */
export interface BoundingBox {
  min: [number, number, number];
  max: [number, number, number];
}

/**
 * Mesh descriptor for creating geometry.
 */
export interface MeshDescriptor {
  /** Debug label */
  label?: string;
  /** Vertex buffers (multiple for separate streams) */
  vertexBuffers: MeshVertexData[];
  /** Index data (optional) */
  indexData?: MeshIndexData;
  /** Primitive topology */
  topology?: PrimitiveTopology;
  /** Submeshes for multi-material rendering */
  submeshes?: MeshSubmesh[];
  /** Bounding box (optional, for culling) */
  bounds?: BoundingBox;
}

// ============================================================================
// Mesh Class
// ============================================================================

/**
 * CPU-side mesh representation.
 *
 * Holds geometry data before upload to GPU.
 * Can be modified and re-uploaded.
 */
export class Mesh {
  label: string | undefined;
  readonly vertexBuffers: MeshVertexData[];
  indexData: MeshIndexData | undefined;
  topology: PrimitiveTopology;
  submeshes: MeshSubmesh[];
  bounds: BoundingBox | undefined;

  /** Version number, increments on modification */
  private _version = 0;

  constructor(descriptor: MeshDescriptor) {
    this.label = descriptor.label;
    this.vertexBuffers = descriptor.vertexBuffers;
    this.indexData = descriptor.indexData;
    this.topology = descriptor.topology ?? "triangle-list";
    this.submeshes = descriptor.submeshes ?? [];
    this.bounds = descriptor.bounds;
  }

  /**
   * Get the current version number.
   */
  get version(): number {
    return this._version;
  }

  /**
   * Mark the mesh as modified.
   */
  markDirty(): void {
    this._version++;
  }

  /**
   * Get vertex count.
   */
  get vertexCount(): number {
    const firstBuffer = this.vertexBuffers[0];
    if (!firstBuffer) return 0;
    const stride = firstBuffer.layout.arrayStride;
    return Math.floor(firstBuffer.data.byteLength / stride);
  }

  /**
   * Get index count (0 if not indexed).
   */
  get indexCount(): number {
    return this.indexData?.data.length ?? 0;
  }

  /**
   * Get draw count (indices if indexed, vertices otherwise).
   */
  get drawCount(): number {
    return this.indexData ? this.indexCount : this.vertexCount;
  }

  /**
   * Check if mesh is indexed.
   */
  get isIndexed(): boolean {
    return this.indexData !== undefined;
  }

  /**
   * Calculate bounding box from position data.
   * Assumes first attribute is position (vec3).
   */
  calculateBounds(): BoundingBox {
    const firstBuffer = this.vertexBuffers[0];
    if (!firstBuffer) {
      return { min: [0, 0, 0], max: [0, 0, 0] };
    }

    const positions = firstBuffer.data;
    const stride = firstBuffer.layout.arrayStride / 4; // Assume float32

    const min: [number, number, number] = [Infinity, Infinity, Infinity];
    const max: [number, number, number] = [-Infinity, -Infinity, -Infinity];

    const vertexCount = this.vertexCount;
    const floatView = positions instanceof Float32Array ? positions : new Float32Array(positions.buffer, positions.byteOffset, positions.byteLength / 4);

    for (let i = 0; i < vertexCount; i++) {
      const offset = i * stride;
      const x = floatView[offset] ?? 0;
      const y = floatView[offset + 1] ?? 0;
      const z = floatView[offset + 2] ?? 0;

      min[0] = Math.min(min[0], x);
      min[1] = Math.min(min[1], y);
      min[2] = Math.min(min[2], z);
      max[0] = Math.max(max[0], x);
      max[1] = Math.max(max[1], y);
      max[2] = Math.max(max[2], z);
    }

    this.bounds = { min, max };
    return this.bounds;
  }

  /**
   * Clone the mesh with deep copied data.
   */
  clone(): Mesh {
    return new Mesh({
      label: this.label ? `${this.label}_clone` : undefined,
      vertexBuffers: this.vertexBuffers.map((vb) => ({
        data: vb.data.slice() as typeof vb.data,
        layout: { ...vb.layout, attributes: [...vb.layout.attributes] },
      })),
      indexData: this.indexData
        ? {
            data: this.indexData.data.slice() as typeof this.indexData.data,
            format: this.indexData.format,
          }
        : undefined,
      topology: this.topology,
      submeshes: this.submeshes.map((s) => ({ ...s })),
      bounds: this.bounds ? { min: [...this.bounds.min], max: [...this.bounds.max] } : undefined,
    });
  }
}

// ============================================================================
// Primitive Generators
// ============================================================================

/**
 * Create a simple quad mesh.
 */
export function createQuadMesh(size: number = 1, centered: boolean = true): Mesh {
  const half = size / 2;
  const offset = centered ? 0 : half;

  // Position (vec3) + UV (vec2)
  const vertices = new Float32Array([
    // Position          // UV
    -half + offset,
    -half + offset,
    0,
    0,
    0,
    half + offset,
    -half + offset,
    0,
    1,
    0,
    half + offset,
    half + offset,
    0,
    1,
    1,
    -half + offset,
    half + offset,
    0,
    0,
    1,
  ]);

  const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);

  return new Mesh({
    label: "quad",
    vertexBuffers: [
      {
        data: vertices,
        layout: {
          arrayStride: 20,
          attributes: [
            { format: "float32x3", offset: 0, shaderLocation: 0 },
            { format: "float32x2", offset: 12, shaderLocation: 3 },
          ],
        },
      },
    ],
    indexData: { data: indices, format: "uint16" },
  });
}

/**
 * Create a fullscreen triangle mesh.
 * More efficient than a quad for post-processing.
 */
export function createFullscreenTriangleMesh(): Mesh {
  // Oversized triangle that covers the screen
  // Position (vec2) + UV (vec2)
  const vertices = new Float32Array([
    // Position    // UV
    -1, -1, 0, 0, 3, -1, 2, 0, -1, 3, 0, 2,
  ]);

  return new Mesh({
    label: "fullscreen_triangle",
    vertexBuffers: [
      {
        data: vertices,
        layout: {
          arrayStride: 16,
          attributes: [
            { format: "float32x2", offset: 0, shaderLocation: 0 },
            { format: "float32x2", offset: 8, shaderLocation: 3 },
          ],
        },
      },
    ],
  });
}

/**
 * Create a cube mesh.
 */
export function createCubeMesh(size: number = 1): Mesh {
  const h = size / 2;

  // Position (vec3) + Normal (vec3) - 24 vertices (4 per face)
  const vertices = new Float32Array([
    // Front face
    -h,
    -h,
    h,
    0,
    0,
    1,
    h,
    -h,
    h,
    0,
    0,
    1,
    h,
    h,
    h,
    0,
    0,
    1,
    -h,
    h,
    h,
    0,
    0,
    1,
    // Back face
    h,
    -h,
    -h,
    0,
    0,
    -1,
    -h,
    -h,
    -h,
    0,
    0,
    -1,
    -h,
    h,
    -h,
    0,
    0,
    -1,
    h,
    h,
    -h,
    0,
    0,
    -1,
    // Top face
    -h,
    h,
    h,
    0,
    1,
    0,
    h,
    h,
    h,
    0,
    1,
    0,
    h,
    h,
    -h,
    0,
    1,
    0,
    -h,
    h,
    -h,
    0,
    1,
    0,
    // Bottom face
    -h,
    -h,
    -h,
    0,
    -1,
    0,
    h,
    -h,
    -h,
    0,
    -1,
    0,
    h,
    -h,
    h,
    0,
    -1,
    0,
    -h,
    -h,
    h,
    0,
    -1,
    0,
    // Right face
    h,
    -h,
    h,
    1,
    0,
    0,
    h,
    -h,
    -h,
    1,
    0,
    0,
    h,
    h,
    -h,
    1,
    0,
    0,
    h,
    h,
    h,
    1,
    0,
    0,
    // Left face
    -h,
    -h,
    -h,
    -1,
    0,
    0,
    -h,
    -h,
    h,
    -1,
    0,
    0,
    -h,
    h,
    h,
    -1,
    0,
    0,
    -h,
    h,
    -h,
    -1,
    0,
    0,
  ]);

  const indices = new Uint16Array([
    0,
    1,
    2,
    0,
    2,
    3, // Front
    4,
    5,
    6,
    4,
    6,
    7, // Back
    8,
    9,
    10,
    8,
    10,
    11, // Top
    12,
    13,
    14,
    12,
    14,
    15, // Bottom
    16,
    17,
    18,
    16,
    18,
    19, // Right
    20,
    21,
    22,
    20,
    22,
    23, // Left
  ]);

  return new Mesh({
    label: "cube",
    vertexBuffers: [
      {
        data: vertices,
        layout: {
          arrayStride: 24,
          attributes: [
            { format: "float32x3", offset: 0, shaderLocation: 0 },
            { format: "float32x3", offset: 12, shaderLocation: 1 },
          ],
        },
      },
    ],
    indexData: { data: indices, format: "uint16" },
  });
}
