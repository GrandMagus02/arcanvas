import { Mesh } from "../../objects/Mesh";
import { TransformationMatrix } from "../../utils/TransformationMatrix";
import FS_SOURCE from "./plane.frag";
import VS_SOURCE from "./plane.vert";

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
    if (/^https?:\/\//.test(relativePath) || relativePath.startsWith("/")) {
      console.log("PlaneMesh: Using absolute URL for shader:", relativePath);
      return relativePath;
    }
    const script = document.querySelector<HTMLScriptElement>('script[type="module"][src$="/dist/main.js"]');
    const base = script?.src ? new URL(".", script.src).toString() : new URL("/dist/", location.href).toString();
    const resolved = new URL(relativePath.replace(/^\.\//, ""), base).toString();
    console.log("PlaneMesh: Resolved shader URL:", relativePath, "->", resolved, "(base:", base + ")");
    return resolved;
  }

  private async initProgram(ctx: WebGLRenderingContext): Promise<void> {
    if (this._program) return;
    let vsSource = VS_SOURCE;
    let fsSource = FS_SOURCE;

    // Load vertex shader source
    if (!PlaneMesh.isInlineSource(vsSource)) {
      try {
        const url = PlaneMesh.resolveAssetUrl(vsSource);
        console.log("PlaneMesh: Loading vertex shader from:", url);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch vertex shader: ${response.status} ${response.statusText}`);
        }
        vsSource = await response.text();
        if (!vsSource || vsSource.trim().length === 0) {
          throw new Error("Vertex shader source is empty");
        }
        console.log("PlaneMesh: Vertex shader loaded successfully, length:", vsSource.length);
      } catch (error) {
        console.error("PlaneMesh: Failed to load vertex shader:", error);
        if (error instanceof Error) {
          console.error("PlaneMesh: Error details:", error.message);
        }
        throw error; // Re-throw to prevent program creation with invalid shader
      }
    } else {
      console.log("PlaneMesh: Using inline vertex shader source");
    }

    // Load fragment shader source
    if (!PlaneMesh.isInlineSource(fsSource)) {
      try {
        const url = PlaneMesh.resolveAssetUrl(fsSource);
        console.log("PlaneMesh: Loading fragment shader from:", url);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch fragment shader: ${response.status} ${response.statusText}`);
        }
        fsSource = await response.text();
        if (!fsSource || fsSource.trim().length === 0) {
          throw new Error("Fragment shader source is empty");
        }
        console.log("PlaneMesh: Fragment shader loaded successfully, length:", fsSource.length);
      } catch (error) {
        console.error("PlaneMesh: Failed to load fragment shader:", error);
        if (error instanceof Error) {
          console.error("PlaneMesh: Error details:", error.message);
        }
        throw error; // Re-throw to prevent program creation with invalid shader
      }
    } else {
      console.log("PlaneMesh: Using inline fragment shader source");
    }

    const vs = ctx.createShader(ctx.VERTEX_SHADER);
    if (!vs) {
      const error = ctx.getError();
      const errorNames: Record<number, string> = {
        0x0500: "INVALID_ENUM",
        0x0501: "INVALID_VALUE",
        0x0502: "INVALID_OPERATION",
        0x0503: "INVALID_FRAMEBUFFER_OPERATION",
        0x0505: "OUT_OF_MEMORY",
      };
      console.error("PlaneMesh: Failed to create vertex shader. WebGL error:", errorNames[error] || `0x${error.toString(16)}`);
      throw new Error("Failed to create vertex shader");
    }
    ctx.shaderSource(vs, vsSource);
    ctx.compileShader(vs);
    if (!ctx.getShaderParameter(vs, ctx.COMPILE_STATUS)) {
      const info = ctx.getShaderInfoLog(vs) || "Unknown compilation error";
      console.error("PlaneMesh: Vertex shader compile error:", info);
      console.error("PlaneMesh: Vertex shader source (first 500 chars):", vsSource.substring(0, 500));
      ctx.deleteShader(vs);
      throw new Error(`Vertex shader compilation failed: ${info}`);
    }
    console.log("PlaneMesh: Vertex shader compiled successfully");
    const fs = ctx.createShader(ctx.FRAGMENT_SHADER);
    if (!fs) {
      const error = ctx.getError();
      const errorNames: Record<number, string> = {
        0x0500: "INVALID_ENUM",
        0x0501: "INVALID_VALUE",
        0x0502: "INVALID_OPERATION",
        0x0503: "INVALID_FRAMEBUFFER_OPERATION",
        0x0505: "OUT_OF_MEMORY",
      };
      console.error("PlaneMesh: Failed to create fragment shader. WebGL error:", errorNames[error] || `0x${error.toString(16)}`);
      ctx.deleteShader(vs);
      throw new Error("Failed to create fragment shader");
    }
    ctx.shaderSource(fs, fsSource);
    ctx.compileShader(fs);
    if (!ctx.getShaderParameter(fs, ctx.COMPILE_STATUS)) {
      const info = ctx.getShaderInfoLog(fs) || "Unknown compilation error";
      console.error("PlaneMesh: Fragment shader compile error:", info);
      console.error("PlaneMesh: Fragment shader source (first 500 chars):", fsSource.substring(0, 500));
      ctx.deleteShader(vs);
      ctx.deleteShader(fs);
      throw new Error(`Fragment shader compilation failed: ${info}`);
    }
    console.log("PlaneMesh: Fragment shader compiled successfully");
    const prog = ctx.createProgram();
    if (!prog) {
      const error = ctx.getError();
      const errorNames: Record<number, string> = {
        0x0500: "INVALID_ENUM",
        0x0501: "INVALID_VALUE",
        0x0502: "INVALID_OPERATION",
        0x0503: "INVALID_FRAMEBUFFER_OPERATION",
        0x0505: "OUT_OF_MEMORY",
      };
      console.error("PlaneMesh: Failed to create program. WebGL error:", errorNames[error] || `0x${error.toString(16)}`);
      ctx.deleteShader(vs);
      ctx.deleteShader(fs);
      throw new Error("Failed to create WebGL program");
    }
    ctx.attachShader(prog, vs);
    ctx.attachShader(prog, fs);
    ctx.linkProgram(prog);
    if (!ctx.getProgramParameter(prog, ctx.LINK_STATUS)) {
      const info = ctx.getProgramInfoLog(prog) || "Unknown link error";
      console.error("PlaneMesh: Program link error:", info);
      ctx.deleteShader(vs);
      ctx.deleteShader(fs);
      ctx.deleteProgram(prog);
      throw new Error(`Program linking failed: ${info}`);
    }
    // Check for WebGL errors
    const error = ctx.getError();
    if (error !== ctx.NO_ERROR) {
      const errorNames: Record<number, string> = {
        0x0500: "INVALID_ENUM",
        0x0501: "INVALID_VALUE",
        0x0502: "INVALID_OPERATION",
        0x0503: "INVALID_FRAMEBUFFER_OPERATION",
        0x0505: "OUT_OF_MEMORY",
      };
      console.error("PlaneMesh: WebGL error after program link:", errorNames[error] || `0x${error.toString(16)}`);
      // Don't throw here, as the program may still be usable
    }
    console.log("PlaneMesh: Program linked successfully");

    this._program = prog;
    this._aPos = ctx.getAttribLocation(prog, "a_position");
    if (this._aPos < 0) {
      console.warn("PlaneMesh: Attribute 'a_position' not found in shader program");
    }
    this._uProjection = ctx.getUniformLocation(prog, "u_projection");
    if (!this._uProjection) {
      console.warn("PlaneMesh: Uniform 'u_projection' not found in shader program (may be optimized out)");
    }

    // shaders can be detached/deleted after linking to free resources
    ctx.detachShader(prog, vs);
    ctx.deleteShader(vs);
    ctx.deleteShader(fs);
    console.log("PlaneMesh: Shader program compiled, linked, and initialized successfully");
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

  override render(gl: WebGLRenderingContext): void {
    // Ensure vertex buffer exists and is uploaded
    if (!this["_vertexBuffer"]) {
      this["_vertexBuffer"] = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this["_vertexBuffer"]);
      gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
    }

    // Lazy initialize program; if fetch required, schedule and return until ready
    if (!this._program) {
      if (!this._shaderInitPromise) {
        this._shaderInitPromise = this.initProgram(gl).catch((error) => {
          console.error("PlaneMesh: Shader initialization failed:", error);
          if (error instanceof Error) {
            console.error("PlaneMesh: Error details:", error.message, error.stack);
          }
          // Reset promise to allow retry on next frame
          this._shaderInitPromise = null;
        });
      }
      // Not ready yet; try again next frame
      return;
    }

    if (this._aPos < 0) {
      console.warn("PlaneMesh: Cannot render - attribute location is invalid");
      return;
    }

    gl.useProgram(this._program);

    // Set view-projection matrix uniform if available
    // WebGL expects column-major matrices with transpose=false
    if (this._uProjection) {
      if (this._viewProjectionMatrix) {
        // Convert row-major to column-major for WebGL
        let cm: Float32Array;
        if (typeof this._viewProjectionMatrix.toColumnMajorArray === "function") {
          cm = this._viewProjectionMatrix.toColumnMajorArray();
        } else {
          // Fallback: manually transpose if method doesn't exist (for compatibility during build updates)
          const data = this._viewProjectionMatrix.data;
          cm = new Float32Array(16);
          for (let c = 0; c < 4; c++) {
            for (let r = 0; r < 4; r++) {
              cm[c * 4 + r] = data[r * 4 + c]!;
            }
          }
        }
        gl.uniformMatrix4fv(this._uProjection, false, cm);
      } else {
        // Use identity matrix if no view-projection matrix is set
        const identity = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
        gl.uniformMatrix4fv(this._uProjection, false, identity);
      }
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this["_vertexBuffer"]);
    gl.enableVertexAttribArray(this._aPos);
    gl.vertexAttribPointer(this._aPos, 3, gl.FLOAT, false, 0, 0);
    const vertCount = this.vertices.length / 3;
    gl.drawArrays(gl.TRIANGLES, 0, vertCount);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }
}
