import { Mesh } from "../../objects/Mesh";
import { TransformationMatrix } from "../../utils/TransformationMatrix";
import FS_SOURCE from "./grid.frag";
import VS_SOURCE from "./grid.vert";

/**
 * Grid plane orientation.
 */
export type GridPlane = "XY" | "XZ" | "YZ";

/**
 * GridMesh renders an infinite grid with major/minor lines, colored axes, and optional dashes.
 * Supports three planes (XY, XZ, YZ) and both adaptive and fixed spacing modes.
 */
export class GridMesh extends Mesh {
  private _aPos: number = -1;

  // Uniform locations
  private _uPlane: WebGLUniformLocation | null = null;
  private _uInvViewProj: WebGLUniformLocation | null = null;
  private _uViewportPx: WebGLUniformLocation | null = null;
  private _uCameraPos: WebGLUniformLocation | null = null;
  private _uAdaptive: WebGLUniformLocation | null = null;
  private _uCellSize: WebGLUniformLocation | null = null;
  private _uMajorDiv: WebGLUniformLocation | null = null;
  private _uAxisLineWidth: WebGLUniformLocation | null = null;
  private _uMajorLineWidth: WebGLUniformLocation | null = null;
  private _uMinorLineWidth: WebGLUniformLocation | null = null;
  private _uAxisDashScale: WebGLUniformLocation | null = null;
  private _uFixedPixelSize: WebGLUniformLocation | null = null;
  private _uBaseColor: WebGLUniformLocation | null = null;
  private _uMinorColor: WebGLUniformLocation | null = null;
  private _uMajorColor: WebGLUniformLocation | null = null;
  private _uXAxisColor: WebGLUniformLocation | null = null;
  private _uXAxisDashColor: WebGLUniformLocation | null = null;
  private _uYAxisColor: WebGLUniformLocation | null = null;
  private _uYAxisDashColor: WebGLUniformLocation | null = null;
  private _uZAxisColor: WebGLUniformLocation | null = null;
  private _uZAxisDashColor: WebGLUniformLocation | null = null;
  private _uCenterColor: WebGLUniformLocation | null = null;

  private _shaderInitPromise: Promise<void> | null = null;
  private _viewProjectionMatrix: TransformationMatrix | null = null;
  private _invViewProjectionMatrix: TransformationMatrix | null = null;
  private _invViewProjectionDirty: boolean = true;

  // State
  private _plane: GridPlane = "XY";
  private _adaptiveSpacing = true;
  private _cellSize = 50;
  private _majorDivisions = 10;
  private _axisLineWidth = 2;
  private _majorLineWidth = 1.5;
  private _minorLineWidth = 1;
  private _axisDashScale = 1.33;
  private _fixedPixelSize = false;
  private _viewportWidth = 640;
  private _viewportHeight = 480;
  private _cameraPos: [number, number, number] = [0, 0, 0];

  // Colors (linear RGB, non-premultiplied)
  private _baseColor: [number, number, number, number] = [0, 0, 0, 1];
  private _minorColor: [number, number, number, number] = [1, 1, 1, 1];
  private _majorColor: [number, number, number, number] = [1, 1, 1, 1];
  private _xAxisColor: [number, number, number, number] = [1, 0, 0, 1];
  private _xAxisDashColor: [number, number, number, number] = [0.5, 0, 0, 1];
  private _yAxisColor: [number, number, number, number] = [0, 1, 0, 1];
  private _yAxisDashColor: [number, number, number, number] = [0, 0.5, 0, 1];
  private _zAxisColor: [number, number, number, number] = [0, 0, 1, 1];
  private _zAxisDashColor: [number, number, number, number] = [0, 0, 0.5, 1];
  private _centerColor: [number, number, number, number] = [1, 1, 1, 1];

  constructor(_vertices: Float32Array) {
    // Ignore provided vertices; use a fullscreen triangle in clip-space
    void _vertices;
    super(new Float32Array([-1, -1, 3, -1, -1, 3]), new Uint16Array([0, 1, 2]));
  }

  /**
   * Set the plane orientation: XY (default), XZ, or YZ.
   */
  setPlane(plane: GridPlane): void {
    this._plane = plane;
  }

  /**
   * Enable or disable adaptive spacing (zoom-aware).
   */
  setAdaptiveSpacing(enabled: boolean): void {
    this._adaptiveSpacing = enabled;
  }

  /**
   * Set fixed cell size in world units (used when adaptive spacing is disabled).
   */
  setCellSize(size: number): void {
    if (Number.isFinite(size) && size > 0) this._cellSize = size;
  }

