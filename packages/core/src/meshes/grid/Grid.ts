import type { IRenderContext } from "../../rendering/context";
import { Mesh } from "../../scene/Mesh";
import { TransformationMatrix } from "../../utils/TransformationMatrix";

const VS_SOURCE = `precision mediump float;

attribute vec2 a_position; // clip-space positions for a fullscreen triangle

void main() {
  // Fullscreen triangle in clip space: (-1,-1), (3,-1), (-1,3)
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FS_SOURCE = `#extension GL_OES_standard_derivatives : enable

precision highp float;

// Plane selection: 0 = XY, 1 = XZ, 2 = YZ
uniform int u_plane;

// Inverse view-projection matrix (for world reconstruction)
uniform mat4 u_invViewProj;

// Viewport size in pixels
uniform vec2 u_viewportPx;

// Camera position in world space
uniform vec3 u_cameraPos;

// Spacing control
uniform int u_adaptive; // 1 = adaptive, 0 = fixed
uniform float u_cellSize; // fixed cell size in world units (base size)
uniform float u_majorDiv; // major grid divisions (every Nth line is major)
uniform float u_minCellPixelSize; // minimum visual size in pixels before collapsing

// Line widths (pixels)
uniform float u_axisLineWidth;
uniform float u_majorLineWidth;
uniform float u_minorLineWidth;
uniform float u_axisDashScale;
uniform int u_fixedPixelSize; // 1 = fixed pixel size (ignore zoom), 0 = scale with zoom

// Colors (linear RGB, non-premultiplied; we premultiply in shader)
uniform vec4 u_baseColor;
uniform vec4 u_minorColor;
uniform vec4 u_majorColor;
uniform vec4 u_xAxisColor;
uniform vec4 u_xAxisDashColor;
uniform vec4 u_yAxisColor;
uniform vec4 u_yAxisDashColor;
uniform vec4 u_zAxisColor;
uniform vec4 u_zAxisDashColor;
uniform vec4 u_centerColor;

// Reconstruct world position on the selected plane from fragment coordinates
vec3 getWorldPosOnPlane() {
  // Convert fragment coordinates to NDC [-1, 1]
  vec2 ndc = vec2(
    (gl_FragCoord.x / u_viewportPx.x) * 2.0 - 1.0,
    (gl_FragCoord.y / u_viewportPx.y) * 2.0 - 1.0
  );
  
  // Unproject near and far points
  vec4 nearClip = vec4(ndc, -1.0, 1.0);
  vec4 farClip = vec4(ndc, 1.0, 1.0);
  
  vec4 nearWorld = u_invViewProj * nearClip;
  vec4 farWorld = u_invViewProj * farClip;
  
  nearWorld /= nearWorld.w;
  farWorld /= farWorld.w;
  
  vec3 rayDir = normalize(farWorld.xyz - nearWorld.xyz);
  vec3 rayOrigin = nearWorld.xyz;
  
  // Intersect ray with selected plane
  float t;
  vec3 worldPos;
  
  if (u_plane == 0) {
    // XY plane (z = 0)
    if (abs(rayDir.z) < 1e-6) {
      worldPos = vec3(rayOrigin.xy, 0.0);
    } else {
      t = -rayOrigin.z / rayDir.z;
      worldPos = rayOrigin + rayDir * t;
    }
  } else if (u_plane == 1) {
    // XZ plane (y = 0)
    if (abs(rayDir.y) < 1e-6) {
      worldPos = vec3(rayOrigin.xz, 0.0).xzy;
    } else {
      t = -rayOrigin.y / rayDir.y;
      worldPos = rayOrigin + rayDir * t;
    }
  } else {
    // YZ plane (x = 0)
    if (abs(rayDir.x) < 1e-6) {
      worldPos = vec3(rayOrigin.yz, 0.0).yxz;
    } else {
      t = -rayOrigin.x / rayDir.x;
      worldPos = rayOrigin + rayDir * t;
    }
  }
  
  return worldPos;
}

// Get plane UV coordinates and axis distances based on selected plane
void getPlaneCoords(vec3 worldPos, out vec2 uv, out vec2 axisDist) {
  if (u_plane == 0) {
    // XY plane: uv = (x, y), axisDist = (x, y)
    uv = worldPos.xy;
    axisDist = worldPos.xy;
  } else if (u_plane == 1) {
    // XZ plane: uv = (x, z), axisDist = (x, z)
    uv = worldPos.xz;
    axisDist = worldPos.xz;
  } else {
    // YZ plane: uv = (y, z), axisDist = (y, z)
    uv = worldPos.yz;
    axisDist = worldPos.yz;
  }
}

