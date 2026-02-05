/**
 * @arcanvas/gfx - Resource usage flags
 *
 * WebGPU-style usage flags for buffers and textures.
 */

// ============================================================================
// Buffer Usage
// ============================================================================

/**
 * Buffer usage flags.
 * Combines multiple usages with bitwise OR.
 */
export const BufferUsage = {
  /** Buffer can be mapped for reading */
  MAP_READ: 0x0001,
  /** Buffer can be mapped for writing */
  MAP_WRITE: 0x0002,
  /** Buffer can be used as copy source */
  COPY_SRC: 0x0004,
  /** Buffer can be used as copy destination */
  COPY_DST: 0x0008,
  /** Buffer can be used as index buffer */
  INDEX: 0x0010,
  /** Buffer can be used as vertex buffer */
  VERTEX: 0x0020,
  /** Buffer can be used as uniform buffer */
  UNIFORM: 0x0040,
  /** Buffer can be used as storage buffer */
  STORAGE: 0x0080,
  /** Buffer can be used for indirect draw/dispatch */
  INDIRECT: 0x0100,
  /** Buffer can be used for query resolve */
  QUERY_RESOLVE: 0x0200,
} as const;

/**
 *
 */
export type BufferUsageFlags = number;

// ============================================================================
// Texture Usage
// ============================================================================

/**
 * Texture usage flags.
 * Combines multiple usages with bitwise OR.
 */
export const TextureUsage = {
  /** Texture can be used as copy source */
  COPY_SRC: 0x01,
  /** Texture can be used as copy destination */
  COPY_DST: 0x02,
  /** Texture can be sampled in shaders */
  TEXTURE_BINDING: 0x04,
  /** Texture can be used as storage texture */
  STORAGE_BINDING: 0x08,
  /** Texture can be used as render attachment */
  RENDER_ATTACHMENT: 0x10,
} as const;

/**
 *
 */
export type TextureUsageFlags = number;

// ============================================================================
// Shader Stage
// ============================================================================

/**
 * Shader stage flags for visibility in bind group layouts.
 */
export const ShaderStage = {
  /** Visible to vertex shader */
  VERTEX: 0x1,
  /** Visible to fragment shader */
  FRAGMENT: 0x2,
  /** Visible to compute shader */
  COMPUTE: 0x4,
} as const;

/**
 *
 */
export type ShaderStageFlags = number;

// ============================================================================
// Map Mode
// ============================================================================

/**
 * Buffer map mode for async mapping.
 */
export const MapMode = {
  /** Map for reading */
  READ: 0x1,
  /** Map for writing */
  WRITE: 0x2,
} as const;

/**
 *
 */
export type MapModeFlags = number;

// ============================================================================
// Color Write
// ============================================================================

/**
 * Color write mask flags.
 */
export const ColorWrite = {
  RED: 0x1,
  GREEN: 0x2,
  BLUE: 0x4,
  ALPHA: 0x8,
  ALL: 0xf,
} as const;

/**
 *
 */
export type ColorWriteFlags = number;