  /**
   * Set the number of major grid divisions per cell.
   */
  setMajorDivisions(div: number): void {
    if (Number.isFinite(div) && div >= 2) this._majorDivisions = Math.round(div);
  }

  /**
   * Set axis line width in pixels.
   */
  setAxisLineWidth(width: number): void {
    if (Number.isFinite(width) && width >= 0) this._axisLineWidth = width;
  }

  /**
   * Set major grid line width in pixels.
   */
  setMajorLineWidth(width: number): void {
    if (Number.isFinite(width) && width >= 0) this._majorLineWidth = width;
  }

  /**
   * Set minor grid line width in pixels.
   */
  setMinorLineWidth(width: number): void {
    if (Number.isFinite(width) && width >= 0) this._minorLineWidth = width;
  }

  /**
   * Set axis dash scale (controls dash frequency).
   */
  setAxisDashScale(scale: number): void {
    if (Number.isFinite(scale) && scale > 0) this._axisDashScale = scale;
  }

  /**
   * Enable or disable fixed pixel-size lines (lines maintain constant pixel width regardless of zoom).
   * When enabled, lines always render at the specified pixel width.
   * When disabled, lines scale with camera zoom.
   */
  setFixedPixelSize(enabled: boolean): void {
    this._fixedPixelSize = enabled;
  }

  /**
   * Set base color (background).
   */
  setBaseColor(r: number, g: number, b: number, a: number): void {
    this._baseColor = [r, g, b, a];
  }

  /**
   * Set minor grid line color.
   */
  setMinorColor(r: number, g: number, b: number, a: number): void {
    this._minorColor = [r, g, b, a];
  }

  /**
   * Set major grid line color.
   */
  setMajorColor(r: number, g: number, b: number, a: number): void {
    this._majorColor = [r, g, b, a];
  }

  /**
   * Set X axis color.
   */
  setXAxisColor(r: number, g: number, b: number, a: number): void {
    this._xAxisColor = [r, g, b, a];
  }

  /**
   * Set X axis dash color.
   */
  setXAxisDashColor(r: number, g: number, b: number, a: number): void {
    this._xAxisDashColor = [r, g, b, a];
  }

  /**
   * Set Y axis color.
   */
  setYAxisColor(r: number, g: number, b: number, a: number): void {
    this._yAxisColor = [r, g, b, a];
  }

  /**
   * Set Y axis dash color.
   */
  setYAxisDashColor(r: number, g: number, b: number, a: number): void {
    this._yAxisDashColor = [r, g, b, a];
  }

  /**
   * Set Z axis color.
   */
  setZAxisColor(r: number, g: number, b: number, a: number): void {
    this._zAxisColor = [r, g, b, a];
  }

  /**
   * Set Z axis dash color.
   */
  setZAxisDashColor(r: number, g: number, b: number, a: number): void {
    this._zAxisDashColor = [r, g, b, a];
  }

  /**
   * Set center highlight color (where axes intersect).
   */
  setCenterColor(r: number, g: number, b: number, a: number): void {
    this._centerColor = [r, g, b, a];
  }

  /**
   * Set viewport size in pixels.
   */
  setViewportSize(width: number, height: number): void {
    this._viewportWidth = width;
    this._viewportHeight = height;
  }

  /**
   * Set the view-projection matrix (combines view and projection).
   * The inverse will be computed automatically.
   */
  setViewProjection(matrix: TransformationMatrix | null): void {
    this._viewProjectionMatrix = matrix;
    this._invViewProjectionDirty = true;
  }

  /**
   * Set camera position in world space.
   */
  setCameraPosition(x: number, y: number, z: number): void {
    this._cameraPos = [x, y, z];
  }

