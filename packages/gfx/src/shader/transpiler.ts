/**
 * @arcanvas/gfx - Shader transpilation
 *
 * Utilities for WGSL to GLSL transpilation.
 * This is a simplified transpiler for common patterns.
 * For production, consider using naga-wasm or similar.
 */

import type { ShaderBinding, ShaderReflection, ShaderStageReflection } from "../pipeline/shader.js";

// ============================================================================
// WGSL Parsing (Simplified)
// ============================================================================

/**
 * Parsed WGSL binding info.
 */
interface WgslBinding {
  group: number;
  binding: number;
  name: string;
  type: string;
  resourceType: "uniform" | "storage" | "texture" | "sampler";
}

/**
 * Parse binding declarations from WGSL.
 * Very simplified - handles common patterns.
 */
export function parseWgslBindings(wgsl: string): WgslBinding[] {
  const bindings: WgslBinding[] = [];

  // Match @group(N) @binding(M) var<...> name: type;
  const bindingRegex = /@group\((\d+)\)\s*@binding\((\d+)\)\s*var(<([^>]+)>)?\s+(\w+)\s*:\s*([^;]+);/g;

  let match;
  while ((match = bindingRegex.exec(wgsl)) !== null) {
    const groupStr = match[1];
    const bindingStr = match[2];
    const qualifier = match[4] ?? "";
    const name = match[5];
    const typeStr = match[6];

    if (!groupStr || !bindingStr || !name || !typeStr) continue;

    const group = parseInt(groupStr, 10);
    const binding = parseInt(bindingStr, 10);
    const type = typeStr.trim();

    let resourceType: WgslBinding["resourceType"] = "uniform";
    if (qualifier.includes("storage")) {
      resourceType = "storage";
    } else if (type.startsWith("texture")) {
      resourceType = "texture";
    } else if (type.startsWith("sampler")) {
      resourceType = "sampler";
    }

    bindings.push({ group, binding, name, type, resourceType });
  }

  return bindings;
}

/**
 * Parse entry points from WGSL.
 */
