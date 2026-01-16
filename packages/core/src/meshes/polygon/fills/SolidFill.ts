import type { IRenderContext } from "../../../rendering/context";
import type { PolygonFill, PolygonFillUniformLocations } from "./PolygonFill";

const FRAG_SOURCE = `precision mediump float;

uniform vec4 u_color;

void main() {
  gl_FragColor = u_color;
}`;

/**
 *
 */
export interface SolidFillColor {
  r: number;
  g: number;
  b: number;
  a?: number;
}

/**
 * Solid color fill backed by a simple uniform.
 */
export class SolidFill implements PolygonFill {
  constructor(private _color: SolidFillColor) {}

  get color(): SolidFillColor {
    return this._color;
  }

  set color(value: SolidFillColor) {
    this._color = value;
  }

  getCacheKey(): string {
    return "solid";
  }

  getFragmentSource(): string {
    return FRAG_SOURCE;
  }

  getUniformLocations(gl: WebGLRenderingContext, program: WebGLProgram): PolygonFillUniformLocations {
    return {
      u_color: gl.getUniformLocation(program, "u_color") as number | null,
    };
  }

  applyUniforms(ctx: IRenderContext, locations: PolygonFillUniformLocations): void {
    const location = locations.u_color ?? null;
    if (location === null) return;
    const { r, g, b, a = 1 } = this._color;
    ctx.uniform4f(location, r, g, b, a);
  }
}
