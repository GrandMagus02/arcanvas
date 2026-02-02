import type { BaseMaterial } from "../materials";
import { Path, type PathCommand } from "./Path";

/**
 *
 */
export class Line extends Path {
  constructor(x1: number, y1: number, x2: number, y2: number, material: BaseMaterial, width: number = 1) {
    // A line is just a thin rectangle for now, as we triangulate everything
    // Or we could implement stroke support in Path.
    // For now, let's make a "line" be a filled rectangle path to support the request "convert svg to mesh"

    // Vector along line
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    const nx = (-dy / len) * (width / 2);
    const ny = (dx / len) * (width / 2);

    const commands: PathCommand[] = [
      { type: "M", x: x1 + nx, y: y1 + ny },
      { type: "L", x: x2 + nx, y: y2 + ny },
      { type: "L", x: x2 - nx, y: y2 - ny },
      { type: "L", x: x1 - nx, y: y1 - ny },
      { type: "Z" },
    ];

    super(commands, material);
  }
}