export function parseWgslEntryPoints(wgsl: string): Array<{ name: string; stage: "vertex" | "fragment" | "compute" }> {
  const entries: Array<{ name: string; stage: "vertex" | "fragment" | "compute" }> = [];

  // Match @vertex/@fragment/@compute fn name(
  const entryRegex = /@(vertex|fragment|compute)\s+fn\s+(\w+)\s*\(/g;

  let match;
  while ((match = entryRegex.exec(wgsl)) !== null) {
    const stage = match[1];
    const name = match[2];
    if (stage && name && (stage === "vertex" || stage === "fragment" || stage === "compute")) {
      entries.push({ stage, name });
    }
  }

  return entries;
}

// ============================================================================
// WGSL to GLSL Type Mapping
// ============================================================================

const WGSL_TO_GLSL_TYPES: Record<string, string> = {
  // Scalars
  f32: "float",
  i32: "int",
  u32: "uint",
  bool: "bool",
  // Vectors
  "vec2<f32>": "vec2",
  vec2f: "vec2",
  "vec3<f32>": "vec3",
  vec3f: "vec3",
  "vec4<f32>": "vec4",
  vec4f: "vec4",
  "vec2<i32>": "ivec2",
  vec2i: "ivec2",
  "vec3<i32>": "ivec3",
  vec3i: "ivec3",
  "vec4<i32>": "ivec4",
  vec4i: "ivec4",
  "vec2<u32>": "uvec2",
  vec2u: "uvec2",
  "vec3<u32>": "uvec3",
  vec3u: "uvec3",
  "vec4<u32>": "uvec4",
  vec4u: "uvec4",
  // Matrices
  "mat2x2<f32>": "mat2",
  mat2x2f: "mat2",
  "mat3x3<f32>": "mat3",
  mat3x3f: "mat3",
  "mat4x4<f32>": "mat4",
  mat4x4f: "mat4",
  // Textures (simplified)
  "texture_2d<f32>": "sampler2D",
  "texture_cube<f32>": "samplerCube",
  "texture_2d_array<f32>": "sampler2DArray",
  "texture_3d<f32>": "sampler3D",
  texture_depth_2d: "sampler2DShadow",
};

/**
 * Convert a WGSL type to GLSL.
 */
export function wgslTypeToGlsl(wgslType: string): string {
  // Try direct mapping
  const direct = WGSL_TO_GLSL_TYPES[wgslType];
  if (direct) return direct;

  // Try removing whitespace
  const normalized = wgslType.replace(/\s+/g, "");
  const normalizedMatch = WGSL_TO_GLSL_TYPES[normalized];
  if (normalizedMatch) return normalizedMatch;

  // Array types: array<T, N> -> T[N]
  const arrayMatch = wgslType.match(/array<([^,]+),\s*(\d+)>/);
  if (arrayMatch && arrayMatch[1] && arrayMatch[2]) {
    const elementType = wgslTypeToGlsl(arrayMatch[1].trim());
    return `${elementType}[${arrayMatch[2]}]`;
  }

  // Default: return as-is (might be a struct name)
  return wgslType;
}

// ============================================================================
// Simple Reflection
// ============================================================================

/**
 * Perform simple reflection on WGSL source.
 */
export function reflectWgsl(wgsl: string): ShaderReflection {
  const bindings = parseWgslBindings(wgsl);
  const entries = parseWgslEntryPoints(wgsl);

  const shaderBindings: ShaderBinding[] = bindings.map((b) => {
    let type: ShaderBinding["type"];
    switch (b.resourceType) {
      case "uniform":
        type = "uniform-buffer";
        break;
      case "storage":
        type = "storage-buffer";
        break;
      case "texture":
        type = "sampled-texture";
        break;
      case "sampler":
        type = b.type.includes("comparison") ? "comparison-sampler" : "sampler";
        break;
    }

    return {
      name: b.name,
      group: b.group,
      binding: b.binding,
      type,
      visibility: 0, // Would need more parsing to determine
    };
  });

  const stages: ShaderStageReflection[] = entries.map((e) => ({
    entryPoint: e.name,
    stage: e.stage,
    bindings: shaderBindings, // Simplified: all bindings for all stages
  }));

  // Calculate bind group count
  const maxGroup = bindings.reduce((max, b) => Math.max(max, b.group), -1);

  return {
    stages,
    bindings: shaderBindings,
    bindGroupCount: maxGroup + 1,
  };
}

// ============================================================================
// Transpilation Hints
// ============================================================================

/**
 * Hints for transpilation.
 */
export interface TranspileHints {
  /** Map bind group+binding to GLSL uniform block binding */
  uniformBlockBindings?: Map<string, number>;
  /** Map bind group+binding to GLSL texture unit */
  textureUnits?: Map<string, number>;
  /** Custom type mappings */
  typeOverrides?: Record<string, string>;
}

/**
 * Generate a binding key for lookup.
 */
export function bindingKey(group: number, binding: number): string {
  return `${group}:${binding}`;
}

// ============================================================================
// Note on Full Transpilation
// ============================================================================

/**
 * IMPORTANT: Full WGSL to GLSL transpilation is complex.
 *
 * This module provides basic utilities for:
 * - Parsing bindings and entry points
 * - Type mapping
 * - Reflection
 *
 * For production use, consider:
 * - naga (via WASM): https://github.com/gfx-rs/naga
 * - tint (via native addon): https://dawn.googlesource.com/tint
 * - Pre-compiled shaders in build step
 *
 * The WebGL2 adapter should use pre-compiled GLSL or integrate
 * a full transpiler for runtime compilation.
 */
export const TRANSPILER_NOTE = `
This is a simplified shader utility module.
For full WGSL to GLSL ES 3.00 transpilation, integrate:
- naga-wasm for runtime transpilation
- Build-time transpilation with naga CLI
- Maintain parallel WGSL + GLSL sources
`;
