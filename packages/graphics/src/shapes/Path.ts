import type { BaseMaterial } from "../materials";
import { Mesh } from "../Mesh";
import { RenderObject } from "../RenderObject";
import { earcut } from "../utils/earcut";
import { createPositionLayout } from "../vertexLayout";

/**
 *
 */
export interface PathOptions {
  fill?: boolean;
  stroke?: boolean;
  strokeWidth?: number;
  /**
   * Tessellation tolerance in world units.
   * Lower values result in smoother curves but more vertices.
   * Default: 0.15
   */
  tolerance?: number;
  /**
   * @deprecated Use tolerance instead for adaptive tessellation.
   */
  resolution?: number;
}

/**
 *
 */
export class Path extends RenderObject {
  private _points: number[] = [];
  private _holes: number[] = [];
  private _commands: PathCommand[] = [];

  constructor(data: string | PathCommand[], material: BaseMaterial, options: PathOptions = {}) {
    // 1. Parse data if string
    const commands = typeof data === "string" ? parseSVGPath(data) : data;

    // 2. Tessellate commands into points
    // Use tolerance for adaptive tessellation (default 0.15)
    // Fallback to resolution-based if specifically requested (though adaptive is preferred)
    const tolerance = options.tolerance ?? 0.15;
    const { points, holes } = tessellatePath(commands, tolerance);

    // 3. Triangulate
    // For now we only support 2D (z=0)
    // Earcut expects flat array [x0, y0, x1, y1, ...]
    const indices = earcut(points, holes, 2);

    // 4. Create Mesh
    // Convert 2D points to 3D vertices (z=0) for the mesh
    const vertices = new Float32Array((points.length / 2) * 3);
    for (let i = 0; i < points.length / 2; i++) {
      vertices[i * 3] = points[i * 2]!;
      vertices[i * 3 + 1] = points[i * 2 + 1]!;
      vertices[i * 3 + 2] = 0;
    }

    const mesh = new Mesh(vertices, new Uint16Array(indices), createPositionLayout(3), "triangles");

    super(mesh, material);

    this._commands = commands;
    this._points = points;
    this._holes = holes;
  }
}

/**
 *
 */
export type PathCommand =
  | { type: "M"; x: number; y: number } // Move to
  | { type: "L"; x: number; y: number } // Line to
  | { type: "C"; x1: number; y1: number; x2: number; y2: number; x: number; y: number } // Cubic bezier
  | { type: "Q"; x1: number; y1: number; x: number; y: number } // Quadratic bezier
  | { type: "Z" }; // Close path

/**
 *
 */
export function parseSVGPath(d: string): PathCommand[] {
  const commands: PathCommand[] = [];
  const commandRegex = /([a-zA-Z])([^a-zA-Z]*)/g;
  let match;

  let currentX = 0;
  let currentY = 0;

  // Helper to parse numbers from args string
  const parseArgs = (args: string) => {
    const trimmed = args.trim();
    if (!trimmed) return [];
    return trimmed
      .split(/[\s,]+/)
      .map(parseFloat)
      .filter((n) => !isNaN(n));
  };

  while ((match = commandRegex.exec(d)) !== null) {
    const type = match[1]!;
    const args = parseArgs(match[2]!);
    const isRelative = type === type.toLowerCase();
    const cmd = type.toUpperCase();

    let i = 0;
    while (i < args.length) {
      switch (cmd) {
        case "M": {
          const x = args[i++]! + (isRelative ? currentX : 0);
          const y = args[i++]! + (isRelative ? currentY : 0);
          commands.push({ type: "M", x, y });
          currentX = x;
          currentY = y;
          // Subsequent pairs are treated as implicit L commands
          while (i < args.length) {
            const lx = args[i++]! + (isRelative ? currentX : 0);
            const ly = args[i++]! + (isRelative ? currentY : 0);
            commands.push({ type: "L", x: lx, y: ly });
            currentX = lx;
            currentY = ly;
          }
          break;
        }
        case "L": {
          const x = args[i++]! + (isRelative ? currentX : 0);
          const y = args[i++]! + (isRelative ? currentY : 0);
          commands.push({ type: "L", x, y });
          currentX = x;
          currentY = y;
          break;
        }
        case "H": {
          const x = args[i++]! + (isRelative ? currentX : 0);
          commands.push({ type: "L", x, y: currentY });
          currentX = x;
          break;
        }
        case "V": {
          const y = args[i++]! + (isRelative ? currentY : 0);
          commands.push({ type: "L", x: currentX, y });
          currentY = y;
          break;
        }
        case "C": {
          const x1 = args[i++]! + (isRelative ? currentX : 0);
          const y1 = args[i++]! + (isRelative ? currentY : 0);
          const x2 = args[i++]! + (isRelative ? currentX : 0);
          const y2 = args[i++]! + (isRelative ? currentY : 0);
          const x = args[i++]! + (isRelative ? currentX : 0);
          const y = args[i++]! + (isRelative ? currentY : 0);
          commands.push({ type: "C", x1, y1, x2, y2, x, y });
          currentX = x;
          currentY = y;
          break;
        }
        case "Q": {
          const x1 = args[i++]! + (isRelative ? currentX : 0);
          const y1 = args[i++]! + (isRelative ? currentY : 0);
          const x = args[i++]! + (isRelative ? currentX : 0);
          const y = args[i++]! + (isRelative ? currentY : 0);
          commands.push({ type: "Q", x1, y1, x, y });
          currentX = x;
          currentY = y;
          break;
        }
        case "Z": {
          commands.push({ type: "Z" });
          // Z doesn't consume args, but usually closes the subpath.
          // Often resets current point to initial point of subpath,
          // but for basic triangulation we just need the command.
          break;
        }
        // TODO: Implement A (Arc), S (Smooth Cubic), T (Smooth Quadratic)
        default:
          // Skip unknown or unimplemented
          i++;
          break;
      }
    }

    if (cmd === "Z") {
      // Z might not have args, ensuring loop doesn't hang if i wasn't incremented
    }
  }

  return commands;
}

