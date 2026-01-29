import type { BaseMaterial } from "../materials";
import { Path, type PathCommand } from "./Path";

export class Curve extends Path {
  constructor(points: number[], material: BaseMaterial, closed: boolean = false) {
    // Treat as a sequence of lines or a spline
    // Minimal implementation: just connect points
    const commands: PathCommand[] = [];
    if (points.length >= 2) {
      commands.push({ type: "M", x: points[0]!, y: points[1]! });
      for (let i = 2; i < points.length; i += 2) {
        commands.push({ type: "L", x: points[i]!, y: points[i + 1]! });
      }
      if (closed) {
        commands.push({ type: "Z" });
      }
    }

    // NOTE: A non-closed curve (polyline) technically has no area, so earcut will produce nothing unless it has width.
    // If the user wants a stroke, they should probably assume this generates a filled shape or we need to implement stroke expansion.
    // For now, assuming closed shapes for triangulation or "filling" the curve.
    super(commands, material);
  }
}
