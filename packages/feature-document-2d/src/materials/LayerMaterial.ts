import type { BaseMaterial } from "@arcanvas/graphics";
import type { TextureRef } from "@arcanvas/graphics";
import { BlendMode } from "@arcanvas/document";
import type { ShaderProvider, ShaderSource, CustomDrawConfig, UniformContext } from "@arcanvas/backend-webgl";

/**
 * Material for rendering a document layer with blend mode and opacity support.
 */
export class LayerMaterial implements BaseMaterial, ShaderProvider {
  readonly shadingModel = "unlit" as const;
  baseColor?: [number, number, number, number];
  baseColorTexture?: TextureRef | null;
  opacity: number;
  blendMode: BlendMode;

  constructor(options: { texture?: TextureRef | null; opacity?: number; blendMode?: BlendMode }) {
    this.baseColorTexture = options.texture ?? null;
    this.opacity = options.opacity ?? 1;
    this.blendMode = options.blendMode ?? BlendMode.Normal;
    this.baseColor = [1, 1, 1, this.opacity];
  }

  /**
   * Update the texture.
   */
  setTexture(texture: TextureRef | null): void {
    this.baseColorTexture = texture;
  }

  /**
   * Update the opacity.
   */
  setOpacity(opacity: number): void {
    this.opacity = Math.max(0, Math.min(1, opacity));
    this.baseColor = [1, 1, 1, this.opacity];
  }

  /**
   * Update the blend mode.
   */
  setBlendMode(blendMode: BlendMode): void {
    this.blendMode = blendMode;
  }

  getShaderSource(): ShaderSource {
    return {
      vertex: `
        attribute vec2 a_position;
        attribute vec2 a_uv;
        varying vec2 v_uv;
        uniform mat4 u_model;
        uniform mat4 u_view;
        uniform mat4 u_proj;
        void main() {
          v_uv = a_uv;
          gl_Position = u_proj * u_view * u_model * vec4(a_position, 0.0, 1.0);
        }
      `,
      fragment: this.getFragmentShader(),
    };
  }

  getDrawConfig(): CustomDrawConfig {
    return {
      positionComponents: 2,
      disableDepthWrite: true, // Layers should composite, not write depth
      setUniforms: (gl, program, material, context) => {
        const layerMat = material as LayerMaterial;
        
        // Set texture
        const textureLoc = gl.getUniformLocation(program, "u_texture");
        const opacityLoc = gl.getUniformLocation(program, "u_opacity");
        const blendModeLoc = gl.getUniformLocation(program, "u_blendMode");
        
        if (opacityLoc !== null) {
          gl.uniform1f(opacityLoc, layerMat.opacity);
        }
        
        if (blendModeLoc !== null) {
          // Map blend mode to integer for shader
          const blendModeValue = this.getBlendModeValue(layerMat.blendMode);
          gl.uniform1i(blendModeLoc, blendModeValue);
        }
        
        // Bind texture if available
        if (layerMat.baseColorTexture && textureLoc !== null) {
          // Texture should be bound by the backend's prepareMaterial
          gl.uniform1i(textureLoc, 0); // Use texture unit 0
        }
        
        // Set matrices
        const modelLoc = gl.getUniformLocation(program, "u_model");
        const viewLoc = gl.getUniformLocation(program, "u_view");
        const projLoc = gl.getUniformLocation(program, "u_proj");
        
        if (modelLoc !== null) {
          gl.uniformMatrix4fv(modelLoc, false, context.modelMatrix);
        }
        if (viewLoc !== null) {
          gl.uniformMatrix4fv(viewLoc, false, context.viewMatrix);
        }
        if (projLoc !== null) {
          gl.uniformMatrix4fv(projLoc, false, context.projMatrix);
        }
      },
    };
  }

  private getFragmentShader(): string {
    return `
      precision mediump float;
      varying vec2 v_uv;
      uniform sampler2D u_texture;
      uniform float u_opacity;
      uniform int u_blendMode;
      
      void main() {
        vec4 texColor = texture2D(u_texture, v_uv);
        vec3 color = texColor.rgb;
        float alpha = texColor.a * u_opacity;
        
        // Apply opacity to the color
        // Blend modes are handled by WebGL blend state set in prepareMaterial
        gl_FragColor = vec4(color, alpha);
      }
    `;
  }

  private getBlendModeValue(mode: BlendMode): number {
    switch (mode) {
      case BlendMode.Normal:
        return 0;
      case BlendMode.Multiply:
        return 1;
      case BlendMode.Screen:
        return 2;
      case BlendMode.Overlay:
        return 3;
      default:
        return 0;
    }
  }
}
