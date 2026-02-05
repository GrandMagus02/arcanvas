/**
 * @arcanvas/webgl2 - WebGL2 Render Pipeline Implementation
 */

import type { GfxRenderPipeline, GfxRenderPipelineDescriptor, GfxBindGroupLayout, GfxPipelineLayout, GfxVertexBufferLayout, BlendState, DepthStencilState, PrimitiveState } from "@arcanvas/gfx";

/**
 * Extended pipeline layout with bind group layouts access.
 */
interface WebGL2PipelineLayout extends GfxPipelineLayout {
  bindGroupLayouts?: GfxBindGroupLayout[];
}
import { WebGL2ShaderModule } from "./shader.js";
import { WebGL2Program } from "./program.js";
import { WebGL2BindGroupLayout } from "./bindGroup.js";
import { getGLCompareFunc, getGLStencilOp, getGLBlendFactor, getGLBlendOp, getGLCullFace, getGLFrontFace, getGLPrimitiveMode } from "../constants.js";

/**
 * WebGL2 render pipeline.
 */
export class WebGL2RenderPipeline implements GfxRenderPipeline {
  private readonly _gl: WebGL2RenderingContext;
  private readonly _program: WebGL2Program;
  private readonly _vertexLayouts: GfxVertexBufferLayout[];
  private readonly _primitiveState: PrimitiveState;
  private readonly _depthStencil: DepthStencilState | undefined;
  private readonly _blendStates: (BlendState | undefined)[];
  private readonly _label: string | undefined;
  private readonly _bindGroupLayouts: GfxBindGroupLayout[];

  private constructor(gl: WebGL2RenderingContext, program: WebGL2Program, descriptor: GfxRenderPipelineDescriptor) {
    this._gl = gl;
    this._program = program;
    this._vertexLayouts = descriptor.vertex.buffers ?? [];
    this._primitiveState = descriptor.primitive ?? {};
    this._depthStencil = descriptor.depthStencil;
    this._blendStates = descriptor.fragment?.targets.map((t) => t?.blend) ?? [];
    this._label = descriptor.label;

    // Extract or create bind group layouts
    if (descriptor.layout === "auto") {
      // Auto layout - create empty layouts
      this._bindGroupLayouts = [];
    } else {
      // Access bindGroupLayouts from our WebGL2PipelineLayout
      this._bindGroupLayouts = (descriptor.layout as WebGL2PipelineLayout).bindGroupLayouts ?? [];
    }
  }

  static create(gl: WebGL2RenderingContext, descriptor: GfxRenderPipelineDescriptor): WebGL2RenderPipeline {
    const shaderModule = descriptor.vertex.module as WebGL2ShaderModule;

    // Create and link program
    const program = WebGL2Program.createFromModule(gl, shaderModule, descriptor.vertex.buffers, descriptor.label);

    return new WebGL2RenderPipeline(gl, program, descriptor);
  }

  get label(): string | undefined {
    return this._label;
  }

  get program(): WebGL2Program {
    return this._program;
  }

  get vertexLayouts(): readonly GfxVertexBufferLayout[] {
    return this._vertexLayouts;
  }

  get primitiveState(): PrimitiveState {
    return this._primitiveState;
  }

  getBindGroupLayout(index: number): GfxBindGroupLayout {
    if (index < this._bindGroupLayouts.length) {
      return this._bindGroupLayouts[index]!;
    }
    // Return empty layout for auto-generated
    return new WebGL2BindGroupLayout({ entries: [] });
  }

  /**
   * Apply pipeline state to WebGL context.
   */
  apply(): void {
    const gl = this._gl;

    // Use program
    this._program.use();

    // Primitive state
    const cullMode = this._primitiveState.cullMode ?? "none";
    const frontFace = this._primitiveState.frontFace ?? "ccw";

    // Culling
    const glCullFace = getGLCullFace(cullMode, gl);
    if (glCullFace !== null) {
      gl.enable(gl.CULL_FACE);
      gl.cullFace(glCullFace);
    } else {
      gl.disable(gl.CULL_FACE);
    }

    // Front face
    gl.frontFace(getGLFrontFace(frontFace, gl));

    // Depth/stencil
    if (this._depthStencil) {
      this.applyDepthStencil(this._depthStencil);
    } else {
      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.STENCIL_TEST);
    }

    // Blending (for first target)
    const blend = this._blendStates[0];
    if (blend) {
      gl.enable(gl.BLEND);
      gl.blendFuncSeparate(
        getGLBlendFactor(blend.color.srcFactor ?? "one", gl),
        getGLBlendFactor(blend.color.dstFactor ?? "zero", gl),
        getGLBlendFactor(blend.alpha.srcFactor ?? "one", gl),
        getGLBlendFactor(blend.alpha.dstFactor ?? "zero", gl)
      );
      gl.blendEquationSeparate(getGLBlendOp(blend.color.operation ?? "add", gl), getGLBlendOp(blend.alpha.operation ?? "add", gl));
    } else {
      gl.disable(gl.BLEND);
    }
  }

  private applyDepthStencil(state: DepthStencilState): void {
    const gl = this._gl;

    // Depth
    if (state.depthCompare && state.depthCompare !== "always") {
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(getGLCompareFunc(state.depthCompare, gl));
    } else {
      gl.disable(gl.DEPTH_TEST);
    }

    gl.depthMask(state.depthWriteEnabled ?? true);

    // Stencil
    const hasFrontStencil = state.stencilFront && state.stencilFront.compare !== "always";
    const hasBackStencil = state.stencilBack && state.stencilBack.compare !== "always";

    if (hasFrontStencil || hasBackStencil) {
      gl.enable(gl.STENCIL_TEST);

      if (state.stencilFront) {
        const s = state.stencilFront;
        gl.stencilFuncSeparate(gl.FRONT, getGLCompareFunc(s.compare ?? "always", gl), state.stencilReadMask ?? 0xff, state.stencilWriteMask ?? 0xff);
        gl.stencilOpSeparate(gl.FRONT, getGLStencilOp(s.failOp ?? "keep", gl), getGLStencilOp(s.depthFailOp ?? "keep", gl), getGLStencilOp(s.passOp ?? "keep", gl));
      }

      if (state.stencilBack) {
        const s = state.stencilBack;
        gl.stencilFuncSeparate(gl.BACK, getGLCompareFunc(s.compare ?? "always", gl), state.stencilReadMask ?? 0xff, state.stencilWriteMask ?? 0xff);
        gl.stencilOpSeparate(gl.BACK, getGLStencilOp(s.failOp ?? "keep", gl), getGLStencilOp(s.depthFailOp ?? "keep", gl), getGLStencilOp(s.passOp ?? "keep", gl));
      }
    } else {
      gl.disable(gl.STENCIL_TEST);
    }

    // Depth bias
    if (state.depthBias || state.depthBiasSlopeScale) {
      gl.enable(gl.POLYGON_OFFSET_FILL);
      gl.polygonOffset(state.depthBiasSlopeScale ?? 0, state.depthBias ?? 0);
    } else {
      gl.disable(gl.POLYGON_OFFSET_FILL);
    }
  }

  /**
   * Get the GL primitive mode for drawing.
   */
  getPrimitiveMode(): GLenum {
    return getGLPrimitiveMode(this._primitiveState.topology ?? "triangle-list", this._gl);
  }

  destroy(): void {
    this._program.destroy();
  }
}
