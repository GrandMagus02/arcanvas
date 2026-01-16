import type { IRenderContext } from "../../rendering/context";
import type { PolygonFill, PolygonFillUniformLocations } from "./fills/PolygonFill";
import VS_SOURCE from "./polygon.vert";

/**
 * Material for polygon meshes that manages shader program and cached locations.
 */
export class PolygonMaterial {
  private _program: WebGLProgram | null = null;
  private _aPosition: number = -1;
  private _uProjection: number | null = null;
  private _fillUniformLocations: PolygonFillUniformLocations = {};
  private _initialized = false;

  /**
   * Initialize the material with shader sources.
   * This should be called once before using the material.
   */
  async initialize(ctx: IRenderContext, fill: PolygonFill): Promise<void> {
    if (this._initialized) return;

    const gl = ctx.getWebGLContext();
    if (!gl) {
      throw new Error("PolygonMaterial requires WebGL context");
    }

    const programCache = ctx.getProgramCache();
    const shaderLibrary = ctx.getShaderLibrary();

    // Get shader sources (may need to fetch if URLs)
    let vsSource = VS_SOURCE;
    let fsSource = fill.getFragmentSource();

    // Check if sources are URLs that need fetching
    if (!PolygonMaterial.isInlineSource(vsSource)) {
      vsSource = await PolygonMaterial.fetchShaderSource(vsSource);
    }
    if (!PolygonMaterial.isInlineSource(fsSource)) {
      fsSource = await PolygonMaterial.fetchShaderSource(fsSource);
    }

    // Store shaders in library (optional, for future use)
    shaderLibrary.add("polygon:vs", vsSource);
    shaderLibrary.add(`polygon:fs:${fill.getCacheKey()}`, fsSource);

    // Get or create program from cache
    const cacheKey = `polygon:${this.hashShaderSource(vsSource)}:${this.hashShaderSource(fsSource)}:${fill.getCacheKey()}`;
    this._program = programCache.getOrCreate(gl, cacheKey, vsSource, fsSource);

    if (!this._program) {
      throw new Error("Failed to create polygon shader program");
    }

    // Cache attribute and uniform locations
    this._aPosition = gl.getAttribLocation(this._program, "a_position");
    this._uProjection = gl.getUniformLocation(this._program, "u_projection") as number | null;
    this._fillUniformLocations = fill.getUniformLocations(gl, this._program);

    if (this._aPosition < 0) {
      console.warn("[PolygonMaterial] Attribute a_position not found in shader");
    }
    if (!this._uProjection) {
      console.warn("[PolygonMaterial] Uniform u_projection not found in shader");
    }

    this._initialized = true;
  }

  /**
   * Bind the material: activate program, set uniforms, enable attributes.
   */
  bind(ctx: IRenderContext, viewProjectionMatrix: Float32Array | null, fill: PolygonFill): void {
    const gl = ctx.getWebGLContext();
    if (!gl || !this._program) {
      throw new Error("PolygonMaterial not initialized or WebGL context unavailable");
    }

    // Activate program
    ctx.useProgram(this._program);

    // Set view-projection matrix uniform
    if (this._uProjection !== null) {
      if (viewProjectionMatrix) {
        ctx.uniformMatrix4fv(this._uProjection, false, viewProjectionMatrix);
      } else {
        // Use identity matrix if no matrix provided
        const identity = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
        ctx.uniformMatrix4fv(this._uProjection, false, identity);
      }
    }

    fill.applyUniforms(ctx, this._fillUniformLocations);

    // Enable and set up vertex attribute
    if (this._aPosition >= 0) {
      ctx.enableVertexAttribArray(this._aPosition);
      ctx.vertexAttribPointer(this._aPosition, 3, gl.FLOAT, false, 0, 0);
    }
  }

  /**
   * Get the cached attribute location for position.
   */
  get aPosition(): number {
    return this._aPosition;
  }

  /**
   * Check if shader source is inline (not a URL).
   */
  private static isInlineSource(src: string): boolean {
    return /void\s+main\s*\(/.test(src) || /gl_FragColor|gl_Position/.test(src);
  }

  /**
   * Fetch shader source from URL.
   */
  private static async fetchShaderSource(url: string): Promise<string> {
    // Resolve relative URLs
    const resolvedUrl = PolygonMaterial.resolveAssetUrl(url);
    const response = await fetch(resolvedUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch shader: ${resolvedUrl}`);
    }
    return response.text();
  }

  /**
   * Resolve asset URL relative to current script location.
   */
  private static resolveAssetUrl(relativePath: string): string {
    if (/^https?:\/\//.test(relativePath) || relativePath.startsWith("/")) {
      return relativePath;
    }
    const script = document.querySelector<HTMLScriptElement>('script[type="module"][src$="/dist/main.js"]');
    const base = script?.src ? new URL(".", script.src).toString() : new URL("/dist/", location.href).toString();
    return new URL(relativePath.replace(/^\.\//, ""), base).toString();
  }

  /**
   * Simple hash function for shader source (for cache key).
   */
  private hashShaderSource(source: string): string {
    // Simple hash - in production, consider using a proper hash function
    let hash = 0;
    for (let i = 0; i < source.length; i++) {
      const char = source.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }
}
