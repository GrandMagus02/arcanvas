/**
 * @arcanvas/gfx - Vertex layout
 *
 * Vertex buffer layouts and attribute descriptions.
 */

import type { VertexFormat, IndexFormat } from "../types/formats.js";
import { getVertexFormatByteSize } from "../types/formats.js";

// ============================================================================
// Vertex Attribute
// ============================================================================

/**
 * Vertex step mode (per-vertex or per-instance).
 */
export type VertexStepMode = "vertex" | "instance";

/**
 * Single vertex attribute description.
 */
export interface GfxVertexAttribute {
  /** Vertex format */
  format: VertexFormat;
  /** Byte offset within the vertex */
  offset: number;
  /** Shader location (must match shader input) */
  shaderLocation: number;
}

/**
 * Vertex buffer layout description.
 */
export interface GfxVertexBufferLayout {
  /** Byte stride between vertices */
  arrayStride: number;
  /** Step mode */
  stepMode?: VertexStepMode;
  /** Attributes in this buffer */
  attributes: GfxVertexAttribute[];
}

// ============================================================================
// Semantic Vertex Layout Builder
// ============================================================================

/**
 * Common vertex attribute semantics.
 */
export type VertexSemantic = "position" | "normal" | "tangent" | "texcoord0" | "texcoord1" | "color0" | "color1" | "joints0" | "weights0";

/**
 * Default shader locations for semantics.
 */
export const SemanticLocations: Record<VertexSemantic, number> = {
  position: 0,
  normal: 1,
  tangent: 2,
  texcoord0: 3,
  texcoord1: 4,
  color0: 5,
  color1: 6,
  joints0: 7,
  weights0: 8,
};

/**
 * Builder for creating vertex buffer layouts.
 */
export class VertexLayoutBuilder {
  private attributes: GfxVertexAttribute[] = [];
  private currentOffset = 0;
  private stepMode: VertexStepMode = "vertex";

  /**
   * Set step mode.
   */
  setStepMode(mode: VertexStepMode): this {
    this.stepMode = mode;
    return this;
  }

  /**
   * Add an attribute by semantic.
   */
  addSemantic(semantic: VertexSemantic, format: VertexFormat): this {
    return this.addAttribute(SemanticLocations[semantic], format);
  }

  /**
   * Add an attribute by location.
   */
  addAttribute(shaderLocation: number, format: VertexFormat): this {
    this.attributes.push({
      format,
      offset: this.currentOffset,
      shaderLocation,
    });
    this.currentOffset += getVertexFormatByteSize(format);
    return this;
  }

  /**
   * Add padding bytes.
   */
  addPadding(bytes: number): this {
    this.currentOffset += bytes;
    return this;
  }

  /**
   * Build the vertex buffer layout.
   */
  build(): GfxVertexBufferLayout {
    return {
      arrayStride: this.currentOffset,
      stepMode: this.stepMode,
      attributes: [...this.attributes],
    };
  }

  /**
   * Get the current stride.
   */
  getStride(): number {
    return this.currentOffset;
  }
}

// ============================================================================
// Common Vertex Layouts
// ============================================================================

/**
 * Create a layout builder.
 */
export function vertexLayout(): VertexLayoutBuilder {
  return new VertexLayoutBuilder();
}

/**
 * Position-only layout (vec3).
 */
export const VERTEX_LAYOUT_POSITION: GfxVertexBufferLayout = {
  arrayStride: 12,
  attributes: [{ format: "float32x3", offset: 0, shaderLocation: 0 }],
};

/**
 * Position + UV layout (vec3 + vec2).
 */
export const VERTEX_LAYOUT_POSITION_UV: GfxVertexBufferLayout = {
  arrayStride: 20,
  attributes: [
    { format: "float32x3", offset: 0, shaderLocation: 0 },
    { format: "float32x2", offset: 12, shaderLocation: 3 },
  ],
};

/**
 * Position + Normal layout (vec3 + vec3).
 */
export const VERTEX_LAYOUT_POSITION_NORMAL: GfxVertexBufferLayout = {
  arrayStride: 24,
  attributes: [
    { format: "float32x3", offset: 0, shaderLocation: 0 },
    { format: "float32x3", offset: 12, shaderLocation: 1 },
  ],
};

/**
 * Position + Normal + UV layout (vec3 + vec3 + vec2).
 */
export const VERTEX_LAYOUT_POSITION_NORMAL_UV: GfxVertexBufferLayout = {
  arrayStride: 32,
  attributes: [
    { format: "float32x3", offset: 0, shaderLocation: 0 },
    { format: "float32x3", offset: 12, shaderLocation: 1 },
    { format: "float32x2", offset: 24, shaderLocation: 3 },
  ],
};

/**
 * Position + Color layout (vec3 + vec4).
 */
export const VERTEX_LAYOUT_POSITION_COLOR: GfxVertexBufferLayout = {
  arrayStride: 28,
  attributes: [
    { format: "float32x3", offset: 0, shaderLocation: 0 },
    { format: "float32x4", offset: 12, shaderLocation: 5 },
  ],
};

/**
 * Full PBR layout (position + normal + tangent + uv).
 */
export const VERTEX_LAYOUT_PBR: GfxVertexBufferLayout = {
  arrayStride: 48,
  attributes: [
    { format: "float32x3", offset: 0, shaderLocation: 0 }, // position
    { format: "float32x3", offset: 12, shaderLocation: 1 }, // normal
    { format: "float32x4", offset: 24, shaderLocation: 2 }, // tangent (xyz + handedness)
    { format: "float32x2", offset: 40, shaderLocation: 3 }, // texcoord0
  ],
};

// ============================================================================
// Index Buffer Types
// ============================================================================

/**
 * Index buffer state for render pipeline.
 */
export interface IndexState {
  /** Index format */
  format: IndexFormat;
}

/**
 * Calculate index count from buffer size.
 */
export function calculateIndexCount(bufferSize: number, format: IndexFormat): number {
  return format === "uint16" ? bufferSize / 2 : bufferSize / 4;
}
