import { ProgramCache } from "../../gpu/ProgramCache";
import type { IRenderBackend, DrawArgs } from "../IRenderBackend";
import type { Mesh } from "../Mesh";
import type { BaseMaterial } from "../materials";
import { GridMaterial } from "../materials/GridMaterial";
import type { VertexAttributeDesc } from "../vertexLayout";
import { toColumnMajor4x4 } from "../../../utils/matrix";
import { TransformationMatrix } from "../../../utils/TransformationMatrix";

interface MeshCacheEntry {
  vertexBuffer: WebGLBuffer;
  indexBuffer: WebGLBuffer | null;
  indexType: number | null;
  version: number;
}

interface ProgramInfo {
  program: WebGLProgram;
  attribLocations: Map<string, number>;
  uniformLocations: {
    model: WebGLUniformLocation | null;
    view: WebGLUniformLocation | null;
    proj: WebGLUniformLocation | null;
    baseColor: WebGLUniformLocation | null;
  };
}

interface GridProgramInfo {
  program: WebGLProgram;
  attribLocation: number;
  uniforms: {
    plane: WebGLUniformLocation | null;
    invViewProj: WebGLUniformLocation | null;
    viewportPx: WebGLUniformLocation | null;
    cameraPos: WebGLUniformLocation | null;
    adaptive: WebGLUniformLocation | null;
    cellSize: WebGLUniformLocation | null;
    majorDiv: WebGLUniformLocation | null;
    axisLineWidth: WebGLUniformLocation | null;
    majorLineWidth: WebGLUniformLocation | null;
    minorLineWidth: WebGLUniformLocation | null;
    axisDashScale: WebGLUniformLocation | null;
    fixedPixelSize: WebGLUniformLocation | null;
    minCellPixelSize: WebGLUniformLocation | null;
    baseColor: WebGLUniformLocation | null;
    minorColor: WebGLUniformLocation | null;
    majorColor: WebGLUniformLocation | null;
    xAxisColor: WebGLUniformLocation | null;
    xAxisDashColor: WebGLUniformLocation | null;
    yAxisColor: WebGLUniformLocation | null;
    yAxisDashColor: WebGLUniformLocation | null;
    zAxisColor: WebGLUniformLocation | null;
    zAxisDashColor: WebGLUniformLocation | null;
    centerColor: WebGLUniformLocation | null;
  };
}

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

const GRID_VERTEX_SOURCE = `
precision mediump float;
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const GRID_FRAGMENT_SOURCE = `
#extension GL_OES_standard_derivatives : enable

precision highp float;

uniform int u_plane;
uniform mat4 u_invViewProj;
uniform vec2 u_viewportPx;
uniform vec3 u_cameraPos;
uniform int u_adaptive;
uniform float u_cellSize;
uniform float u_majorDiv;
uniform float u_axisLineWidth;
uniform float u_majorLineWidth;
uniform float u_minorLineWidth;
uniform float u_axisDashScale;
uniform int u_fixedPixelSize;
uniform float u_minCellPixelSize;
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

vec3 getWorldPosOnPlane() {
  vec2 ndc = vec2(
    (gl_FragCoord.x / u_viewportPx.x) * 2.0 - 1.0,
    (gl_FragCoord.y / u_viewportPx.y) * 2.0 - 1.0
  );
  
  vec4 nearClip = vec4(ndc, -1.0, 1.0);
  vec4 farClip = vec4(ndc, 1.0, 1.0);
  
  vec4 nearWorld = u_invViewProj * nearClip;
  vec4 farWorld = u_invViewProj * farClip;
  
  nearWorld /= nearWorld.w;
  farWorld /= farWorld.w;
  
  vec3 rayDir = normalize(farWorld.xyz - nearWorld.xyz);
  vec3 rayOrigin = nearWorld.xyz;
  
  float t;
  vec3 worldPos;
  
  if (u_plane == 0) {
    if (abs(rayDir.z) < 1e-6) {
      worldPos = vec3(rayOrigin.xy, 0.0);
    } else {
      t = -rayOrigin.z / rayDir.z;
      worldPos = rayOrigin + rayDir * t;
    }
  } else if (u_plane == 1) {
    if (abs(rayDir.y) < 1e-6) {
      worldPos = vec3(rayOrigin.xz, 0.0).xzy;
    } else {
      t = -rayOrigin.y / rayDir.y;
      worldPos = rayOrigin + rayDir * t;
    }
  } else {
    if (abs(rayDir.x) < 1e-6) {
      worldPos = vec3(rayOrigin.yz, 0.0).yxz;
    } else {
      t = -rayOrigin.x / rayDir.x;
      worldPos = rayOrigin + rayDir * t;
    }
  }
  
  return worldPos;
}

