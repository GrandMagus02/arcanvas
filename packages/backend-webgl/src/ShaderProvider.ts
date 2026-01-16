import type { BaseMaterial } from "@arcanvas/graphics";

/**
 * Shader source definition for a material.
 */
export interface ShaderSource {
  vertex: string;
  fragment: string;
}

/**
 * Draw configuration for custom materials.
 */
export interface CustomDrawConfig {
  /** Number of position components (2 or 3) */
  positionComponents: 2 | 3;
  /** Whether to disable depth write during rendering */
  disableDepthWrite?: boolean;
  /** Custom uniform setter function */
  setUniforms?: (gl: WebGLRenderingContext, program: WebGLProgram, material: BaseMaterial, context: UniformContext) => void;
}

/**
 * Context passed to uniform setters.
 */
export interface UniformContext {
  viewMatrix: Float32Array;
  projMatrix: Float32Array;
  modelMatrix: Float32Array;
  cameraPosition: [number, number, number];
  viewportWidth: number;
  viewportHeight: number;
}

/**
 * Interface for materials that provide their own shaders.
 */
export interface ShaderProvider {
  getShaderSource(): ShaderSource;
  getDrawConfig(): CustomDrawConfig;
}

/**
 * Type guard to check if a material implements ShaderProvider.
 */
export function isShaderProvider(material: BaseMaterial): material is BaseMaterial & ShaderProvider {
  return typeof (material as ShaderProvider).getShaderSource === "function" && typeof (material as ShaderProvider).getDrawConfig === "function";
}
