/**
 * @arcanvas/webgl2 - WebGL2 constants and mappings
 */

import type { TextureFormat, VertexFormat, IndexFormat, PrimitiveTopology, CompareFunction, StencilOperation, BlendFactor, BlendOperation, CullMode, FrontFace } from "@arcanvas/gfx";

// ============================================================================
// Texture Format Mapping
// ============================================================================

/**
 * WebGL2 texture format information.
 */
export interface GLTextureFormat {
  internalFormat: GLenum;
  format: GLenum;
  type: GLenum;
}

/**
 * Get WebGL2 texture format for a GFX texture format.
 */
export function getGLTextureFormat(format: TextureFormat, gl: WebGL2RenderingContext): GLTextureFormat | null {
  const formats: Partial<Record<TextureFormat, GLTextureFormat>> = {
    // 8-bit formats
    r8unorm: { internalFormat: gl.R8, format: gl.RED, type: gl.UNSIGNED_BYTE },
    r8snorm: { internalFormat: gl.R8_SNORM, format: gl.RED, type: gl.BYTE },
    r8uint: { internalFormat: gl.R8UI, format: gl.RED_INTEGER, type: gl.UNSIGNED_BYTE },
    r8sint: { internalFormat: gl.R8I, format: gl.RED_INTEGER, type: gl.BYTE },

    // 16-bit formats
    r16uint: { internalFormat: gl.R16UI, format: gl.RED_INTEGER, type: gl.UNSIGNED_SHORT },
    r16sint: { internalFormat: gl.R16I, format: gl.RED_INTEGER, type: gl.SHORT },
    r16float: { internalFormat: gl.R16F, format: gl.RED, type: gl.HALF_FLOAT },
    rg8unorm: { internalFormat: gl.RG8, format: gl.RG, type: gl.UNSIGNED_BYTE },
    rg8snorm: { internalFormat: gl.RG8_SNORM, format: gl.RG, type: gl.BYTE },
    rg8uint: { internalFormat: gl.RG8UI, format: gl.RG_INTEGER, type: gl.UNSIGNED_BYTE },
    rg8sint: { internalFormat: gl.RG8I, format: gl.RG_INTEGER, type: gl.BYTE },

    // 32-bit formats
    r32uint: { internalFormat: gl.R32UI, format: gl.RED_INTEGER, type: gl.UNSIGNED_INT },
    r32sint: { internalFormat: gl.R32I, format: gl.RED_INTEGER, type: gl.INT },
    r32float: { internalFormat: gl.R32F, format: gl.RED, type: gl.FLOAT },
    rg16uint: { internalFormat: gl.RG16UI, format: gl.RG_INTEGER, type: gl.UNSIGNED_SHORT },
    rg16sint: { internalFormat: gl.RG16I, format: gl.RG_INTEGER, type: gl.SHORT },
    rg16float: { internalFormat: gl.RG16F, format: gl.RG, type: gl.HALF_FLOAT },
    rgba8unorm: { internalFormat: gl.RGBA8, format: gl.RGBA, type: gl.UNSIGNED_BYTE },
    "rgba8unorm-srgb": { internalFormat: gl.SRGB8_ALPHA8, format: gl.RGBA, type: gl.UNSIGNED_BYTE },
    rgba8snorm: { internalFormat: gl.RGBA8_SNORM, format: gl.RGBA, type: gl.BYTE },
    rgba8uint: { internalFormat: gl.RGBA8UI, format: gl.RGBA_INTEGER, type: gl.UNSIGNED_BYTE },
    rgba8sint: { internalFormat: gl.RGBA8I, format: gl.RGBA_INTEGER, type: gl.BYTE },
    bgra8unorm: { internalFormat: gl.RGBA8, format: gl.RGBA, type: gl.UNSIGNED_BYTE }, // Note: needs swizzle

    // 64-bit formats
    rg32uint: { internalFormat: gl.RG32UI, format: gl.RG_INTEGER, type: gl.UNSIGNED_INT },
    rg32sint: { internalFormat: gl.RG32I, format: gl.RG_INTEGER, type: gl.INT },
    rg32float: { internalFormat: gl.RG32F, format: gl.RG, type: gl.FLOAT },
    rgba16uint: { internalFormat: gl.RGBA16UI, format: gl.RGBA_INTEGER, type: gl.UNSIGNED_SHORT },
    rgba16sint: { internalFormat: gl.RGBA16I, format: gl.RGBA_INTEGER, type: gl.SHORT },
    rgba16float: { internalFormat: gl.RGBA16F, format: gl.RGBA, type: gl.HALF_FLOAT },

    // 128-bit formats
    rgba32uint: { internalFormat: gl.RGBA32UI, format: gl.RGBA_INTEGER, type: gl.UNSIGNED_INT },
    rgba32sint: { internalFormat: gl.RGBA32I, format: gl.RGBA_INTEGER, type: gl.INT },
    rgba32float: { internalFormat: gl.RGBA32F, format: gl.RGBA, type: gl.FLOAT },

    // Depth/stencil formats
    depth16unorm: { internalFormat: gl.DEPTH_COMPONENT16, format: gl.DEPTH_COMPONENT, type: gl.UNSIGNED_SHORT },
    depth24plus: { internalFormat: gl.DEPTH_COMPONENT24, format: gl.DEPTH_COMPONENT, type: gl.UNSIGNED_INT },
    "depth24plus-stencil8": { internalFormat: gl.DEPTH24_STENCIL8, format: gl.DEPTH_STENCIL, type: gl.UNSIGNED_INT_24_8 },
    depth32float: { internalFormat: gl.DEPTH_COMPONENT32F, format: gl.DEPTH_COMPONENT, type: gl.FLOAT },
  };

  return formats[format] ?? null;
}

