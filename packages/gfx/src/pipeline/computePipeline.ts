/**
 * @arcanvas/gfx - Compute pipeline
 *
 * Pipeline for GPU compute operations.
 */

import type { GfxShaderModule } from "./shader.js";
import type { GfxPipelineLayout, GfxBindGroupLayout } from "./bindGroup.js";

// ============================================================================
// Compute Pipeline Descriptor
// ============================================================================

/**
 * Compute stage configuration.
 */
export interface GfxComputeState {
  /** Shader module containing compute entry point */
  module: GfxShaderModule;
  /** Entry point function name (default: "main" or "cs_main") */
  entryPoint?: string;
  /** Constants for pipeline-overridable constants */
  constants?: Record<string, number>;
}

/**
 * Descriptor for creating a compute pipeline.
 */
export interface GfxComputePipelineDescriptor {
  /** Debug label */
  label?: string;
  /** Pipeline layout (explicit) or "auto" for automatic layout */
  layout: GfxPipelineLayout | "auto";
  /** Compute stage */
  compute: GfxComputeState;
}

// ============================================================================
// Compute Pipeline Interface
// ============================================================================

/**
 * Opaque compute pipeline handle.
 */
export interface GfxComputePipeline {
  /** Debug label */
  readonly label: string | undefined;

  /**
   * Get the bind group layout for a specific group.
   * Only available if pipeline was created with layout: "auto".
   */
  getBindGroupLayout(groupIndex: number): GfxBindGroupLayout;
}

// ============================================================================
// Compute Helpers
// ============================================================================

/**
 * Calculate dispatch dimensions for a given work size.
 *
 * @param totalSize - Total work items
 * @param workgroupSize - Workgroup size (threads per group)
 * @returns Number of workgroups to dispatch
 */
export function calculateDispatchSize(totalSize: number, workgroupSize: number): number {
  return Math.ceil(totalSize / workgroupSize);
}

/**
 * Calculate 2D dispatch dimensions.
 */
export function calculateDispatchSize2D(width: number, height: number, workgroupSizeX: number, workgroupSizeY: number): [number, number] {
  return [Math.ceil(width / workgroupSizeX), Math.ceil(height / workgroupSizeY)];
}

/**
 * Calculate 3D dispatch dimensions.
 */
export function calculateDispatchSize3D(width: number, height: number, depth: number, workgroupSizeX: number, workgroupSizeY: number, workgroupSizeZ: number): [number, number, number] {
  return [Math.ceil(width / workgroupSizeX), Math.ceil(height / workgroupSizeY), Math.ceil(depth / workgroupSizeZ)];
}

/**
 * Workgroup size configuration.
 */
export interface WorkgroupSize {
  x: number;
  y?: number;
  z?: number;
}

/**
 * Common workgroup size presets.
 */
export const WorkgroupPresets = {
  /** 64 threads, 1D */
  LINEAR_64: { x: 64, y: 1, z: 1 } satisfies Required<WorkgroupSize>,
  /** 256 threads, 1D */
  LINEAR_256: { x: 256, y: 1, z: 1 } satisfies Required<WorkgroupSize>,
  /** 8x8 threads, 2D (64 total) */
  TILE_8x8: { x: 8, y: 8, z: 1 } satisfies Required<WorkgroupSize>,
  /** 16x16 threads, 2D (256 total) */
  TILE_16x16: { x: 16, y: 16, z: 1 } satisfies Required<WorkgroupSize>,
  /** 4x4x4 threads, 3D (64 total) */
  CUBE_4x4x4: { x: 4, y: 4, z: 4 } satisfies Required<WorkgroupSize>,
} as const;
