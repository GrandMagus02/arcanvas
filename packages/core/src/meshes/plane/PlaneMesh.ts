import type { IRenderContext } from "../../rendering/context";
import { Mesh } from "../../scene/Mesh";
import { TransformationMatrix } from "../../utils/TransformationMatrix";

const VS_SOURCE = `attribute vec3 a_position;
uniform mat4 u_projection;

void main() {
  vec4 pos = u_projection * vec4(a_position.x, a_position.y, a_position.z, 1.0);
  gl_Position = pos;
}`;

const FS_SOURCE = `precision mediump float;

void main() {
  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}`;

/**
 *
 */
export class PlaneMesh extends Mesh {
  private _aPos: number = -1;
  private _uProjection: WebGLUniformLocation | null = null;
  private _shaderInitPromise: Promise<void> | null = null;
  private _viewProjectionMatrix: TransformationMatrix | null = null;

  private static isInlineSource(src: string): boolean {
    return /void\s+main\s*\(/.test(src) || /gl_FragColor|gl_Position/.test(src);
  }

  private static resolveAssetUrl(relativePath: string): string {
    if (/^https?:\/\//.test(relativePath) || relativePath.startsWith("/")) return relativePath;
    const script = document.querySelector<HTMLScriptElement>('script[type="module"][src$="/dist/main.js"]');
    const base = script?.src ? new URL(".", script.src).toString() : new URL("/dist/", location.href).toString();
    return new URL(relativePath.replace(/^\.\//, ""), base).toString();
  }

  private getWebGLErrorName(gl: WebGLRenderingContext, error: number): string {
    const errorNames: Record<number, string> = {
      [gl.NO_ERROR]: "NO_ERROR",
      [gl.INVALID_ENUM]: "INVALID_ENUM",
      [gl.INVALID_VALUE]: "INVALID_VALUE",
      [gl.INVALID_OPERATION]: "INVALID_OPERATION",
      [gl.INVALID_FRAMEBUFFER_OPERATION]: "INVALID_FRAMEBUFFER_OPERATION",
      [gl.OUT_OF_MEMORY]: "OUT_OF_MEMORY",
      [gl.CONTEXT_LOST_WEBGL]: "CONTEXT_LOST_WEBGL",
    };
    return errorNames[error] || `Unknown error: ${error}`;
  }

  private async initProgram(ctx: WebGLRenderingContext): Promise<void> {
    if (this._program) return;
    let vsSource = VS_SOURCE;
    let fsSource = FS_SOURCE;

    try {
      // If bundler emitted URLs for shaders, fetch their contents
      if (!PlaneMesh.isInlineSource(vsSource)) {
        const url = PlaneMesh.resolveAssetUrl(vsSource);
        vsSource = await fetch(url).then((r) => r.text());
      }
      if (!PlaneMesh.isInlineSource(fsSource)) {
        const url = PlaneMesh.resolveAssetUrl(fsSource);
        fsSource = await fetch(url).then((r) => r.text());
      }

      const vs = ctx.createShader(ctx.VERTEX_SHADER);
      if (!vs) {
        console.error("[PlaneMesh] Failed to create vertex shader");
        return;
      }
      ctx.shaderSource(vs, vsSource);
      ctx.compileShader(vs);
      if (!ctx.getShaderParameter(vs, ctx.COMPILE_STATUS)) {
        const info = ctx.getShaderInfoLog(vs) || "";
        console.error("[PlaneMesh] Vertex shader compile error:", info);
        console.error("[PlaneMesh] Vertex shader source:", vsSource);
        ctx.deleteShader(vs);
        return;
      }

      const fs = ctx.createShader(ctx.FRAGMENT_SHADER);
      if (!fs) {
        console.error("[PlaneMesh] Failed to create fragment shader");
        ctx.deleteShader(vs);
        return;
      }
      ctx.shaderSource(fs, fsSource);
      ctx.compileShader(fs);
      if (!ctx.getShaderParameter(fs, ctx.COMPILE_STATUS)) {
        const info = ctx.getShaderInfoLog(fs) || "";
        console.error("[PlaneMesh] Fragment shader compile error:", info);
        console.error("[PlaneMesh] Fragment shader source:", fsSource);
        ctx.deleteShader(vs);
        ctx.deleteShader(fs);
        return;
      }

      const prog = ctx.createProgram();
      if (!prog) {
        console.error("[PlaneMesh] Failed to create program");
        ctx.deleteShader(vs);
        ctx.deleteShader(fs);
        return;
      }
      ctx.attachShader(prog, vs);
      ctx.attachShader(prog, fs);
      ctx.linkProgram(prog);
      if (!ctx.getProgramParameter(prog, ctx.LINK_STATUS)) {
        const info = ctx.getProgramInfoLog(prog) || "";
        console.error("[PlaneMesh] Program link error:", info);
        ctx.deleteShader(vs);
        ctx.deleteShader(fs);
        ctx.deleteProgram(prog);
        return;
      }

      // Validate program before using
      ctx.validateProgram(prog);
      if (!ctx.getProgramParameter(prog, ctx.VALIDATE_STATUS)) {
        const info = ctx.getProgramInfoLog(prog) || "";
        console.error("[PlaneMesh] Program validation error:", info);
        ctx.deleteShader(vs);
        ctx.deleteShader(fs);
        ctx.deleteProgram(prog);
        return;
      }

      this._program = prog;
      this._aPos = ctx.getAttribLocation(prog, "a_position");
      this._uProjection = ctx.getUniformLocation(prog, "u_projection");

      if (this._aPos < 0) {
        console.warn("[PlaneMesh] Attribute a_position not found in shader");
      }
      if (!this._uProjection) {
        console.warn("[PlaneMesh] Uniform u_projection not found in shader");
      }

      // shaders can be detached/deleted after linking to free resources
      ctx.detachShader(prog, vs);
      ctx.detachShader(prog, fs);
      ctx.deleteShader(vs);
      ctx.deleteShader(fs);

      console.log("[PlaneMesh] Shader program initialized successfully");
    } catch (error) {
      console.error("[PlaneMesh] Error initializing shader program:", error);
      this._program = null;
      this._shaderInitPromise = null;
    }
  }

  /**
   * Set the view-projection matrix (combines view and projection).
   * If null, uses identity matrix (no transformation).
   */
  setViewProjection(matrix: TransformationMatrix | null): void {
    this._viewProjectionMatrix = matrix;
  }

  /**
   * Set the projection matrix (deprecated: use setViewProjection instead).
   * @deprecated Use setViewProjection instead
   */
  setProjectionMatrix(matrix: TransformationMatrix | null): void {
    this.setViewProjection(matrix);
  }

  override render(ctx: IRenderContext): void {
    const gl = ctx.getWebGLContext();
    if (!gl) {
      throw new Error("PlaneMesh requires WebGL context");
    }

    // Ensure vertex buffer exists and is uploaded
    if (!this["_vertexBuffer"]) {
      if (this.vertices.length === 0) {
        console.warn("[PlaneMesh] No vertices to render");
        return;
      }
      this["_vertexBuffer"] = ctx.createVertexBuffer(this.vertices);
      if (!this["_vertexBuffer"]) {
        console.error("[PlaneMesh] Failed to create vertex buffer");
        return;
      }
    }

    // Lazy initialize program; if fetch required, schedule and return until ready
    if (!this._program) {
      if (!this._shaderInitPromise) {
        this._shaderInitPromise = this.initProgram(gl);
      }
      // Not ready yet; try again next frame
      return;
    }

    // Check if program is valid
    if (!gl.isProgram(this._program)) {
      console.error("[PlaneMesh] Program is not valid");
      this._program = null;
      this._shaderInitPromise = null;
      return;
    }

    if (this._aPos < 0) {
      console.error("[PlaneMesh] Attribute location not found:", this._aPos);
      return;
    }

    // Switch to our program first
    ctx.useProgram(this._program);

    // Verify program is actually in use
    const currentProgram = gl.getParameter(gl.CURRENT_PROGRAM) as WebGLProgram | null;
    if (currentProgram !== this._program) {
      console.error("[PlaneMesh] Failed to activate program");
      return;
    }

    // Re-query uniform location to ensure it's valid for current program
    // This is necessary because uniform locations are program-specific
    const uProjection = gl.getUniformLocation(this._program, "u_projection");
    if (!uProjection) {
      console.error("[PlaneMesh] Uniform location not found: u_projection");
      return;
    }

    // Ensure vertex buffer is bound after program switch
    ctx.bindVertexBuffer(this["_vertexBuffer"]);

    // Set view-projection matrix uniform if available
    // WebGL expects column-major matrices with transpose=false
    if (this._viewProjectionMatrix) {
      // Convert row-major to column-major for WebGL
      const cm = this._viewProjectionMatrix.toColumnMajorArray();
      if (cm.length !== 16) {
        console.error("[PlaneMesh] Invalid matrix size:", cm.length);
        return;
      }
      gl.uniformMatrix4fv(uProjection, false, cm);

      // Debug: log matrix on first render
      if (!(this as { _loggedMatrix?: boolean })._loggedMatrix) {
        console.log(
          "[PlaneMesh] View-Projection Matrix (column-major):",
          Array.from(cm).map((v) => v.toFixed(3))
        );
        console.log("[PlaneMesh] Vertex count:", this.vertices.length / 3);
        console.log("[PlaneMesh] First 3 vertices:", this.vertices[0], this.vertices[1], this.vertices[2]);
        (this as { _loggedMatrix?: boolean })._loggedMatrix = true;
      }
    } else {
      // Use identity matrix if no view-projection matrix is set
      const identity = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
      gl.uniformMatrix4fv(uProjection, false, identity);
      console.warn("[PlaneMesh] No view-projection matrix set, using identity");
    }

    // Set up vertex attributes (buffer must be bound first)
    ctx.enableVertexAttribArray(this._aPos);

    // Check for errors after enabling attribute
    let error = gl.getError();
    if (error !== gl.NO_ERROR) {
      console.error("[PlaneMesh] WebGL error after enableVertexAttribArray:", this.getWebGLErrorName(gl, error));
      return;
    }

    ctx.vertexAttribPointer(this._aPos, 3, gl.FLOAT, false, 0, 0);

    // Check for errors after setting attribute pointer
    error = gl.getError();
    if (error !== gl.NO_ERROR) {
      console.error("[PlaneMesh] WebGL error after vertexAttribPointer:", this.getWebGLErrorName(gl, error));
      return;
    }

    const vertCount = this.vertices.length / 3;

    // Check for WebGL errors before drawing
    error = gl.getError();
    if (error !== gl.NO_ERROR) {
      console.error("[PlaneMesh] WebGL error before drawArrays:", this.getWebGLErrorName(gl, error));
      return;
    }

    ctx.drawArrays(gl.TRIANGLES, 0, vertCount);

    // Check for WebGL errors after drawing
    const errorAfter = gl.getError();
    if (errorAfter !== gl.NO_ERROR) {
      console.error("[PlaneMesh] WebGL error after drawArrays:", this.getWebGLErrorName(gl, errorAfter));
    }
  }
}