void getPlaneCoords(vec3 worldPos, out vec2 uv, out vec2 axisDist) {
  if (u_plane == 0) {
    uv = worldPos.xy;
    axisDist = worldPos.xy;
  } else if (u_plane == 1) {
    uv = worldPos.xz;
    axisDist = worldPos.xz;
  } else {
    uv = worldPos.yz;
    axisDist = worldPos.yz;
  }
}

float gridLayer(vec2 uv, float spacing, float lineWidthPx, vec2 wpp) {
  vec2 dist = abs(fract(uv / spacing + 0.5) - 0.5) * spacing;
  vec2 targetWidthWorldVec = lineWidthPx * wpp;
  vec2 aaWidth = wpp;
  vec2 halfWidth = targetWidthWorldVec * 0.5;
  vec2 gridVec = smoothstep(halfWidth + aaWidth, halfWidth - aaWidth, dist);
  return max(gridVec.x, gridVec.y);
}

void main() {
  vec3 worldPos = getWorldPosOnPlane();
  vec2 uv, axisDist;
  getPlaneCoords(worldPos, uv, axisDist);
  
  vec2 uvDDX = dFdx(uv);
  vec2 uvDDY = dFdy(uv);
  vec2 wpp = vec2(length(uvDDX), length(uvDDY));
  wpp = max(wpp, vec2(1e-6));
  
  float spacing = u_cellSize;
  if (u_adaptive != 0) {
    float maxWpp = max(wpp.x, wpp.y);
    float minWorldSpacing = u_minCellPixelSize * maxWpp;
    float n = ceil(log2(max(minWorldSpacing / max(spacing, 1e-6), 1e-6)));
    n = max(n, 0.0);
    spacing = spacing * pow(2.0, n);
  }
  
  float div = max(2.0, floor(u_majorDiv + 0.5));
  float majorSpacing = spacing * div;
  
  float minorInt = gridLayer(uv, spacing, u_minorLineWidth, wpp);
  float majorInt = gridLayer(uv, majorSpacing, u_majorLineWidth, wpp);
  
  vec4 minorCol = u_minorColor;
  vec4 majorCol = u_majorColor;
  vec4 col = u_baseColor;
  
  col = mix(col, minorCol, minorInt * minorCol.a);
  col = mix(col, majorCol, majorInt * majorCol.a);
  
  float axisWidthPx = u_axisLineWidth;
  vec2 axisDistAbs = abs(axisDist);
  vec2 axisTargetWidth = axisWidthPx * wpp;
  vec2 axisAA = wpp;
  vec2 axisInt = smoothstep(axisTargetWidth * 0.5 + axisAA, axisTargetWidth * 0.5 - axisAA, axisDistAbs);
  
  vec4 xColor = u_xAxisColor;
  vec4 yColor = u_yAxisColor;
  
  if (u_plane == 1) {
    yColor = u_zAxisColor;
  } else if (u_plane == 2) {
    xColor = u_yAxisColor;
    yColor = u_zAxisColor;
  }
  
  col = mix(col, yColor, axisInt.x * yColor.a);
  col = mix(col, xColor, axisInt.y * xColor.a);
  
  float centerInt = min(axisInt.x, axisInt.y);
  col = mix(col, u_centerColor, centerInt * u_centerColor.a);

  gl_FragColor = vec4(col.rgb * col.a, col.a);
}
`;

/**
 *
 */
export class WebGLBackend implements IRenderBackend {
  private readonly programCache = new ProgramCache();
  private readonly meshCache = new WeakMap<Mesh, MeshCacheEntry>();
  private readonly programInfoCache = new Map<string, ProgramInfo>();
  private gridProgramInfo: GridProgramInfo | null = null;
  private viewportWidth = 1;
  private viewportHeight = 1;

  constructor(private gl: WebGLRenderingContext) {
    // Enable derivatives extension for grid AA
    gl.getExtension("OES_standard_derivatives");
  }

  beginFrame(viewportWidth: number, viewportHeight: number): void {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
    this.gl.viewport(0, 0, viewportWidth, viewportHeight);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }

  endFrame(): void {
    // no-op for WebGL
  }

  prepareMesh(mesh: Mesh): void {
    const cached = this.meshCache.get(mesh);
    if (cached && cached.version === mesh.version) return;

    const vertexBuffer = cached?.vertexBuffer ?? this.gl.createBuffer();
    if (!vertexBuffer) throw new Error("Failed to create vertex buffer");
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, mesh.vertices, this.gl.STATIC_DRAW);

    let indexBuffer: WebGLBuffer | null = null;
    let indexType: number | null = null;
    if (mesh.indices.length > 0) {
      indexBuffer = cached?.indexBuffer ?? this.gl.createBuffer();
      if (!indexBuffer) throw new Error("Failed to create index buffer");
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, mesh.indices, this.gl.STATIC_DRAW);
      indexType = mesh.indices instanceof Uint32Array ? this.gl.UNSIGNED_INT : this.gl.UNSIGNED_SHORT;
    }

    this.meshCache.set(mesh, {
      vertexBuffer,
      indexBuffer,
      indexType,
      version: mesh.version,
    });
  }

  prepareMaterial(_material: BaseMaterial): void {
    // No-op for now. Hook for textures/pipelines.
  }

  drawMesh(args: DrawArgs): void {
    const { mesh, material } = args;

    // Handle grid material specially
    if (material.shadingModel === "grid" && material instanceof GridMaterial) {
      this.drawGrid(args, material);
      return;
    }

    this.prepareMesh(mesh);
    const entry = this.meshCache.get(mesh);
    if (!entry) return;

    const programInfo = this.getProgramInfo(material, mesh);
    this.gl.useProgram(programInfo.program);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, entry.vertexBuffer);
    if (entry.indexBuffer) {
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, entry.indexBuffer);
    }

    this.bindAttributes(mesh.layout.attributes, mesh.layout.stride, programInfo.attribLocations);

    const baseColor = material.baseColor ?? [1, 1, 1, 1];
    if (programInfo.uniformLocations.model) this.gl.uniformMatrix4fv(programInfo.uniformLocations.model, false, args.modelMatrix);
    if (programInfo.uniformLocations.view) this.gl.uniformMatrix4fv(programInfo.uniformLocations.view, false, args.viewMatrix);
    if (programInfo.uniformLocations.proj) this.gl.uniformMatrix4fv(programInfo.uniformLocations.proj, false, args.projMatrix);
    if (programInfo.uniformLocations.baseColor) {
      this.gl.uniform4f(programInfo.uniformLocations.baseColor, baseColor[0], baseColor[1], baseColor[2], baseColor[3]);
    }

    const drawMode = material.wireframe ? this.gl.LINES : this.toGLDrawMode(mesh.drawMode);
    if (mesh.indices.length > 0 && entry.indexType !== null) {
      this.gl.drawElements(drawMode, mesh.indices.length, entry.indexType, 0);
    } else {
      this.gl.drawArrays(drawMode, 0, mesh.vertexCount);
    }
  }

  private drawGrid(args: DrawArgs, material: GridMaterial): void {
    const { mesh } = args;
    this.prepareMesh(mesh);
    const entry = this.meshCache.get(mesh);
    if (!entry) return;

    const programInfo = this.getGridProgramInfo();
    if (!programInfo) return;

    this.gl.useProgram(programInfo.program);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, entry.vertexBuffer);
    if (entry.indexBuffer) {
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, entry.indexBuffer);
    }

    // Enable position attribute (2D for grid)
    this.gl.enableVertexAttribArray(programInfo.attribLocation);
    this.gl.vertexAttribPointer(programInfo.attribLocation, 2, this.gl.FLOAT, false, 0, 0);

    // Compute inverse view-projection matrix
    const viewProj = this.multiplyMatrices(args.projMatrix, args.viewMatrix);
    const invViewProj = this.invertMatrix(viewProj);

    const uniforms = programInfo.uniforms;
    const planeValue = material.plane === "XY" ? 0 : material.plane === "XZ" ? 1 : 2;

    this.gl.uniform1i(uniforms.plane, planeValue);
    this.gl.uniformMatrix4fv(uniforms.invViewProj, false, invViewProj);
    this.gl.uniform2f(uniforms.viewportPx, this.viewportWidth, this.viewportHeight);
    this.gl.uniform3f(uniforms.cameraPos, args.cameraPosition[0], args.cameraPosition[1], args.cameraPosition[2]);
    this.gl.uniform1i(uniforms.adaptive, material.adaptiveSpacing ? 1 : 0);
    this.gl.uniform1f(uniforms.cellSize, material.cellSize);
    this.gl.uniform1f(uniforms.majorDiv, material.majorDivisions);
    this.gl.uniform1f(uniforms.axisLineWidth, material.axisLineWidth);
    this.gl.uniform1f(uniforms.majorLineWidth, material.majorLineWidth);
    this.gl.uniform1f(uniforms.minorLineWidth, material.minorLineWidth);
    this.gl.uniform1f(uniforms.axisDashScale, material.axisDashScale);
    this.gl.uniform1i(uniforms.fixedPixelSize, material.fixedPixelSize ? 1 : 0);
    this.gl.uniform1f(uniforms.minCellPixelSize, material.minCellPixelSize);

    this.gl.uniform4fv(uniforms.baseColor, material.baseColor);
    this.gl.uniform4fv(uniforms.minorColor, material.minorColor);
    this.gl.uniform4fv(uniforms.majorColor, material.majorColor);
    this.gl.uniform4fv(uniforms.xAxisColor, material.xAxisColor);
    this.gl.uniform4fv(uniforms.xAxisDashColor, material.xAxisDashColor);
    this.gl.uniform4fv(uniforms.yAxisColor, material.yAxisColor);
    this.gl.uniform4fv(uniforms.yAxisDashColor, material.yAxisDashColor);
    this.gl.uniform4fv(uniforms.zAxisColor, material.zAxisColor);
    this.gl.uniform4fv(uniforms.zAxisDashColor, material.zAxisDashColor);
    this.gl.uniform4fv(uniforms.centerColor, material.centerColor);

    // Disable depth write for grid (background)
    this.gl.depthMask(false);

    if (mesh.indices.length > 0 && entry.indexType !== null) {
      this.gl.drawElements(this.gl.TRIANGLES, mesh.indices.length, entry.indexType, 0);
    } else {
      this.gl.drawArrays(this.gl.TRIANGLES, 0, mesh.vertexCount);
    }

    this.gl.depthMask(true);
  }

  private getGridProgramInfo(): GridProgramInfo | null {
    if (this.gridProgramInfo) return this.gridProgramInfo;

    const program = this.programCache.getOrCreate(this.gl, "grid", GRID_VERTEX_SOURCE, GRID_FRAGMENT_SOURCE);
    if (!program) {
      console.error("Failed to create grid program");
      return null;
    }

    this.gridProgramInfo = {
      program,
      attribLocation: this.gl.getAttribLocation(program, "a_position"),
      uniforms: {
        plane: this.gl.getUniformLocation(program, "u_plane"),
        invViewProj: this.gl.getUniformLocation(program, "u_invViewProj"),
        viewportPx: this.gl.getUniformLocation(program, "u_viewportPx"),
        cameraPos: this.gl.getUniformLocation(program, "u_cameraPos"),
        adaptive: this.gl.getUniformLocation(program, "u_adaptive"),
        cellSize: this.gl.getUniformLocation(program, "u_cellSize"),
        majorDiv: this.gl.getUniformLocation(program, "u_majorDiv"),
        axisLineWidth: this.gl.getUniformLocation(program, "u_axisLineWidth"),
        majorLineWidth: this.gl.getUniformLocation(program, "u_majorLineWidth"),
        minorLineWidth: this.gl.getUniformLocation(program, "u_minorLineWidth"),
        axisDashScale: this.gl.getUniformLocation(program, "u_axisDashScale"),
        fixedPixelSize: this.gl.getUniformLocation(program, "u_fixedPixelSize"),
        minCellPixelSize: this.gl.getUniformLocation(program, "u_minCellPixelSize"),
        baseColor: this.gl.getUniformLocation(program, "u_baseColor"),
        minorColor: this.gl.getUniformLocation(program, "u_minorColor"),
        majorColor: this.gl.getUniformLocation(program, "u_majorColor"),
        xAxisColor: this.gl.getUniformLocation(program, "u_xAxisColor"),
        xAxisDashColor: this.gl.getUniformLocation(program, "u_xAxisDashColor"),
        yAxisColor: this.gl.getUniformLocation(program, "u_yAxisColor"),
        yAxisDashColor: this.gl.getUniformLocation(program, "u_yAxisDashColor"),
        zAxisColor: this.gl.getUniformLocation(program, "u_zAxisColor"),
        zAxisDashColor: this.gl.getUniformLocation(program, "u_zAxisDashColor"),
        centerColor: this.gl.getUniformLocation(program, "u_centerColor"),
      },
    };

    return this.gridProgramInfo;
  }

  private multiplyMatrices(a: Float32Array, b: Float32Array): Float32Array {
    const result = new Float32Array(16);
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        let sum = 0;
        for (let k = 0; k < 4; k++) {
          sum += a[row + k * 4] * b[k + col * 4];
        }
        result[row + col * 4] = sum;
      }
    }
    return result;
  }

  private invertMatrix(m: Float32Array): Float32Array {
    // Create a TransformationMatrix from column-major data, invert it, and return column-major
    // TransformationMatrix expects row-major, so we need to transpose
    const rowMajor = new Float32Array(16);
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        rowMajor[row * 4 + col] = m[col * 4 + row];
      }
    }
    const tm = new TransformationMatrix(rowMajor);
    const inverted = tm.invert();
    return toColumnMajor4x4(inverted.data);
  }

  private getProgramInfo(material: BaseMaterial, mesh: Mesh): ProgramInfo {
    const positionAttr = mesh.layout.attributes.find((attr) => attr.semantic === "position");
    const positionComponents = positionAttr?.components ?? 3;
    const key = `${material.shadingModel}:pos${positionComponents}`;
    const cached = this.programInfoCache.get(key);
    if (cached) return cached;

    const program = this.programCache.getOrCreate(this.gl, key, UNLIT_VERTEX_SOURCE, UNLIT_FRAGMENT_SOURCE);
    if (!program) throw new Error("Failed to build WebGL program");

    const info: ProgramInfo = {
      program,
      attribLocations: new Map([["position", this.gl.getAttribLocation(program, "a_position")]]),
      uniformLocations: {
        model: this.gl.getUniformLocation(program, "u_model"),
        view: this.gl.getUniformLocation(program, "u_view"),
        proj: this.gl.getUniformLocation(program, "u_proj"),
        baseColor: this.gl.getUniformLocation(program, "u_baseColor"),
      },
    };

    this.programInfoCache.set(key, info);
    return info;
  }

  private bindAttributes(attributes: VertexAttributeDesc[], stride: number, locations: Map<string, number>): void {
    for (const attr of attributes) {
      const location = locations.get(attr.semantic === "position" ? "position" : attr.semantic) ?? -1;
      if (location < 0) continue;
      this.gl.enableVertexAttribArray(location);
      this.gl.vertexAttribPointer(location, attr.components, this.toGLType(attr.type), attr.normalized, stride, attr.offset);
    }
  }

  private toGLType(type: VertexAttributeDesc["type"]): number {
    switch (type) {
      case "uint8":
        return this.gl.UNSIGNED_BYTE;
      case "uint16":
        return this.gl.UNSIGNED_SHORT;
      case "float":
      default:
        return this.gl.FLOAT;
    }
  }

  private toGLDrawMode(mode: Mesh["drawMode"]): number {
    switch (mode) {
      case "lines":
        return this.gl.LINES;
      case "points":
        return this.gl.POINTS;
      case "triangles":
      default:
        return this.gl.TRIANGLES;
    }
  }
}
