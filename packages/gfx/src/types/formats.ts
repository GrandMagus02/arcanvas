/**
 * @arcanvas/gfx - GPU texture and vertex formats
 *
 * WebGPU-style format definitions with capability flags for backend compatibility.
 */

// ============================================================================
// Texture Formats
// ============================================================================

/**
 * Texture format enumeration.
 * WebGPU-aligned with WebGL2 compatibility annotations.
 */
export type TextureFormat =
  // 8-bit formats
  | "r8unorm"
  | "r8snorm"
  | "r8uint"
  | "r8sint"
  // 16-bit formats
  | "r16uint"
  | "r16sint"
  | "r16float"
  | "rg8unorm"
  | "rg8snorm"
  | "rg8uint"
  | "rg8sint"
  // 32-bit formats
  | "r32uint"
  | "r32sint"
  | "r32float"
  | "rg16uint"
  | "rg16sint"
  | "rg16float"
  | "rgba8unorm"
  | "rgba8unorm-srgb"
  | "rgba8snorm"
  | "rgba8uint"
  | "rgba8sint"
  | "bgra8unorm"
  | "bgra8unorm-srgb"
  // Packed 32-bit formats
  | "rgb9e5ufloat"
  | "rgb10a2uint"
  | "rgb10a2unorm"
  | "rg11b10ufloat"
  // 64-bit formats
  | "rg32uint"
  | "rg32sint"
  | "rg32float"
  | "rgba16uint"
  | "rgba16sint"
  | "rgba16float"
  // 128-bit formats
  | "rgba32uint"
  | "rgba32sint"
  | "rgba32float"
  // Depth/stencil formats
  | "depth16unorm"
  | "depth24plus"
  | "depth24plus-stencil8"
  | "depth32float"
  | "depth32float-stencil8"
  | "stencil8"
  // Compressed formats (BC)
  | "bc1-rgba-unorm"
  | "bc1-rgba-unorm-srgb"
  | "bc2-rgba-unorm"
  | "bc2-rgba-unorm-srgb"
  | "bc3-rgba-unorm"
  | "bc3-rgba-unorm-srgb"
  | "bc4-r-unorm"
  | "bc4-r-snorm"
  | "bc5-rg-unorm"
  | "bc5-rg-snorm"
  | "bc6h-rgb-ufloat"
  | "bc6h-rgb-float"
  | "bc7-rgba-unorm"
  | "bc7-rgba-unorm-srgb"
  // Compressed formats (ETC2/EAC)
  | "etc2-rgb8unorm"
  | "etc2-rgb8unorm-srgb"
  | "etc2-rgb8a1unorm"
  | "etc2-rgb8a1unorm-srgb"
  | "etc2-rgba8unorm"
  | "etc2-rgba8unorm-srgb"
  | "eac-r11unorm"
  | "eac-r11snorm"
  | "eac-rg11unorm"
  | "eac-rg11snorm"
  // Compressed formats (ASTC)
  | "astc-4x4-unorm"
  | "astc-4x4-unorm-srgb"
  | "astc-5x4-unorm"
  | "astc-5x4-unorm-srgb"
  | "astc-5x5-unorm"
  | "astc-5x5-unorm-srgb"
  | "astc-6x5-unorm"
  | "astc-6x5-unorm-srgb"
  | "astc-6x6-unorm"
  | "astc-6x6-unorm-srgb"
  | "astc-8x5-unorm"
  | "astc-8x5-unorm-srgb"
  | "astc-8x6-unorm"
  | "astc-8x6-unorm-srgb"
  | "astc-8x8-unorm"
  | "astc-8x8-unorm-srgb"
  | "astc-10x5-unorm"
  | "astc-10x5-unorm-srgb"
  | "astc-10x6-unorm"
  | "astc-10x6-unorm-srgb"
  | "astc-10x8-unorm"
  | "astc-10x8-unorm-srgb"
  | "astc-10x10-unorm"
  | "astc-10x10-unorm-srgb"
  | "astc-12x10-unorm"
  | "astc-12x10-unorm-srgb"
  | "astc-12x12-unorm"
  | "astc-12x12-unorm-srgb";

// ============================================================================
// Vertex Formats
// ============================================================================

/**
 * Vertex attribute format.
 * Maps to WebGPU GPUVertexFormat with WebGL2 type mappings.
 */
