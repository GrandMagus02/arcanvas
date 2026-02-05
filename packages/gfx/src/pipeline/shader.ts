/**
 * @arcanvas/gfx - Shader module
 *
 * Shader compilation and reflection system.
 * Supports WGSL as canonical format with GLSL for backend-specific paths.
 */

// ============================================================================
// Shader Source Types
// ============================================================================

/**
 * WGSL shader source (canonical format).
 */
export interface WgslShaderSource {
  readonly kind: "wgsl";
  /** WGSL source code */
  readonly code: string;
  /** Optional source map for debugging */
  readonly sourceMap?: string;
}

/**
 * GLSL shader source (backend-specific).
 */
export interface GlslShaderSource {
  readonly kind: "glsl";
  /** Shader stage */
  readonly stage: "vertex" | "fragment" | "compute";
  /** GLSL source code */
  readonly code: string;
  /** GLSL version (e.g., "300 es") */
  readonly version?: string;
}

/**
 * SPIR-V shader source (for future Vulkan/native backends).
 */
export interface SpirvShaderSource {
  readonly kind: "spirv";
  /** SPIR-V bytecode */
  readonly bytes: Uint32Array;
  /** Entry point name */
  readonly entryPoint?: string;
}

/**
 * Union of all shader source types.
 */
export type ShaderSource = WgslShaderSource | GlslShaderSource | SpirvShaderSource;

// ============================================================================
// Shader Module Descriptor
// ============================================================================

/**
 * Descriptor for creating a shader module.
 */
export interface GfxShaderModuleDescriptor {
  /** Debug label */
  label?: string;
  /** Shader source(s) - provide multiple for cross-backend support */
  sources: ShaderSource[];
  /** Compile-time defines/constants */
  defines?: Record<string, string | number | boolean>;
  /** Hints for compilation (e.g., entry points, optimization level) */
  hints?: ShaderCompilationHints;
}

/**
 * Hints for shader compilation.
 */
export interface ShaderCompilationHints {
  /** Entry point layouts for pipeline creation optimization */
  layout?: {
    /** Entry point name */
    entryPoint: string;
    /** Bind group layout hints */
    bindGroupLayouts?: unknown[];
  }[];
}

// ============================================================================
// Shader Module Interface
// ============================================================================

/**
 * Compiled shader module handle.
 */
export interface GfxShaderModule {
  /** Debug label */
  readonly label: string | undefined;

  /**
   * Get compilation info/warnings.
   * Returns empty array if no issues.
   */
  getCompilationInfo(): Promise<ShaderCompilationMessage[]>;
}

/**
 * Shader compilation message (warning or info).
 */
export interface ShaderCompilationMessage {
  /** Message text */
  readonly message: string;
  /** Message type */
  readonly type: "error" | "warning" | "info";
  /** Line number (1-based, if known) */
  readonly lineNum?: number;
  /** Column position (1-based, if known) */
  readonly linePos?: number;
  /** Byte offset in source */
  readonly offset?: number;
  /** Length of the problematic region */
  readonly length?: number;
}

// ============================================================================
// Shader Reflection Types
// ============================================================================

/**
 * Reflected binding type.
 */
export type ShaderBindingType = "uniform-buffer" | "storage-buffer" | "storage-buffer-readonly" | "sampler" | "comparison-sampler" | "sampled-texture" | "storage-texture" | "external-texture";

/**
 * Reflected shader binding.
 */
export interface ShaderBinding {
  /** Binding name in shader */
  readonly name: string;
  /** Bind group index */
  readonly group: number;
  /** Binding index within group */
  readonly binding: number;
  /** Binding type */
  readonly type: ShaderBindingType;
  /** Visibility flags (ShaderStage) */
  readonly visibility: number;
  /** For buffers: minimum size */
  readonly minBufferSize?: number;
  /** For textures: sample type */
  readonly textureSampleType?: "float" | "unfilterable-float" | "depth" | "sint" | "uint";
  /** For textures: view dimension */
  readonly textureViewDimension?: string;
  /** For textures: multisampled */
  readonly textureMultisampled?: boolean;
  /** For storage textures: format */
  readonly storageTextureFormat?: string;
  /** For storage textures: access */
  readonly storageTextureAccess?: "write-only" | "read-only" | "read-write";
}

/**
 * Reflected vertex attribute.
 */
export interface ShaderVertexAttribute {
  /** Attribute name */
  readonly name: string;
  /** Shader location */
  readonly location: number;
  /** Type (e.g., "vec4<f32>") */
  readonly type: string;
}

/**
 * Reflected shader stage.
 */
export interface ShaderStageReflection {
  /** Entry point name */
  readonly entryPoint: string;
  /** Stage type */
  readonly stage: "vertex" | "fragment" | "compute";
  /** Bindings used by this stage */
  readonly bindings: ShaderBinding[];
  /** For vertex shaders: input attributes */
  readonly vertexInputs?: ShaderVertexAttribute[];
  /** For compute shaders: workgroup size */
  readonly workgroupSize?: [number, number, number];
}

/**
 * Full shader reflection data.
 */
export interface ShaderReflection {
  /** All reflected stages */
  readonly stages: ShaderStageReflection[];
  /** All unique bindings across stages */
  readonly bindings: ShaderBinding[];
  /** Bind group count */
  readonly bindGroupCount: number;
}

// ============================================================================
// Shader Helpers
// ============================================================================

/**
 * Create a WGSL shader source.
 */
export function wgsl(code: string, sourceMap?: string): WgslShaderSource {
  return { kind: "wgsl", code, sourceMap };
}

/**
 * Create a GLSL vertex shader source.
 */
export function glslVertex(code: string, version: string = "300 es"): GlslShaderSource {
  return { kind: "glsl", stage: "vertex", code, version };
}

/**
 * Create a GLSL fragment shader source.
 */
export function glslFragment(code: string, version: string = "300 es"): GlslShaderSource {
  return { kind: "glsl", stage: "fragment", code, version };
}

/**
 * Create a GLSL compute shader source.
 */
export function glslCompute(code: string, version: string = "310 es"): GlslShaderSource {
  return { kind: "glsl", stage: "compute", code, version };
}

/**
 * Find a shader source of specific kind.
 */
export function findShaderSource<K extends ShaderSource["kind"]>(sources: ShaderSource[], kind: K): Extract<ShaderSource, { kind: K }> | undefined {
  return sources.find((s) => s.kind === kind) as Extract<ShaderSource, { kind: K }> | undefined;
}

/**
 * Apply defines to shader source code.
 * Handles both WGSL and GLSL syntax.
 */
export function applyShaderDefines(code: string, defines: Record<string, string | number | boolean>, isWgsl: boolean): string {
  const defineLines = Object.entries(defines).map(([key, value]) => {
    const strValue = typeof value === "boolean" ? (value ? "1" : "0") : String(value);
    if (isWgsl) {
      // WGSL: use const override or simple replacement
      return `const ${key}: u32 = ${strValue};`;
    } else {
      // GLSL: use #define
      return `#define ${key} ${strValue}`;
    }
  });

  if (isWgsl) {
    // For WGSL, prepend constants
    return defineLines.join("\n") + "\n" + code;
  } else {
    // For GLSL, insert after #version
    const versionMatch = code.match(/^(#version[^\n]*\n)/);
    if (versionMatch && versionMatch[1]) {
      const afterVersion = code.slice(versionMatch[1].length);
      return versionMatch[1] + defineLines.join("\n") + "\n" + afterVersion;
    }
    return defineLines.join("\n") + "\n" + code;
  }
}