// ============================================================================
// Vertex Format Mapping
// ============================================================================

/**
 * WebGL2 vertex format information.
 */
export interface GLVertexFormat {
  size: number;
  type: GLenum;
  normalized: boolean;
}

/**
 * Get WebGL2 vertex format for a GFX vertex format.
 */
export function getGLVertexFormat(format: VertexFormat, gl: WebGL2RenderingContext): GLVertexFormat {
  const formats: Partial<Record<VertexFormat, GLVertexFormat>> = {
    uint8x2: { size: 2, type: gl.UNSIGNED_BYTE, normalized: false },
    uint8x4: { size: 4, type: gl.UNSIGNED_BYTE, normalized: false },
    sint8x2: { size: 2, type: gl.BYTE, normalized: false },
    sint8x4: { size: 4, type: gl.BYTE, normalized: false },
    unorm8x2: { size: 2, type: gl.UNSIGNED_BYTE, normalized: true },
    unorm8x4: { size: 4, type: gl.UNSIGNED_BYTE, normalized: true },
    snorm8x2: { size: 2, type: gl.BYTE, normalized: true },
    snorm8x4: { size: 4, type: gl.BYTE, normalized: true },
    uint16x2: { size: 2, type: gl.UNSIGNED_SHORT, normalized: false },
    uint16x4: { size: 4, type: gl.UNSIGNED_SHORT, normalized: false },
    sint16x2: { size: 2, type: gl.SHORT, normalized: false },
    sint16x4: { size: 4, type: gl.SHORT, normalized: false },
    unorm16x2: { size: 2, type: gl.UNSIGNED_SHORT, normalized: true },
    unorm16x4: { size: 4, type: gl.UNSIGNED_SHORT, normalized: true },
    snorm16x2: { size: 2, type: gl.SHORT, normalized: true },
    snorm16x4: { size: 4, type: gl.SHORT, normalized: true },
    float16x2: { size: 2, type: gl.HALF_FLOAT, normalized: false },
    float16x4: { size: 4, type: gl.HALF_FLOAT, normalized: false },
    float32: { size: 1, type: gl.FLOAT, normalized: false },
    float32x2: { size: 2, type: gl.FLOAT, normalized: false },
    float32x3: { size: 3, type: gl.FLOAT, normalized: false },
    float32x4: { size: 4, type: gl.FLOAT, normalized: false },
    uint32: { size: 1, type: gl.UNSIGNED_INT, normalized: false },
    uint32x2: { size: 2, type: gl.UNSIGNED_INT, normalized: false },
    uint32x3: { size: 3, type: gl.UNSIGNED_INT, normalized: false },
    uint32x4: { size: 4, type: gl.UNSIGNED_INT, normalized: false },
    sint32: { size: 1, type: gl.INT, normalized: false },
    sint32x2: { size: 2, type: gl.INT, normalized: false },
    sint32x3: { size: 3, type: gl.INT, normalized: false },
    sint32x4: { size: 4, type: gl.INT, normalized: false },
    // Packed format - approximate with uint32
    "unorm10-10-10-2": { size: 4, type: gl.UNSIGNED_INT_2_10_10_10_REV, normalized: true },
  };

  const result = formats[format];
  if (!result) {
    throw new Error(`Unsupported vertex format: ${format}`);
  }
  return result;
}

// ============================================================================
// Index Format Mapping
// ============================================================================