export type VertexFormat =
  | "uint8x2"
  | "uint8x4"
  | "sint8x2"
  | "sint8x4"
  | "unorm8x2"
  | "unorm8x4"
  | "snorm8x2"
  | "snorm8x4"
  | "uint16x2"
  | "uint16x4"
  | "sint16x2"
  | "sint16x4"
  | "unorm16x2"
  | "unorm16x4"
  | "snorm16x2"
  | "snorm16x4"
  | "float16x2"
  | "float16x4"
  | "float32"
  | "float32x2"
  | "float32x3"
  | "float32x4"
  | "uint32"
  | "uint32x2"
  | "uint32x3"
  | "uint32x4"
  | "sint32"
  | "sint32x2"
  | "sint32x3"
  | "sint32x4"
  | "unorm10-10-10-2";

/**
 * Index format for index buffers.
 */
export type IndexFormat = "uint16" | "uint32";

// ============================================================================
// Format Info Helpers
// ============================================================================

/**
 * Information about a texture format.
 */
export interface TextureFormatInfo {
  /** Bytes per block (or pixel for non-compressed) */
  readonly bytesPerBlock: number;
  /** Block width for compressed formats, 1 otherwise */
  readonly blockWidth: number;
  /** Block height for compressed formats, 1 otherwise */
  readonly blockHeight: number;
  /** Whether format has color component */
  readonly hasColor: boolean;
  /** Whether format has depth component */
  readonly hasDepth: boolean;
  /** Whether format has stencil component */
  readonly hasStencil: boolean;
  /** Whether format is compressed */
  readonly isCompressed: boolean;
  /** Whether format is sRGB */
  readonly isSrgb: boolean;
  /** Number of components */
  readonly components: 1 | 2 | 3 | 4;
}

/**
 * Information about a vertex format.
 */
export interface VertexFormatInfo {
  /** Size in bytes */
  readonly byteSize: number;
  /** Number of components */
  readonly components: 1 | 2 | 3 | 4;
  /** Whether format is normalized */
  readonly normalized: boolean;
  /** Base type */
  readonly type: "float" | "int" | "uint";
}

/**
 * Get byte size of a vertex format.
 */
export function getVertexFormatByteSize(format: VertexFormat): number {
  const sizes: Record<VertexFormat, number> = {
    uint8x2: 2,
    uint8x4: 4,
    sint8x2: 2,
    sint8x4: 4,
    unorm8x2: 2,
    unorm8x4: 4,
    snorm8x2: 2,
    snorm8x4: 4,
    uint16x2: 4,
    uint16x4: 8,
    sint16x2: 4,
    sint16x4: 8,
    unorm16x2: 4,
    unorm16x4: 8,
    snorm16x2: 4,
    snorm16x4: 8,
    float16x2: 4,
    float16x4: 8,
    float32: 4,
    float32x2: 8,
    float32x3: 12,
    float32x4: 16,
    uint32: 4,
    uint32x2: 8,
    uint32x3: 12,
    uint32x4: 16,
    sint32: 4,
    sint32x2: 8,
    sint32x3: 12,
    sint32x4: 16,
    "unorm10-10-10-2": 4,
  };
  return sizes[format];
}

/**
 * Get component count of a vertex format.
 */
export function getVertexFormatComponentCount(format: VertexFormat): 1 | 2 | 3 | 4 {
  if (format.endsWith("x4") || format === "unorm10-10-10-2") return 4;
  if (format.endsWith("x3")) return 3;
  if (format.endsWith("x2")) return 2;
  return 1;
}

/**
 * Get byte size of an index format.
 */
export function getIndexFormatByteSize(format: IndexFormat): number {
  return format === "uint16" ? 2 : 4;
}

/**
 * Check if texture format is a depth format.
 */
export function isDepthFormat(format: TextureFormat): boolean {
  return format.startsWith("depth") || format === "stencil8";
}

/**
 * Check if texture format is a stencil format.
 */
export function isStencilFormat(format: TextureFormat): boolean {
  return format.includes("stencil") || format === "stencil8";
}

/**
 * Check if texture format is compressed.
 */
export function isCompressedFormat(format: TextureFormat): boolean {
  return format.startsWith("bc") || format.startsWith("etc") || format.startsWith("eac") || format.startsWith("astc");
}

/**
 * Check if texture format is sRGB.
 */
export function isSrgbFormat(format: TextureFormat): boolean {
  return format.includes("-srgb");
}
