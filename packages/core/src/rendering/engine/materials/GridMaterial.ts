import { toColumnMajor4x4 } from "../../../utils/matrix";
import { TransformationMatrix } from "../../../utils/TransformationMatrix";
import type { BaseMaterial } from "../materials";
import type { CustomDrawConfig, ShaderProvider, ShaderSource } from "../shaders/ShaderProvider";
import { ShaderRegistry } from "../shaders/ShaderRegistry";

/**
 * Grid plane orientation.
 */
export type GridPlane = "XY" | "XZ" | "YZ";

/**
 * Options for creating a GridMaterial.
 */
export interface GridMaterialOptions {
  plane?: GridPlane;
  adaptiveSpacing?: boolean;
  cellSize?: number;
  majorDivisions?: number;
  axisLineWidth?: number;
  majorLineWidth?: number;
  minorLineWidth?: number;
  axisDashScale?: number;
  fixedPixelSize?: boolean;
  minCellPixelSize?: number;
  baseColor?: [number, number, number, number];
  minorColor?: [number, number, number, number];
  majorColor?: [number, number, number, number];
  xAxisColor?: [number, number, number, number];
  xAxisDashColor?: [number, number, number, number];
  yAxisColor?: [number, number, number, number];
  yAxisDashColor?: [number, number, number, number];
  zAxisColor?: [number, number, number, number];
  zAxisDashColor?: [number, number, number, number];
  centerColor?: [number, number, number, number];
}

// Grid shader sources
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
 * Material for the infinite grid shader.
 * Implements ShaderProvider to provide its own shaders to the backend.
 */
export class GridMaterial implements BaseMaterial, ShaderProvider {
  readonly shadingModel = "grid" as const;

  // Grid plane
  plane: GridPlane = "XY";

  // Spacing
  adaptiveSpacing = true;
  cellSize = 50;
  majorDivisions = 10;
  minCellPixelSize = 0;

  // Line widths
  axisLineWidth = 2;
  majorLineWidth = 1.5;
  minorLineWidth = 1;
  axisDashScale = 1.33;
  fixedPixelSize = false;

  // Colors
  baseColor: [number, number, number, number] = [0, 0, 0, 1];
  minorColor: [number, number, number, number] = [1, 1, 1, 1];
  majorColor: [number, number, number, number] = [1, 1, 1, 1];
  xAxisColor: [number, number, number, number] = [1, 0, 0, 1];
  xAxisDashColor: [number, number, number, number] = [0.5, 0, 0, 1];
  yAxisColor: [number, number, number, number] = [0, 1, 0, 1];
  yAxisDashColor: [number, number, number, number] = [0, 0.5, 0, 1];
  zAxisColor: [number, number, number, number] = [0, 0, 1, 1];
  zAxisDashColor: [number, number, number, number] = [0, 0, 0.5, 1];
  centerColor: [number, number, number, number] = [1, 1, 1, 1];

  constructor(options: GridMaterialOptions = {}) {
    if (options.plane !== undefined) this.plane = options.plane;
    if (options.adaptiveSpacing !== undefined) this.adaptiveSpacing = options.adaptiveSpacing;
    if (options.cellSize !== undefined) this.cellSize = options.cellSize;
    if (options.majorDivisions !== undefined) this.majorDivisions = options.majorDivisions;
    if (options.axisLineWidth !== undefined) this.axisLineWidth = options.axisLineWidth;
    if (options.majorLineWidth !== undefined) this.majorLineWidth = options.majorLineWidth;
    if (options.minorLineWidth !== undefined) this.minorLineWidth = options.minorLineWidth;
    if (options.axisDashScale !== undefined) this.axisDashScale = options.axisDashScale;
    if (options.fixedPixelSize !== undefined) this.fixedPixelSize = options.fixedPixelSize;
    if (options.minCellPixelSize !== undefined) this.minCellPixelSize = options.minCellPixelSize;
    if (options.baseColor !== undefined) this.baseColor = options.baseColor;
    if (options.minorColor !== undefined) this.minorColor = options.minorColor;
    if (options.majorColor !== undefined) this.majorColor = options.majorColor;
    if (options.xAxisColor !== undefined) this.xAxisColor = options.xAxisColor;
    if (options.xAxisDashColor !== undefined) this.xAxisDashColor = options.xAxisDashColor;
    if (options.yAxisColor !== undefined) this.yAxisColor = options.yAxisColor;
    if (options.yAxisDashColor !== undefined) this.yAxisDashColor = options.yAxisDashColor;
    if (options.zAxisColor !== undefined) this.zAxisColor = options.zAxisColor;
    if (options.zAxisDashColor !== undefined) this.zAxisDashColor = options.zAxisDashColor;
    if (options.centerColor !== undefined) this.centerColor = options.centerColor;
  }