/**
 *
 */
function tessellatePath(commands: PathCommand[], tolerance: number): { points: number[]; holes: number[] } {
  const points: number[] = [];
  const holes: number[] = [];

  let startX = 0;
  let startY = 0;
  let currentX = 0;
  let currentY = 0;

  for (const cmd of commands) {
    switch (cmd.type) {
      case "M":
        if (points.length > 0) {
          // If we are starting a new move, and we have points, this is a new contour (hole)
          holes.push(points.length / 2);
        }
        startX = cmd.x;
        startY = cmd.y;
        currentX = cmd.x;
        currentY = cmd.y;
        points.push(cmd.x, cmd.y);
        break;
      case "L":
        currentX = cmd.x;
        currentY = cmd.y;
        points.push(cmd.x, cmd.y);
        break;
      case "C":
        flattenCubicBezier(currentX, currentY, cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y, tolerance, points);
        currentX = cmd.x;
        currentY = cmd.y;
        break;
      case "Q":
        flattenQuadraticBezier(currentX, currentY, cmd.x1, cmd.y1, cmd.x, cmd.y, tolerance, points);
        currentX = cmd.x;
        currentY = cmd.y;
        break;
      case "Z":
        currentX = startX;
        currentY = startY;
        break;
    }
  }

  return { points, holes };
}

// Distance from point P to line segment AB
/**
 *
 */
function distToSegmentSquared(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const l2 = (bx - ax) * (bx - ax) + (by - ay) * (by - ay);
  if (l2 === 0) return (px - ax) * (px - ax) + (py - ay) * (py - ay);
  let t = ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / l2;
  t = Math.max(0, Math.min(1, t));
  const dx = px - (ax + t * (bx - ax));
  const dy = py - (ay + t * (by - ay));
  return dx * dx + dy * dy;
}

/**
 *
 */
function flattenQuadraticBezier(x1: number, y1: number, cx: number, cy: number, x2: number, y2: number, tolerance: number, points: number[], depth: number = 0) {
  // If control point is close enough to the line segment, the curve is flat
  // Also stop if we've recursed too deep (prevent stack overflow)
  if (depth > 10 || distToSegmentSquared(cx, cy, x1, y1, x2, y2) < tolerance * tolerance) {
    points.push(x2, y2);
    return;
  }

  // Split curve
  const x12 = (x1 + cx) / 2;
  const y12 = (y1 + cy) / 2;
  const x23 = (cx + x2) / 2;
  const y23 = (cy + y2) / 2;
  const x123 = (x12 + x23) / 2;
  const y123 = (y12 + y23) / 2;

  flattenQuadraticBezier(x1, y1, x12, y12, x123, y123, tolerance, points, depth + 1);
  flattenQuadraticBezier(x123, y123, x23, y23, x2, y2, tolerance, points, depth + 1);
}

/**
 *
 */
function flattenCubicBezier(x1: number, y1: number, c1x: number, c1y: number, c2x: number, c2y: number, x2: number, y2: number, tolerance: number, points: number[], depth: number = 0) {
  // If both control points are close enough to the line segment, the curve is flat
  const toleranceSq = tolerance * tolerance;
  if (depth > 10 || (distToSegmentSquared(c1x, c1y, x1, y1, x2, y2) < toleranceSq && distToSegmentSquared(c2x, c2y, x1, y1, x2, y2) < toleranceSq)) {
    points.push(x2, y2);
    return;
  }

  // Split curve
  const x12 = (x1 + c1x) / 2;
  const y12 = (y1 + c1y) / 2;
  const x23 = (c1x + c2x) / 2;
  const y23 = (c1y + c2y) / 2;
  const x34 = (c2x + x2) / 2;
  const y34 = (c2y + y2) / 2;
  const x123 = (x12 + x23) / 2;
  const y123 = (y12 + y23) / 2;
  const x234 = (x23 + x34) / 2;
  const y234 = (y23 + y34) / 2;
  const x1234 = (x123 + x234) / 2;
  const y1234 = (y123 + y234) / 2;

  flattenCubicBezier(x1, y1, x12, y12, x123, y123, x1234, y1234, tolerance, points, depth + 1);
  flattenCubicBezier(x1234, y1234, x234, y234, x34, y34, x2, y2, tolerance, points, depth + 1);
}