// Compute grid line intensity for a given spacing
float gridLayer(vec2 uv, float spacing, float lineWidthPx, vec2 wpp) {
  // Distance to nearest grid line in world units
  vec2 dist = abs(fract(uv / spacing + 0.5) - 0.5) * spacing;
  
  // Target visual width in pixels
  // If u_fixedPixelSize is true, lineWidthPx is pixels.
  // If false, it's world units (but we treat it as pixels for simplicity in this path for now)
  // Let's strictly follow the request: "ensure that lines are not change on zoom level"
  // So we always interpret u_...LineWidth as pixels.
  
  float targetWidthWorld = lineWidthPx * max(wpp.x, wpp.y); // Approximate width in world
  // Better: calculate per-axis width
  vec2 targetWidthWorldVec = lineWidthPx * wpp;
  
  // Smoothstep for AA
  // We want the line to be 1.0 at dist=0 and fade out at dist=targetWidthWorld/2
  // Standard AA: smoothstep(width/2 + aa, width/2 - aa, dist)
  // AA width is typically 1 pixel = wpp
  
  vec2 aaWidth = wpp; // 1 pixel blur
  vec2 halfWidth = targetWidthWorldVec * 0.5;
  
  vec2 gridVec = smoothstep(halfWidth + aaWidth, halfWidth - aaWidth, dist);
  
  return max(gridVec.x, gridVec.y);
}