  // ShaderProvider implementation

  getShaderSource(): ShaderSource {
    return {
      vertex: GRID_VERTEX_SOURCE,
      fragment: GRID_FRAGMENT_SOURCE,
    };
  }

  getDrawConfig(): CustomDrawConfig {
    return {
      positionComponents: 2,
      disableDepthWrite: true,
      setUniforms: (gl, program, _material, context) => {
        const material = _material as GridMaterial;

        // Compute inverse view-projection matrix
        const viewProj = multiplyMatrices(context.projMatrix, context.viewMatrix);
        const invViewProj = invertMatrix(viewProj);

        const planeValue = material.plane === "XY" ? 0 : material.plane === "XZ" ? 1 : 2;

        gl.uniform1i(gl.getUniformLocation(program, "u_plane"), planeValue);
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "u_invViewProj"), false, invViewProj);
        gl.uniform2f(gl.getUniformLocation(program, "u_viewportPx"), context.viewportWidth, context.viewportHeight);
        gl.uniform3f(gl.getUniformLocation(program, "u_cameraPos"), context.cameraPosition[0], context.cameraPosition[1], context.cameraPosition[2]);
        gl.uniform1i(gl.getUniformLocation(program, "u_adaptive"), material.adaptiveSpacing ? 1 : 0);
        gl.uniform1f(gl.getUniformLocation(program, "u_cellSize"), material.cellSize);
        gl.uniform1f(gl.getUniformLocation(program, "u_majorDiv"), material.majorDivisions);
        gl.uniform1f(gl.getUniformLocation(program, "u_axisLineWidth"), material.axisLineWidth);
        gl.uniform1f(gl.getUniformLocation(program, "u_majorLineWidth"), material.majorLineWidth);
        gl.uniform1f(gl.getUniformLocation(program, "u_minorLineWidth"), material.minorLineWidth);
        gl.uniform1f(gl.getUniformLocation(program, "u_axisDashScale"), material.axisDashScale);
        gl.uniform1i(gl.getUniformLocation(program, "u_fixedPixelSize"), material.fixedPixelSize ? 1 : 0);
        gl.uniform1f(gl.getUniformLocation(program, "u_minCellPixelSize"), material.minCellPixelSize);

        gl.uniform4fv(gl.getUniformLocation(program, "u_baseColor"), material.baseColor);
        gl.uniform4fv(gl.getUniformLocation(program, "u_minorColor"), material.minorColor);
        gl.uniform4fv(gl.getUniformLocation(program, "u_majorColor"), material.majorColor);
        gl.uniform4fv(gl.getUniformLocation(program, "u_xAxisColor"), material.xAxisColor);
        gl.uniform4fv(gl.getUniformLocation(program, "u_xAxisDashColor"), material.xAxisDashColor);
        gl.uniform4fv(gl.getUniformLocation(program, "u_yAxisColor"), material.yAxisColor);
        gl.uniform4fv(gl.getUniformLocation(program, "u_yAxisDashColor"), material.yAxisDashColor);
        gl.uniform4fv(gl.getUniformLocation(program, "u_zAxisColor"), material.zAxisColor);
        gl.uniform4fv(gl.getUniformLocation(program, "u_zAxisDashColor"), material.zAxisDashColor);
        gl.uniform4fv(gl.getUniformLocation(program, "u_centerColor"), material.centerColor);
      },
    };
  }
}

// Register grid shader with the registry
ShaderRegistry.getInstance().register("grid", {
  source: {
    vertex: GRID_VERTEX_SOURCE,
    fragment: GRID_FRAGMENT_SOURCE,
  },
  config: {
    positionComponents: 2,
    disableDepthWrite: true,
  },
});

// Matrix utilities for grid material
/**
 * Multiplies two 4x4 matrices in column-major order.
 */
function multiplyMatrices(a: Float32Array, b: Float32Array): Float32Array {
  const result = new Float32Array(16);
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) {
        sum += a[row + k * 4]! * b[k + col * 4]!;
      }
      result[row + col * 4] = sum;
    }
  }
  return result;
}

/**
 * Inverts a 4x4 matrix (column-major to row-major, invert, back to column-major).
 */
function invertMatrix(m: Float32Array): Float32Array {
  const rowMajor = new Float32Array(16);
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      rowMajor[row * 4 + col] = m[col * 4 + row]!;
    }
  }
  const tm = new TransformationMatrix(rowMajor);
  const inverted = tm.invert();
  return toColumnMajor4x4(inverted.data);
}
