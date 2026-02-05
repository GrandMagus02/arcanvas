/**
 * @arcanvas/webgl2 - WebGL2 Shader Module Implementation
 *
 * WebGL2 requires separate vertex and fragment shaders in GLSL ES 3.00.
 * We support both direct GLSL sources and WGSL (with transpilation).
 */

import type { GfxShaderModule, GfxShaderModuleDescriptor, ShaderCompilationMessage, ShaderSource } from "@arcanvas/gfx";
import { findShaderSource, GfxShaderError } from "@arcanvas/gfx";

/**
 * Compiled WebGL shader (vertex or fragment).
 */
export interface CompiledGLShader {
  shader: WebGLShader;
  stage: "vertex" | "fragment";
  source: string;
}

/**
 * WebGL2 shader module wrapper.
 *
 * Unlike WebGPU which uses a single shader module with multiple entry points,
 * WebGL2 requires separate vertex and fragment shaders that are compiled individually
 * and then linked into a program.
 */
export class WebGL2ShaderModule implements GfxShaderModule {
  private readonly _gl: WebGL2RenderingContext;
  private readonly _sources: ShaderSource[];
  private readonly _label: string | undefined;

  /** Cached compiled shaders */
  private _vertexShader: WebGLShader | null = null;
  private _fragmentShader: WebGLShader | null = null;
  private _compilationMessages: ShaderCompilationMessage[] = [];

  private constructor(gl: WebGL2RenderingContext, sources: ShaderSource[], label?: string) {
    this._gl = gl;
    this._sources = sources;
    this._label = label;
  }

  static create(gl: WebGL2RenderingContext, descriptor: GfxShaderModuleDescriptor): WebGL2ShaderModule {
    return new WebGL2ShaderModule(gl, descriptor.sources, descriptor.label);
  }

  get label(): string | undefined {
    return this._label;
  }

  /**
   * Compile and get the vertex shader.
   */
  getVertexShader(): WebGLShader {
    if (this._vertexShader) {
      return this._vertexShader;
    }

    const glslSource = this.findGLSLSource("vertex");
    if (!glslSource) {
      throw new GfxShaderError("No vertex shader source found. Provide GLSL vertex source.", { stage: "vertex" });
    }

    this._vertexShader = this.compileShader(glslSource.code, this._gl.VERTEX_SHADER, "vertex");
    return this._vertexShader;
  }

  /**
   * Compile and get the fragment shader.
   */
  getFragmentShader(): WebGLShader {
    if (this._fragmentShader) {
      return this._fragmentShader;
    }

    const glslSource = this.findGLSLSource("fragment");
    if (!glslSource) {
      throw new GfxShaderError("No fragment shader source found. Provide GLSL fragment source.", { stage: "fragment" });
    }

    this._fragmentShader = this.compileShader(glslSource.code, this._gl.FRAGMENT_SHADER, "fragment");
    return this._fragmentShader;
  }

  /**
   * Find GLSL source for a specific stage.
   */
  private findGLSLSource(stage: "vertex" | "fragment"): { code: string } | null {
    // First try to find GLSL source
    const glslSource = findShaderSource(this._sources, "glsl");
    if (glslSource && glslSource.stage === stage) {
      return { code: glslSource.code };
    }

    // Look through all sources for matching stage
    for (const source of this._sources) {
      if (source.kind === "glsl" && source.stage === stage) {
        return { code: source.code };
      }
    }

    // TODO: If WGSL source is provided, transpile it to GLSL
    // const wgslSource = findShaderSource(this._sources, "wgsl");
    // if (wgslSource) {
    //   return transpileWgslToGlsl(wgslSource.code, stage);
    // }

    return null;
  }

  /**
   * Compile a shader from source.
   */
  private compileShader(source: string, type: GLenum, stage: "vertex" | "fragment"): WebGLShader {
    const gl = this._gl;
    const shader = gl.createShader(type);

    if (!shader) {
      throw new GfxShaderError(`Failed to create ${stage} shader`, { stage });
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    // Check compilation status
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS) as boolean;
    const log = gl.getShaderInfoLog(shader);

    if (log) {
      // Parse shader compilation log into messages
      const messages = parseShaderLog(log, stage);
      this._compilationMessages.push(...messages);
    }

    if (!success) {
      gl.deleteShader(shader);
      throw new GfxShaderError(`${stage} shader compilation failed:\n${log}`, { stage, details: { log } });
    }

    return shader;
  }

  getCompilationInfo(): Promise<ShaderCompilationMessage[]> {
    // Trigger compilation if not done yet
    try {
      this.getVertexShader();
    } catch {
      // Compilation error already recorded
    }
    try {
      this.getFragmentShader();
    } catch {
      // Compilation error already recorded
    }

    return Promise.resolve(this._compilationMessages);
  }

  destroy(): void {
    if (this._vertexShader) {
      this._gl.deleteShader(this._vertexShader);
      this._vertexShader = null;
    }
    if (this._fragmentShader) {
      this._gl.deleteShader(this._fragmentShader);
      this._fragmentShader = null;
    }
  }
}

/**
 * Parse WebGL shader compilation log into structured messages.
 */
function parseShaderLog(log: string, _stage: "vertex" | "fragment"): ShaderCompilationMessage[] {
  const messages: ShaderCompilationMessage[] = [];
  const lines = log.split("\n").filter((l) => l.trim());

  for (const line of lines) {
    // Try to parse "ERROR: 0:123: message" or "WARNING: 0:123: message" format
    const match = line.match(/^(ERROR|WARNING):\s*(\d+):(\d+):\s*(.*)$/);
    if (match) {
      const [, type, , lineNum, message] = match;
      messages.push({
        message: message ?? line,
        type: type === "ERROR" ? "error" : "warning",
        lineNum: parseInt(lineNum ?? "0", 10),
        linePos: 0,
      });
    } else if (line.trim()) {
      // Fallback: treat whole line as message
      messages.push({
        message: line,
        type: "info",
        lineNum: 0,
        linePos: 0,
      });
    }
  }

  return messages;
}