void main() {
  vec3 worldPos = getWorldPosOnPlane();
  vec2 uv, axisDist;
  getPlaneCoords(worldPos, uv, axisDist);
  
  // World units per pixel (derivative)
  vec2 uvDDX = dFdx(uv);
  vec2 uvDDY = dFdy(uv);
  vec2 wpp = vec2(length(uvDDX), length(uvDDY)); // World Per Pixel
  wpp = max(wpp, vec2(1e-6));
  
  // Adaptive Spacing Logic
  float spacing = u_cellSize;
  if (u_adaptive != 0) {
    float maxWpp = max(wpp.x, wpp.y);
    float minWorldSpacing = u_minCellPixelSize * maxWpp;
    
    // We want spacing = base * 2^n >= minWorldSpacing
    // 2^n >= minWorldSpacing / base
    // n >= log2(minWorldSpacing / base)
    
    float n = ceil(log2(max(minWorldSpacing / max(spacing, 1e-6), 1e-6)));
    // Ensure we don't go below base spacing if min pixel size is small
    n = max(n, 0.0);
    
    spacing = spacing * pow(2.0, n);
  }
  
  // Major lines are every N * spacing
  float div = max(2.0, floor(u_majorDiv + 0.5));
  float majorSpacing = spacing * div;
  
  // Draw Minor Grid
  float minorInt = gridLayer(uv, spacing, u_minorLineWidth, wpp);
  
  // Draw Major Grid
  float majorInt = gridLayer(uv, majorSpacing, u_majorLineWidth, wpp);
  
  // Combine Minor and Major
  // Major lines should overwrite minor lines, or be blended.
  // Since they align, max() works well.
  
  vec4 minorCol = u_minorColor;
  vec4 majorCol = u_majorColor;
  
  // Base color
  vec4 col = u_baseColor;
  
  // Blend minor
  col = mix(col, minorCol, minorInt * minorCol.a);
  
  // Blend major
  col = mix(col, majorCol, majorInt * majorCol.a);
  
  // Axis Lines
  // X axis corresponds to Y=0 (or Z=0), i.e., second component of uv is 0.
  // Y axis corresponds to X=0 (or Y=0), i.e., first component of uv is 0.
  
  // Draw Axis lines
  // Axis width
  float axisWidthPx = u_axisLineWidth;
  
  vec2 axisDistAbs = abs(axisDist);
  vec2 axisTargetWidth = axisWidthPx * wpp;
  vec2 axisAA = wpp;
  
  vec2 axisInt = smoothstep(axisTargetWidth * 0.5 + axisAA, axisTargetWidth * 0.5 - axisAA, axisDistAbs);
  
  // Select axis colors
  vec4 xColor = u_xAxisColor;
  vec4 yColor = u_yAxisColor; // Or Z depending on plane
  
  if (u_plane == 1) { // XZ plane
    yColor = u_zAxisColor;
  } else if (u_plane == 2) { // YZ plane
    xColor = u_yAxisColor;
    yColor = u_zAxisColor;
  }
  
  // Dashed patterns for negative axes?
  // User didn't strictly request dashes, but "axis lines - like red and green".
  // Keeping simple solid lines for axes as per "like red and green". 
  // If we want negative dashes, we can add check for axisDist < 0.
  
  // Blend axes
  // "y-axis" is the line where x=0 (axisDist.x=0). So axisInt.x is the vertical line intensity.
  // "x-axis" is the line where y=0 (axisDist.y=0). So axisInt.y is the horizontal line intensity.
  
  // Note: standard naming confusion. 
  // The line x=0 is the Y-axis (or Z-axis). It has color of Y-axis.
  // The line y=0 is the X-axis. It has color of X-axis.
  
  // Vertical line (x=0) -> Y/Z axis color
  col = mix(col, yColor, axisInt.x * yColor.a);
  
  // Horizontal line (y=0) -> X/Y axis color
  col = mix(col, xColor, axisInt.y * xColor.a);
  
  // Center highlight?
  // Optional, but good for visibility.
  float centerInt = min(axisInt.x, axisInt.y);
  col = mix(col, u_centerColor, centerInt * u_centerColor.a);

  // Premultiply alpha
  gl_FragColor = vec4(col.rgb * col.a, col.a);
}`;

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
  private _uMinCellPixelSize: WebGLUniformLocation | null = null;
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
  private _minCellPixelSize = 0;
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

  constructor(_vertices?: Float32Array) {
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
   * Set minimum cell size in pixels for adaptive grid.
   * If the visual size of a cell drops below this, the grid will switch to a larger interval.
   */
  setMinCellPixelSize(pixels: number): void {
    if (Number.isFinite(pixels) && pixels >= 0) this._minCellPixelSize = pixels;
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
    this._uMinCellPixelSize = ctx.getUniformLocation(prog, "u_minCellPixelSize");
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

  override render(ctx: IRenderContext): void {
    const gl = ctx.getWebGLContext();
    if (!gl) {
      throw new Error("GridMesh requires WebGL context");
    }

    if (!this["_vertexBuffer"]) {
      this["_vertexBuffer"] = ctx.createVertexBuffer(this.vertices);
    } else {
      ctx.bindVertexBuffer(this["_vertexBuffer"]);
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
    gl.uniform1i(this._uPlane, planeValue);

    // Inverse view-projection matrix
    if (this._invViewProjectionMatrix) {
      const cm = this._invViewProjectionMatrix.toColumnMajorArray();
      gl.uniformMatrix4fv(this._uInvViewProj, false, cm);
    } else {
      const identity = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
      gl.uniformMatrix4fv(this._uInvViewProj, false, identity);
    }

    // Viewport size
    // Use actual GL viewport/drawing buffer size instead of cached state which might be stale
    this._viewportWidth = gl.drawingBufferWidth;
    this._viewportHeight = gl.drawingBufferHeight;
    gl.uniform2f(this._uViewportPx, this._viewportWidth, this._viewportHeight);

    // Camera position
    gl.uniform3f(this._uCameraPos, this._cameraPos[0], this._cameraPos[1], this._cameraPos[2]);

    // Spacing
    gl.uniform1i(this._uAdaptive, this._adaptiveSpacing ? 1 : 0);
    gl.uniform1f(this._uCellSize, this._cellSize);
    gl.uniform1f(this._uMajorDiv, this._majorDivisions);

    // Line widths
    gl.uniform1f(this._uAxisLineWidth, this._axisLineWidth);
    gl.uniform1f(this._uMajorLineWidth, this._majorLineWidth);
    gl.uniform1f(this._uMinorLineWidth, this._minorLineWidth);
    gl.uniform1f(this._uAxisDashScale, this._axisDashScale);
    gl.uniform1i(this._uFixedPixelSize, this._fixedPixelSize ? 1 : 0);
    gl.uniform1f(this._uMinCellPixelSize, this._minCellPixelSize);

    // Colors
    gl.uniform4f(this._uBaseColor, this._baseColor[0], this._baseColor[1], this._baseColor[2], this._baseColor[3]);
    gl.uniform4f(this._uMinorColor, this._minorColor[0], this._minorColor[1], this._minorColor[2], this._minorColor[3]);
    gl.uniform4f(this._uMajorColor, this._majorColor[0], this._majorColor[1], this._majorColor[2], this._majorColor[3]);
    gl.uniform4f(this._uXAxisColor, this._xAxisColor[0], this._xAxisColor[1], this._xAxisColor[2], this._xAxisColor[3]);
    gl.uniform4f(this._uXAxisDashColor, this._xAxisDashColor[0], this._xAxisDashColor[1], this._xAxisDashColor[2], this._xAxisDashColor[3]);
    gl.uniform4f(this._uYAxisColor, this._yAxisColor[0], this._yAxisColor[1], this._yAxisColor[2], this._yAxisColor[3]);
    gl.uniform4f(this._uYAxisDashColor, this._yAxisDashColor[0], this._yAxisDashColor[1], this._yAxisDashColor[2], this._yAxisDashColor[3]);
    gl.uniform4f(this._uZAxisColor, this._zAxisColor[0], this._zAxisColor[1], this._zAxisColor[2], this._zAxisColor[3]);
    gl.uniform4f(this._uZAxisDashColor, this._zAxisDashColor[0], this._zAxisDashColor[1], this._zAxisDashColor[2], this._zAxisDashColor[3]);
    gl.uniform4f(this._uCenterColor, this._centerColor[0], this._centerColor[1], this._centerColor[2], this._centerColor[3]);

    ctx.enableVertexAttribArray(this._aPos);
    ctx.vertexAttribPointer(this._aPos, 2, gl.FLOAT, false, 0, 0);
    const vertCount = this.vertices.length / 2;

    // Disable depth write for grid (background) to allow subsequent objects to draw over it
    // especially if they are coplanar (z=0) and depth func is LESS
    gl.depthMask(false);
    ctx.drawArrays(gl.TRIANGLES, 0, vertCount);
    gl.depthMask(true);
  }
}
