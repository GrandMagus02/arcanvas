import type { BaseMaterial } from "./BaseMaterial";

/**
 * SDF/MSDF font type.
 */
export type SDFType = "sdf" | "msdf" | "mtsdf";

/**
 * Options for SDFTextMaterial.
 */
export interface SDFTextMaterialOptions {
  /** Atlas texture (WebGL texture or image/canvas to be uploaded) */
  atlas: WebGLTexture | HTMLImageElement | HTMLCanvasElement | ImageBitmap;
  /** Text color [r, g, b, a] */
  color?: [number, number, number, number];
  /** SDF type for shader selection */
  sdfType?: SDFType;
  /** Distance range used when generating the atlas (default: 4) */
  distanceRange?: number;
  /** Atlas texture size [width, height] in pixels */
  atlasSize?: [number, number];
  /** Enable double-sided rendering */
  doubleSided?: boolean;
}

/**
 * Shader source definition for a material.
 */
interface ShaderSource {
  vertex: string;
  fragment: string;
}

/**
 * Draw configuration for custom materials.
 */
interface CustomDrawConfig {
  positionComponents: 2 | 3;
  disableDepthWrite?: boolean;
  disableDepthTest?: boolean;
  /** Unique key for shader caching (differentiates MSDF vs SDF) */
  shaderKey?: string;
  setUniforms?: (gl: WebGLRenderingContext, program: WebGLProgram, material: BaseMaterial, context: UniformContext) => void;
}

/**
 * Context passed to uniform setters.
 */
interface UniformContext {
  viewMatrix: Float32Array;
  projMatrix: Float32Array;
  modelMatrix: Float32Array;
  cameraPosition: [number, number, number];
  viewportWidth: number;
  viewportHeight: number;
}

/**
 * Material for rendering SDF/MSDF text.
 *
 * Implements ShaderProvider for custom shader support.
 */
export class SDFTextMaterial implements BaseMaterial {
  readonly shadingModel = "unlit" as const;

  /** Atlas texture source */
  atlas: WebGLTexture | HTMLImageElement | HTMLCanvasElement | ImageBitmap;
  /** Cached WebGL texture */
  private _glTexture: WebGLTexture | null = null;
  /** Text color */
  color: [number, number, number, number];
  /** SDF type */
  sdfType: SDFType;
  /** Distance range */
  distanceRange: number;
  /** Atlas size [width, height] */
  atlasSize: [number, number];
  /** Double-sided */
  doubleSided?: boolean;

  constructor(options: SDFTextMaterialOptions) {
    this.atlas = options.atlas;
    this.color = options.color ?? [1, 1, 1, 1];
    this.sdfType = options.sdfType ?? "msdf";
    this.distanceRange = options.distanceRange ?? 4;
    this.doubleSided = options.doubleSided;

    // Get atlas size from image or use provided value
    if (options.atlasSize) {
      this.atlasSize = options.atlasSize;
    } else if (options.atlas instanceof HTMLImageElement) {
      this.atlasSize = [options.atlas.naturalWidth || 512, options.atlas.naturalHeight || 512];
    } else if (options.atlas instanceof HTMLCanvasElement) {
      this.atlasSize = [options.atlas.width, options.atlas.height];
    } else {
      this.atlasSize = [512, 512]; // Default
    }

    // If atlas is already a WebGL texture, cache it
    if (this.atlas instanceof WebGLTexture) {
      this._glTexture = this.atlas;
    }
  }

  /**
   * Returns the shader source for this material.
   */
  getShaderSource(): ShaderSource {
    return {
      vertex: SDF_VERTEX_SHADER,
      fragment: this.sdfType === "msdf" || this.sdfType === "mtsdf" ? MSDF_FRAGMENT_SHADER : SDF_FRAGMENT_SHADER,
    };
  }