/**
 * Get WebGL2 index type for a GFX index format.
 */
export function getGLIndexType(format: IndexFormat, gl: WebGL2RenderingContext): GLenum {
  return format === "uint16" ? gl.UNSIGNED_SHORT : gl.UNSIGNED_INT;
}

// ============================================================================
// Primitive Topology Mapping
// ============================================================================

/**
 * Get WebGL2 primitive mode for a GFX topology.
 */
export function getGLPrimitiveMode(topology: PrimitiveTopology, gl: WebGL2RenderingContext): GLenum {
  const modes: Record<PrimitiveTopology, GLenum> = {
    "point-list": gl.POINTS,
    "line-list": gl.LINES,
    "line-strip": gl.LINE_STRIP,
    "triangle-list": gl.TRIANGLES,
    "triangle-strip": gl.TRIANGLE_STRIP,
  };
  return modes[topology];
}

// ============================================================================
// Compare Function Mapping
// ============================================================================

/**
 * Get WebGL2 compare function for a GFX compare function.
 */
export function getGLCompareFunc(func: CompareFunction, gl: WebGL2RenderingContext): GLenum {
  const funcs: Record<CompareFunction, GLenum> = {
    never: gl.NEVER,
    less: gl.LESS,
    equal: gl.EQUAL,
    "less-equal": gl.LEQUAL,
    greater: gl.GREATER,
    "not-equal": gl.NOTEQUAL,
    "greater-equal": gl.GEQUAL,
    always: gl.ALWAYS,
  };
  return funcs[func];
}

// ============================================================================
// Stencil Operation Mapping
// ============================================================================

/**
 * Get WebGL2 stencil operation for a GFX stencil operation.
 */
export function getGLStencilOp(op: StencilOperation, gl: WebGL2RenderingContext): GLenum {
  const ops: Record<StencilOperation, GLenum> = {
    keep: gl.KEEP,
    zero: gl.ZERO,
    replace: gl.REPLACE,
    invert: gl.INVERT,
    "increment-clamp": gl.INCR,
    "decrement-clamp": gl.DECR,
    "increment-wrap": gl.INCR_WRAP,
    "decrement-wrap": gl.DECR_WRAP,
  };
  return ops[op];
}

// ============================================================================
// Blend Factor Mapping
// ============================================================================

/**
 * Get WebGL2 blend factor for a GFX blend factor.
 */
export function getGLBlendFactor(factor: BlendFactor, gl: WebGL2RenderingContext): GLenum {
  const factors: Record<BlendFactor, GLenum> = {
    zero: gl.ZERO,
    one: gl.ONE,
    src: gl.SRC_COLOR,
    "one-minus-src": gl.ONE_MINUS_SRC_COLOR,
    "src-alpha": gl.SRC_ALPHA,
    "one-minus-src-alpha": gl.ONE_MINUS_SRC_ALPHA,
    dst: gl.DST_COLOR,
    "one-minus-dst": gl.ONE_MINUS_DST_COLOR,
    "dst-alpha": gl.DST_ALPHA,
    "one-minus-dst-alpha": gl.ONE_MINUS_DST_ALPHA,
    "src-alpha-saturated": gl.SRC_ALPHA_SATURATE,
    constant: gl.CONSTANT_COLOR,
    "one-minus-constant": gl.ONE_MINUS_CONSTANT_COLOR,
  };
  return factors[factor];
}

// ============================================================================
// Blend Operation Mapping
// ============================================================================

/**
 * Get WebGL2 blend operation for a GFX blend operation.
 */
export function getGLBlendOp(op: BlendOperation, gl: WebGL2RenderingContext): GLenum {
  const ops: Record<BlendOperation, GLenum> = {
    add: gl.FUNC_ADD,
    subtract: gl.FUNC_SUBTRACT,
    "reverse-subtract": gl.FUNC_REVERSE_SUBTRACT,
    min: gl.MIN,
    max: gl.MAX,
  };
  return ops[op];
}

// ============================================================================
// Cull Mode Mapping
// ============================================================================

/**
 * Get WebGL2 cull face for a GFX cull mode.
 */
export function getGLCullFace(mode: CullMode, gl: WebGL2RenderingContext): GLenum | null {
  if (mode === "none") return null;
  return mode === "front" ? gl.FRONT : gl.BACK;
}

// ============================================================================
// Front Face Mapping
// ============================================================================

/**
 * Get WebGL2 front face for a GFX front face.
 */
export function getGLFrontFace(face: FrontFace, gl: WebGL2RenderingContext): GLenum {
  return face === "ccw" ? gl.CCW : gl.CW;
}