  private static isInlineSource(src: string): boolean {
    return /void\s+main\s*\(/.test(src) || /gl_FragColor|gl_Position/.test(src);
  }

  private static resolveAssetUrl(relativePath: string): string {
    if (/^https?:\/\//.test(relativePath) || relativePath.startsWith("/")) return relativePath;
    const script = document.querySelector<HTMLScriptElement>('script[type="module"][src$="/dist/main.js"]');
    const base = script?.src ? new URL(".", script.src).toString() : new URL("/dist/", location.href).toString();
    return new URL(relativePath.replace(/^\.\//, ""), base).toString();
  }

  private async initProgram(ctx: WebGLRenderingContext): Promise<void> {
    if (this._program) return;
    // Request derivatives extension for anti-aliased grid lines (safe no-op if unavailable)
    ctx.getExtension("OES_standard_derivatives");
    let vsSource = VS_SOURCE;
    let fsSource = FS_SOURCE;

    if (!GridMesh.isInlineSource(vsSource)) {
      const url = GridMesh.resolveAssetUrl(vsSource);
      vsSource = await fetch(url).then((r) => r.text());
    }
    if (!GridMesh.isInlineSource(fsSource)) {
      const url = GridMesh.resolveAssetUrl(fsSource);
      fsSource = await fetch(url).then((r) => r.text());
    }

    const vs = ctx.createShader(ctx.VERTEX_SHADER)!;
    ctx.shaderSource(vs, vsSource);
    ctx.compileShader(vs);
    if (!ctx.getShaderParameter(vs, ctx.COMPILE_STATUS)) {
      const info = ctx.getShaderInfoLog(vs) || "";
      console.error("GridMesh vertex shader compile error:", info);
      ctx.deleteShader(vs);
      return;
    }

    const fs = ctx.createShader(ctx.FRAGMENT_SHADER)!;
    ctx.shaderSource(fs, fsSource);
    ctx.compileShader(fs);
    if (!ctx.getShaderParameter(fs, ctx.COMPILE_STATUS)) {
      const info = ctx.getShaderInfoLog(fs) || "";
      console.error("GridMesh fragment shader compile error:", info);
      ctx.deleteShader(vs);
      ctx.deleteShader(fs);
      return;
    }

    const prog = ctx.createProgram();
    if (!prog) return;
    ctx.attachShader(prog, vs);
    ctx.attachShader(prog, fs);
    ctx.linkProgram(prog);
    if (!ctx.getProgramParameter(prog, ctx.LINK_STATUS)) {
      const info = ctx.getProgramInfoLog(prog) || "";
      console.error("GridMesh program link error:", info);
      ctx.deleteShader(vs);
      ctx.deleteShader(fs);
      ctx.deleteProgram(prog);
      return;
    }

    this._program = prog;
    this._aPos = ctx.getAttribLocation(prog, "a_position");
    this._uPlane = ctx.getUniformLocation(prog, "u_plane");
    this._uInvViewProj = ctx.getUniformLocation(prog, "u_invViewProj");
    this._uViewportPx = ctx.getUniformLocation(prog, "u_viewportPx");
    this._uCameraPos = ctx.getUniformLocation(prog, "u_cameraPos");
    this._uAdaptive = ctx.getUniformLocation(prog, "u_adaptive");
    this._uCellSize = ctx.getUniformLocation(prog, "u_cellSize");
    this._uMajorDiv = ctx.getUniformLocation(prog, "u_majorDiv");
    this._uAxisLineWidth = ctx.getUniformLocation(prog, "u_axisLineWidth");
    this._uMajorLineWidth = ctx.getUniformLocation(prog, "u_majorLineWidth");
    this._uMinorLineWidth = ctx.getUniformLocation(prog, "u_minorLineWidth");
    this._uAxisDashScale = ctx.getUniformLocation(prog, "u_axisDashScale");
    this._uFixedPixelSize = ctx.getUniformLocation(prog, "u_fixedPixelSize");
    this._uBaseColor = ctx.getUniformLocation(prog, "u_baseColor");
    this._uMinorColor = ctx.getUniformLocation(prog, "u_minorColor");
    this._uMajorColor = ctx.getUniformLocation(prog, "u_majorColor");
    this._uXAxisColor = ctx.getUniformLocation(prog, "u_xAxisColor");
    this._uXAxisDashColor = ctx.getUniformLocation(prog, "u_xAxisDashColor");
    this._uYAxisColor = ctx.getUniformLocation(prog, "u_yAxisColor");
    this._uYAxisDashColor = ctx.getUniformLocation(prog, "u_yAxisDashColor");
    this._uZAxisColor = ctx.getUniformLocation(prog, "u_zAxisColor");
    this._uZAxisDashColor = ctx.getUniformLocation(prog, "u_zAxisDashColor");
    this._uCenterColor = ctx.getUniformLocation(prog, "u_centerColor");

    ctx.detachShader(prog, vs);
    ctx.detachShader(prog, fs);
    ctx.deleteShader(vs);
    ctx.deleteShader(fs);
  }

  override render(gl: WebGLRenderingContext): void {
    if (!this["_vertexBuffer"]) {
      this["_vertexBuffer"] = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this["_vertexBuffer"]);
      gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
    }

    if (!this._program) {
      if (!this._shaderInitPromise) {
        this._shaderInitPromise = this.initProgram(gl);
      }
      return;
    }

    if (this._aPos < 0) return;

    // Update inverse view-projection if needed
    if (this._invViewProjectionDirty && this._viewProjectionMatrix) {
      const vp = this._viewProjectionMatrix;
      this._invViewProjectionMatrix = vp.invert();
      this._invViewProjectionDirty = false;
    }

    gl.useProgram(this._program);

    // Plane selection: 0 = XY, 1 = XZ, 2 = YZ
    const planeValue = this._plane === "XY" ? 0 : this._plane === "XZ" ? 1 : 2;
    if (this._uPlane) gl.uniform1i(this._uPlane, planeValue);

    // Inverse view-projection matrix
    if (this._uInvViewProj) {
      if (this._invViewProjectionMatrix) {
        const cm = this._invViewProjectionMatrix.toColumnMajorArray();
        gl.uniformMatrix4fv(this._uInvViewProj, false, cm as unknown as Float32Array);
      } else {
        const identity = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
        gl.uniformMatrix4fv(this._uInvViewProj, false, identity);
      }
    }

    // Viewport size
    if (this._uViewportPx) gl.uniform2f(this._uViewportPx, this._viewportWidth, this._viewportHeight);

    // Camera position
    if (this._uCameraPos) gl.uniform3f(this._uCameraPos, this._cameraPos[0], this._cameraPos[1], this._cameraPos[2]);

    // Spacing
    if (this._uAdaptive) gl.uniform1i(this._uAdaptive, this._adaptiveSpacing ? 1 : 0);
    if (this._uCellSize) gl.uniform1f(this._uCellSize, this._cellSize);
    if (this._uMajorDiv) gl.uniform1f(this._uMajorDiv, this._majorDivisions);

    // Line widths
    if (this._uAxisLineWidth) gl.uniform1f(this._uAxisLineWidth, this._axisLineWidth);
    if (this._uMajorLineWidth) gl.uniform1f(this._uMajorLineWidth, this._majorLineWidth);
    if (this._uMinorLineWidth) gl.uniform1f(this._uMinorLineWidth, this._minorLineWidth);
    if (this._uAxisDashScale) gl.uniform1f(this._uAxisDashScale, this._axisDashScale);
    if (this._uFixedPixelSize) gl.uniform1i(this._uFixedPixelSize, this._fixedPixelSize ? 1 : 0);

    // Colors
    if (this._uBaseColor) gl.uniform4f(this._uBaseColor, this._baseColor[0], this._baseColor[1], this._baseColor[2], this._baseColor[3]);
    if (this._uMinorColor) gl.uniform4f(this._uMinorColor, this._minorColor[0], this._minorColor[1], this._minorColor[2], this._minorColor[3]);
    if (this._uMajorColor) gl.uniform4f(this._uMajorColor, this._majorColor[0], this._majorColor[1], this._majorColor[2], this._majorColor[3]);
    if (this._uXAxisColor) gl.uniform4f(this._uXAxisColor, this._xAxisColor[0], this._xAxisColor[1], this._xAxisColor[2], this._xAxisColor[3]);
    if (this._uXAxisDashColor) gl.uniform4f(this._uXAxisDashColor, this._xAxisDashColor[0], this._xAxisDashColor[1], this._xAxisDashColor[2], this._xAxisDashColor[3]);
    if (this._uYAxisColor) gl.uniform4f(this._uYAxisColor, this._yAxisColor[0], this._yAxisColor[1], this._yAxisColor[2], this._yAxisColor[3]);
    if (this._uYAxisDashColor) gl.uniform4f(this._uYAxisDashColor, this._yAxisDashColor[0], this._yAxisDashColor[1], this._yAxisDashColor[2], this._yAxisDashColor[3]);
    if (this._uZAxisColor) gl.uniform4f(this._uZAxisColor, this._zAxisColor[0], this._zAxisColor[1], this._zAxisColor[2], this._zAxisColor[3]);
    if (this._uZAxisDashColor) gl.uniform4f(this._uZAxisDashColor, this._zAxisDashColor[0], this._zAxisDashColor[1], this._zAxisDashColor[2], this._zAxisDashColor[3]);
    if (this._uCenterColor) gl.uniform4f(this._uCenterColor, this._centerColor[0], this._centerColor[1], this._centerColor[2], this._centerColor[3]);

    gl.bindBuffer(gl.ARRAY_BUFFER, this["_vertexBuffer"]);
    gl.enableVertexAttribArray(this._aPos);
    gl.vertexAttribPointer(this._aPos, 2, gl.FLOAT, false, 0, 0);
    const vertCount = this.vertices.length / 2;
    gl.drawArrays(gl.TRIANGLES, 0, vertCount);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }
}