  /**
   * Returns the draw configuration for this material.
   */
  getDrawConfig(): CustomDrawConfig {
    return {
      positionComponents: 3,
      disableDepthWrite: true, // Text typically rendered with alpha blending
      disableDepthTest: true, // Critical: prevents overlapping glyph quads from clipping each other
      shaderKey: `sdf-text-${this.sdfType}`, // Unique key per SDF type
      setUniforms: (gl, program, _material, context) => {
        // Upload texture if needed
        if (!this._glTexture && !(this.atlas instanceof WebGLTexture)) {
          this._glTexture = gl.createTexture();
          gl.bindTexture(gl.TEXTURE_2D, this._glTexture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.atlas as TexImageSource);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        }

        // Bind texture
        const texLoc = gl.getUniformLocation(program, "u_atlas");
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this._glTexture || (this.atlas as WebGLTexture));
        gl.uniform1i(texLoc, 0);

        // Set uniforms
        const colorLoc = gl.getUniformLocation(program, "u_color");
        gl.uniform4fv(colorLoc, this.color);

        const distanceRangeLoc = gl.getUniformLocation(program, "u_distanceRange");
        gl.uniform1f(distanceRangeLoc, this.distanceRange);

        const atlasSizeLoc = gl.getUniformLocation(program, "u_atlasSize");
        gl.uniform2fv(atlasSizeLoc, this.atlasSize);

        // Matrix uniforms
        const modelLoc = gl.getUniformLocation(program, "u_model");
        const viewLoc = gl.getUniformLocation(program, "u_view");
        const projLoc = gl.getUniformLocation(program, "u_proj");

        if (modelLoc) gl.uniformMatrix4fv(modelLoc, false, context.modelMatrix);
        if (viewLoc) gl.uniformMatrix4fv(viewLoc, false, context.viewMatrix);
        if (projLoc) gl.uniformMatrix4fv(projLoc, false, context.projMatrix);
      },
    };
  }

  /**
   * Disposes of GPU resources.
   */
  dispose(gl: WebGLRenderingContext): void {
    if (this._glTexture) {
      gl.deleteTexture(this._glTexture);
      this._glTexture = null;
    }
  }
}

// Vertex shader (shared between SDF and MSDF)
const SDF_VERTEX_SHADER = `
attribute vec3 a_position;
attribute vec2 a_uv;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_proj;

varying vec2 v_uv;

void main() {
  v_uv = a_uv;
  gl_Position = u_proj * u_view * u_model * vec4(a_position, 1.0);
}
`;

// Single-channel SDF fragment shader
const SDF_FRAGMENT_SHADER = `
#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif

precision mediump float;

uniform sampler2D u_atlas;
uniform vec4 u_color;
uniform float u_distanceRange;
uniform vec2 u_atlasSize;

varying vec2 v_uv;

void main() {
  float sd = texture2D(u_atlas, v_uv).a;
  
  // Calculate screen-space range for proper AA
  #ifdef GL_OES_standard_derivatives
    vec2 unitRange = vec2(u_distanceRange) / u_atlasSize;
    vec2 screenTexSize = vec2(1.0) / fwidth(v_uv);
    float screenPxRange = max(0.5 * dot(unitRange, screenTexSize), 1.0);
  #else
    float screenPxRange = max(u_distanceRange, 1.0);
  #endif
  
  float screenPxDistance = screenPxRange * (sd - 0.5);
  float opacity = clamp(screenPxDistance + 0.5, 0.0, 1.0);
  
  // Discard fully transparent pixels to avoid visible quad backgrounds
  if (opacity < 0.001) discard;
  
  gl_FragColor = vec4(u_color.rgb, u_color.a * opacity);
}
`;

// Multi-channel SDF (MSDF) fragment shader
const MSDF_FRAGMENT_SHADER = `
#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif

precision mediump float;

uniform sampler2D u_atlas;
uniform vec4 u_color;
uniform float u_distanceRange;
uniform vec2 u_atlasSize;

varying vec2 v_uv;

float median(float r, float g, float b) {
  return max(min(r, g), min(max(r, g), b));
}

void main() {
  vec3 msd = texture2D(u_atlas, v_uv).rgb;
  float sd = median(msd.r, msd.g, msd.b);
  
  // Calculate screen-space range for proper AA
  #ifdef GL_OES_standard_derivatives
    vec2 unitRange = vec2(u_distanceRange) / u_atlasSize;
    vec2 screenTexSize = vec2(1.0) / fwidth(v_uv);
    float screenPxRange = max(0.5 * dot(unitRange, screenTexSize), 1.0);
  #else
    float screenPxRange = max(u_distanceRange, 1.0);
  #endif
  
  float screenPxDistance = screenPxRange * (sd - 0.5);
  float opacity = clamp(screenPxDistance + 0.5, 0.0, 1.0);
  
  // Discard fully transparent pixels to avoid visible quad backgrounds
  if (opacity < 0.001) discard;
  
  gl_FragColor = vec4(u_color.rgb, u_color.a * opacity);
}
`;
