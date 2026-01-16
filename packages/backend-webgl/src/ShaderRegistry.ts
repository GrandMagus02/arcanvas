import type { ShadingModel } from "@arcanvas/graphics";
import type { ShaderSource, CustomDrawConfig } from "./ShaderProvider";

/**
 * Registration entry for a shader.
 */
export interface ShaderRegistration {
  source: ShaderSource;
  config: CustomDrawConfig;
}

/**
 * Registry for shader sources by shading model.
 */
export class ShaderRegistry {
  private static instance: ShaderRegistry | null = null;
  private readonly shaders = new Map<ShadingModel, ShaderRegistration>();

  private constructor() {
    // Register default unlit shader
    this.register("unlit", {
      source: {
        vertex: UNLIT_VERTEX_SOURCE,
        fragment: UNLIT_FRAGMENT_SOURCE,
      },
      config: {
        positionComponents: 3,
      },
    });
  }

  static getInstance(): ShaderRegistry {
    if (!ShaderRegistry.instance) {
      ShaderRegistry.instance = new ShaderRegistry();
    }
    return ShaderRegistry.instance;
  }

  register(model: ShadingModel, registration: ShaderRegistration): void {
    this.shaders.set(model, registration);
  }

  get(model: ShadingModel): ShaderRegistration | undefined {
    return this.shaders.get(model);
  }

  has(model: ShadingModel): boolean {
    return this.shaders.has(model);
  }
}

// Default unlit shaders
const UNLIT_VERTEX_SOURCE = `
  attribute vec3 a_position;
  uniform mat4 u_model;
  uniform mat4 u_view;
  uniform mat4 u_proj;
  void main() {
    gl_Position = u_proj * u_view * u_model * vec4(a_position, 1.0);
  }
`;

const UNLIT_FRAGMENT_SOURCE = `
  precision mediump float;
  uniform vec4 u_baseColor;
  void main() {
    gl_FragColor = u_baseColor;
  }
`;
