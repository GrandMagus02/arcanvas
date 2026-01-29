import earcut from "earcut";
import * as opentype from "opentype.js";
import { BezierUtils } from "../utils/BezierUtils";

export interface TriangulatedGlyph {
  vertices: Float32Array;
  indices: Uint16Array | Uint32Array;
}

interface Contour {
  points: number[]; // [x, y, x, y, ...]
  area: number;
  bbox: { minX: number; minY: number; maxX: number; maxY: number };
  holes: Contour[];
}

export class GlyphTriangulator {
  static triangulate(path: opentype.Path, tolerance: number = 0.1): TriangulatedGlyph {
    const rawContours: number[][] = [];
    let currentContour: number[] = [];
    let cx = 0,
      cy = 0;
    let sx = 0,
      sy = 0;

    for (const cmd of path.commands) {
      switch (cmd.type) {
        case "M":
          if (currentContour.length > 0) {
            rawContours.push(currentContour);
            currentContour = [];
          }
          cx = cmd.x;
          cy = cmd.y;
          sx = cx;
          sy = cy;
          currentContour.push(cx, cy);
          break;
        case "L":
          cx = cmd.x;
          cy = cmd.y;
          currentContour.push(cx, cy);
          break;
        case "Q":
          BezierUtils.flattenQuadraticBezierRaw(cx, cy, cmd.x1, cmd.y1, cmd.x, cmd.y, tolerance, currentContour);
          cx = cmd.x;
          cy = cmd.y;
          break;
        case "C":
          BezierUtils.flattenCubicBezierRaw(cx, cy, cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y, tolerance, currentContour);
          cx = cmd.x;
          cy = cmd.y;
          break;
        case "Z":
          // Close path: ensure last point equals first
          if (Math.abs(cx - sx) > 0.0001 || Math.abs(cy - sy) > 0.0001) {
            currentContour.push(sx, sy);
          }
          if (currentContour.length > 0) {
            rawContours.push(currentContour);
            currentContour = [];
          }
          break;
      }
    }

    if (currentContour.length > 0) {
      rawContours.push(currentContour);
    }

    if (rawContours.length === 0) {
      return { vertices: new Float32Array(0), indices: new Uint16Array(0) };
    }

    // Process contours
    const contours: Contour[] = rawContours.map((points) => {
      const area = this.signedArea(points);
      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
      for (let i = 0; i < points.length; i += 2) {
        const x = points[i];
        const y = points[i + 1];
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
      return { points, area, bbox: { minX, minY, maxX, maxY }, holes: [] };
    });

    // Separate outer and holes
    // Assuming standard winding: Outer and Hole have opposite signs.
    // We determine the "positive" direction by looking at the largest contour (usually outer).
    // Or simply: Absolute largest area is definitely an Outer.
    // If we have mixed windings (e.g. from different fonts), this heuristic works for single glyphs.

    contours.sort((a, b) => Math.abs(b.area) - Math.abs(a.area));

    const rootContours: Contour[] = [];

    // Simple hierarchy reconstruction
    // The largest is always a root.
    // For others, check if they are contained in any existing root.
    // If contained in a root (and that root doesn't have a hole containing this one...),
    // it's a hole of that root.
    // Deep nesting logic is complex, but for fonts:
    // Roots are disjoint shapes.
    // Holes are inside roots.
    // Islands inside holes are roots.

    // We can just iterate and place each contour into the smallest containing parent.
    // If no parent, it's a root.
    // If parent is a "Hole" (level 1), then this is an island (Root).
    // But our Contour struct only has `holes`.
    // So we treat everything as:
    // List of Shapes (Outer + holes).

    // Let's refine:
    // 1. Sort by size (descending).
    // 2. For each contour, find the smallest enclosing contour processed so far.
    // 3. If no enclosing contour -> It is a Root.
    // 4. If enclosing contour is Root -> It is a Hole of that Root.
    // 5. If enclosing contour is Hole -> It is a Root (Island).

    // To support Step 5, we need to know if the enclosing one is a Hole or Root.
    // But we process largest first.
    // 1. Largest is Root.
    // 2. Next largest: Is it inside Root? Yes -> Hole. No -> Root.
    // 3. Next: Inside Hole? -> Root. Inside Root? -> Hole. Inside nothing -> Root.

    const processed: { contour: Contour; type: "root" | "hole" }[] = [];

    for (const c of contours) {
      // Find smallest enclosing processed contour
      let parent: { contour: Contour; type: "root" | "hole" } | null = null;

      // Search backwards (smallest first) among processed?
      // We sorted descending, so processed ones are larger.
      // We want the *smallest* containing one.
      // So we check all processed, filter those that contain `c`, and pick the one with smallest area.

      let bestParentArea = Infinity;

      for (const p of processed) {
        if (Math.abs(p.contour.area) < bestParentArea) {
          if (this.contains(p.contour, c)) {
            bestParentArea = Math.abs(p.contour.area);
            parent = p;
          }
        }
      }

      if (!parent) {
        rootContours.push(c);
        processed.push({ contour: c, type: "root" });
      } else if (parent.type === "root") {
        // It's a hole
        parent.contour.holes.push(c);
        processed.push({ contour: c, type: "hole" });
      } else {
        // Parent is hole, so this is island -> Root
        rootContours.push(c);
        processed.push({ contour: c, type: "root" });
      }
    }

    // Now triangulate each root
    let totalVertices = 0;
    let totalIndices = 0;

    const batches: { vertices: number[]; indices: number[]; offset: number }[] = [];

    for (const root of rootContours) {
      // Flatten data for earcut
      const data: number[] = [...root.points];
      const holeIndices: number[] = [];
      let offset = root.points.length / 2;

      for (const hole of root.holes) {
        holeIndices.push(offset);
        data.push(...hole.points);
        offset += hole.points.length / 2;
      }

      const triangles = earcut(data, holeIndices);

      batches.push({
        vertices: data,
        indices: triangles,
        offset: 0, // Will be adjusted
      });

      totalVertices += data.length / 2;
      totalIndices += triangles.length;
    }

    // Merge
    const mergedVertices = new Float32Array(totalVertices * 3); // 3D
    const mergedIndices = totalVertices > 65535 ? new Uint32Array(totalIndices) : new Uint16Array(totalIndices);

    let vOffset = 0;
    let iOffset = 0;

    for (const batch of batches) {
      const vCount = batch.vertices.length / 2;

      for (let i = 0; i < vCount; i++) {
        mergedVertices[(vOffset + i) * 3] = batch.vertices[i * 2];
        mergedVertices[(vOffset + i) * 3 + 1] = batch.vertices[i * 2 + 1];
        mergedVertices[(vOffset + i) * 3 + 2] = 0; // Z
      }

      for (let i = 0; i < batch.indices.length; i++) {
        mergedIndices[iOffset + i] = batch.indices[i] + vOffset;
      }

      vOffset += vCount;
      iOffset += batch.indices.length;
    }

    return { vertices: mergedVertices, indices: mergedIndices };
  }

  private static signedArea(points: number[]): number {
    let sum = 0;
    for (let i = 0, j = points.length - 2; i < points.length; i += 2) {
      sum += (points[j] - points[i + 1]) * (points[i + 2] || points[0]) - (points[j + 1] - points[i]) * (points[i + 3] || points[1]);
      // Wait, simple formula: sum((x2 - x1)(y2 + y1))
      // Or 0.5 * sum(x_i * y_{i+1} - x_{i+1} * y_i)
      j = i;
    }
    // Correct Shoelace
    let area = 0;
    const n = points.length / 2;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += points[i * 2] * points[j * 2 + 1];
      area -= points[j * 2] * points[i * 2 + 1];
    }
    return area / 2;
  }

  private static contains(parent: Contour, child: Contour): boolean {
    // Check bounding box first
    if (child.bbox.minX < parent.bbox.minX || child.bbox.maxX > parent.bbox.maxX || child.bbox.minY < parent.bbox.minY || child.bbox.maxY > parent.bbox.maxY) {
      return false;
    }

    // Check if a point of child is inside parent
    // Just pick the first point of child
    const px = child.points[0];
    const py = child.points[1];

    return this.isPointInPolygon(px, py, parent.points);
  }

  private static isPointInPolygon(x: number, y: number, points: number[]): boolean {
    let inside = false;
    for (let i = 0, j = points.length - 2; i < points.length; i += 2) {
      const xi = points[i],
        yi = points[i + 1];
      const xj = points[j],
        yj = points[j + 1];

      const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
      j = i;
    }
    return inside;
  }
}
