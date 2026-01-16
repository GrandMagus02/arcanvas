import type { DrawArgs, IRenderBackend } from "../IRenderBackend";
import type { Mesh } from "../Mesh";
import type { BaseMaterial } from "../materials";

/**
 * Canvas2D rendering backend implementation.
 * Renders meshes using CPU-based 2D canvas operations.
 */
export class Canvas2DBackend implements IRenderBackend {
  private viewportWidth = 1;
  private viewportHeight = 1;

  constructor(private ctx: CanvasRenderingContext2D) {}

  beginFrame(viewportWidth: number, viewportHeight: number): void {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, viewportWidth, viewportHeight);
  }

  endFrame(): void {
    // no-op for canvas2d
  }

  prepareMesh(_mesh: Mesh): void {
    void _mesh; // No-op for CPU path
  }

  prepareMaterial(_material: BaseMaterial): void {
    void _material; // No-op for CPU path
  }

  drawMesh(args: DrawArgs): void {
    const baseColor = args.material.baseColor ?? [1, 1, 1, 1];
    this.ctx.fillStyle = rgbaToCss(baseColor);

    const mvp = multiply4x4(args.projMatrix, multiply4x4(args.viewMatrix, args.modelMatrix));
    const positions = extractPositions(args.mesh, mvp, this.viewportWidth, this.viewportHeight);

    drawTriangles2D(this.ctx, positions, args.mesh.indices);
  }
}

/**
 * Extracts and transforms vertex positions from mesh to screen coordinates.
 */
function extractPositions(mesh: Mesh, mvp: Float32Array, width: number, height: number): Float32Array {
  const attr = mesh.layout.attributes.find((a) => a.semantic === "position");
  const components = attr?.components ?? 3;
  const stride = mesh.layout.stride / Float32Array.BYTES_PER_ELEMENT;
  const offset = (attr?.offset ?? 0) / Float32Array.BYTES_PER_ELEMENT;
  const count = mesh.vertexCount;
  const out = new Float32Array(count * 2);

  for (let i = 0; i < count; i++) {
    const base = i * stride + offset;
    const x = mesh.vertices[base] ?? 0;
    const y = mesh.vertices[base + 1] ?? 0;
    const z = components > 2 ? (mesh.vertices[base + 2] ?? 0) : 0;
    const [clipX, clipY, clipW] = transformPosition(mvp, x, y, z);
    const ndcX = clipW !== 0 ? clipX / clipW : clipX;
    const ndcY = clipW !== 0 ? clipY / clipW : clipY;
    out[i * 2] = (ndcX * 0.5 + 0.5) * width;
    out[i * 2 + 1] = (1 - (ndcY * 0.5 + 0.5)) * height;
  }

  return out;
}

/**
 * Draws triangles using Canvas2D fill operations.
 */
function drawTriangles2D(ctx: CanvasRenderingContext2D, points: Float32Array, indices: Uint16Array | Uint32Array): void {
  if (indices.length > 0) {
    for (let i = 0; i < indices.length; i += 3) {
      const i0 = indices[i] ?? 0;
      const i1 = indices[i + 1] ?? 0;
      const i2 = indices[i + 2] ?? 0;
      ctx.beginPath();
      ctx.moveTo(points[i0 * 2]!, points[i0 * 2 + 1]!);
      ctx.lineTo(points[i1 * 2]!, points[i1 * 2 + 1]!);
      ctx.lineTo(points[i2 * 2]!, points[i2 * 2 + 1]!);
      ctx.closePath();
      ctx.fill();
    }
  } else {
    for (let i = 0; i < points.length; i += 6) {
      ctx.beginPath();
      ctx.moveTo(points[i]!, points[i + 1]!);
      ctx.lineTo(points[i + 2]!, points[i + 3]!);
      ctx.lineTo(points[i + 4]!, points[i + 5]!);
      ctx.closePath();
      ctx.fill();
    }
  }
}

/**
 * Converts RGBA color array to CSS rgba string.
 */
function rgbaToCss(color: [number, number, number, number]): string {
  const [r, g, b, a] = color;
  const rr = Math.round(Math.min(Math.max(r, 0), 1) * 255);
  const gg = Math.round(Math.min(Math.max(g, 0), 1) * 255);
  const bb = Math.round(Math.min(Math.max(b, 0), 1) * 255);
  return `rgba(${rr}, ${gg}, ${bb}, ${Math.min(Math.max(a, 0), 1)})`;
}

/**
 * Multiplies two 4x4 matrices (column-major order).
 */
function multiply4x4(a: Float32Array, b: Float32Array): Float32Array {
  const out = new Float32Array(16);
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      out[col * 4 + row] = a[0 * 4 + row]! * b[col * 4 + 0]! + a[1 * 4 + row]! * b[col * 4 + 1]! + a[2 * 4 + row]! * b[col * 4 + 2]! + a[3 * 4 + row]! * b[col * 4 + 3]!;
    }
  }
  return out;
}

/**
 * Transforms a 3D position by a 4x4 matrix.
 */
function transformPosition(m: Float32Array, x: number, y: number, z: number): [number, number, number] {
  const tx = m[0]! * x + m[4]! * y + m[8]! * z + m[12]!;
  const ty = m[1]! * x + m[5]! * y + m[9]! * z + m[13]!;
  const tw = m[3]! * x + m[7]! * y + m[11]! * z + m[15]!;
  return [tx, ty, tw];
}
