/**
 * @arcanvas/webgl2 - WebGL2 Program (linked shader program)
 */

import type { GfxVertexBufferLayout } from "@arcanvas/gfx";
import { GfxShaderError } from "@arcanvas/gfx";
import type { WebGL2ShaderModule } from "./shader.js";

/**
 * Uniform block binding info.
 */
export interface UniformBlockInfo {
  name: string;
  index: GLuint;
  size: number;
  binding: number;
}

/**
 * Uniform info (non-block uniforms).
 */
export interface UniformInfo {
  name: string;
  location: WebGLUniformLocation;
  type: GLenum;
  size: number;
}

/**
 * Attribute info.
 */
export interface AttributeInfo {
  name: string;
  location: GLint;
  type: GLenum;
}

/**
 * Linked WebGL2 program.
 */
export class WebGL2Program {
  private readonly _gl: WebGL2RenderingContext;
  private readonly _program: WebGLProgram;
  private readonly _uniformBlocks: Map<string, UniformBlockInfo> = new Map();
  private readonly _uniforms: Map<string, UniformInfo> = new Map();
  private readonly _attributes: Map<string, AttributeInfo> = new Map();
  private readonly _label: string | undefined;

  private constructor(gl: WebGL2RenderingContext, program: WebGLProgram, label?: string) {
    this._gl = gl;
    this._program = program;
    this._label = label;
    this.introspect();
  }

  static create(gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader, vertexLayouts?: GfxVertexBufferLayout[], label?: string): WebGL2Program {
    const program = gl.createProgram();
    if (!program) {
      throw new GfxShaderError("Failed to create WebGL2 program");
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    // Bind attribute locations based on vertex layout
    if (vertexLayouts) {
      for (const layout of vertexLayouts) {
        for (const attr of layout.attributes) {
          // We use shader location as the attribute location
          // The actual attribute name is determined by convention or introspection
          gl.bindAttribLocation(program, attr.shaderLocation, `a_${attr.shaderLocation}`);
        }
      }
    }

    gl.linkProgram(program);

    const success = gl.getProgramParameter(program, gl.LINK_STATUS) as boolean;
    if (!success) {
      const log = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new GfxShaderError(`Program linking failed:\n${log}`);
    }

    return new WebGL2Program(gl, program, label);
  }

  static createFromModule(gl: WebGL2RenderingContext, module: WebGL2ShaderModule, vertexLayouts?: GfxVertexBufferLayout[], label?: string): WebGL2Program {
    const vertexShader = module.getVertexShader();
    const fragmentShader = module.getFragmentShader();
    return WebGL2Program.create(gl, vertexShader, fragmentShader, vertexLayouts, label);
  }

  get native(): WebGLProgram {
    return this._program;
  }

  get label(): string | undefined {
    return this._label;
  }

  /**
   * Introspect the program to find uniforms, uniform blocks, and attributes.
   */
  private introspect(): void {
    const gl = this._gl;
    const program = this._program;

    // Get uniform blocks
    const numUniformBlocks = gl.getProgramParameter(program, gl.ACTIVE_UNIFORM_BLOCKS) as number;
    for (let i = 0; i < numUniformBlocks; i++) {
      const name = gl.getActiveUniformBlockName(program, i);
      if (name) {
        const size = gl.getActiveUniformBlockParameter(program, i, gl.UNIFORM_BLOCK_DATA_SIZE) as number;
        this._uniformBlocks.set(name, {
          name,
          index: i,
          size,
          binding: i, // Will be set when binding
        });
      }
    }

    // Get uniforms (non-block)
    const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS) as number;
    for (let i = 0; i < numUniforms; i++) {
      const info = gl.getActiveUniform(program, i);
      if (info) {
        // Skip block uniforms
        const blockIndices = gl.getActiveUniforms(program, [i], gl.UNIFORM_BLOCK_INDEX) as Uint32Array;
        if (blockIndices[0] === 4294967295) {
          const location = gl.getUniformLocation(program, info.name);
          if (location) {
            this._uniforms.set(info.name, {
              name: info.name,
              location,
              type: info.type,
              size: info.size,
            });
          }
        }
      }
    }

    // Get attributes
    const numAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES) as number;
    for (let i = 0; i < numAttributes; i++) {
      const info = gl.getActiveAttrib(program, i);
      if (info) {
        const location = gl.getAttribLocation(program, info.name);
        this._attributes.set(info.name, {
          name: info.name,
          location,
          type: info.type,
        });
      }
    }
  }

  /**
   * Get uniform block info by name.
   */
  getUniformBlock(name: string): UniformBlockInfo | undefined {
    return this._uniformBlocks.get(name);
  }

  /**
   * Get uniform info by name.
   */
  getUniform(name: string): UniformInfo | undefined {
    return this._uniforms.get(name);
  }

  /**
   * Get attribute info by name.
   */
  getAttribute(name: string): AttributeInfo | undefined {
    return this._attributes.get(name);
  }

  /**
   * Bind a uniform block to a binding point.
   */
  bindUniformBlock(name: string, bindingPoint: number): void {
    const block = this._uniformBlocks.get(name);
    if (block) {
      this._gl.uniformBlockBinding(this._program, block.index, bindingPoint);
      block.binding = bindingPoint;
    }
  }

  /**
   * Use this program.
   */
  use(): void {
    this._gl.useProgram(this._program);
  }

  destroy(): void {
    this._gl.deleteProgram(this._program);
  }
}
