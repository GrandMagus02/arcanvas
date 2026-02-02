import earcut from "earcut";
import type * as opentype from "opentype.js";
import { BezierUtils } from "../utils/BezierUtils";

/**
 * Triangulated glyph data ready for WebGL rendering.
 */
export interface TriangulatedGlyph {
  /** Vertex positions as [x, y, z, x, y, z, ...] */
  vertices: Float32Array;
  /** Triangle indices */
  indices: Uint16Array | Uint32Array;
}

interface Contour {
  points: number[];
  area: number;
  bbox: { minX: number; minY: number; maxX: number; maxY: number };
  holes: Contour[];
}

/**
 * Converts font glyph paths to triangulated meshes for WebGL rendering.
 *
 * Uses earcut for polygon triangulation with proper hole detection.
 */
export class GlyphTriangulator {
  /**
   * Triangulate a glyph path into vertices and indices.
   *
   * @param path - opentype.js Path object
   * @param tolerance - Bezier curve flattening tolerance (smaller = more detail)
   * @returns Triangulated glyph with vertices and indices
   */
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

    const contours = this.processContours(rawContours);
    const rootContours = this.buildContourHierarchy(contours);
    return this.triangulateContours(rootContours);
  }

  /** Process raw contour points into Contour objects with bounding boxes. */
  private static processContours(rawContours: number[][]): Contour[] {
    return rawContours.map((points) => {
      const area = this.signedArea(points);
      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
      for (let i = 0; i < points.length; i += 2) {
        const x = points[i]!;
        const y = points[i + 1]!;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
      return { points, area, bbox: { minX, minY, maxX, maxY }, holes: [] };
    });
  }

  /** Build parent-child hierarchy for contours (outer shapes contain holes). */
  private static buildContourHierarchy(contours: Contour[]): Contour[] {
    contours.sort((a, b) => Math.abs(b.area) - Math.abs(a.area));

    const rootContours: Contour[] = [];
    const processed: { contour: Contour; type: "root" | "hole" }[] = [];

    for (const c of contours) {
      let parent: { contour: Contour; type: "root" | "hole" } | null = null;
      let bestParentArea = Infinity;

      for (const p of processed) {
        if (Math.abs(p.contour.area) < bestParentArea && this.contains(p.contour, c)) {
          bestParentArea = Math.abs(p.contour.area);
          parent = p;
        }
      }

      if (!parent) {
        rootContours.push(c);
        processed.push({ contour: c, type: "root" });
      } else if (parent.type === "root") {
        parent.contour.holes.push(c);
        processed.push({ contour: c, type: "hole" });
      } else {
        rootContours.push(c);
        processed.push({ contour: c, type: "root" });
      }
    }

    return rootContours;
  }

  /** Triangulate root contours and their holes using earcut. */
  private static triangulateContours(rootContours: Contour[]): TriangulatedGlyph {
    let totalVertices = 0;
    let totalIndices = 0;
    const batches: { vertices: number[]; indices: number[] }[] = [];

    for (const root of rootContours) {
      const data: number[] = [...root.points];
      const holeIndices: number[] = [];
      let offset = root.points.length / 2;

      for (const hole of root.holes) {
        holeIndices.push(offset);
        data.push(...hole.points);
        offset += hole.points.length / 2;
      }

      const triangles = earcut(data, holeIndices);
      batches.push({ vertices: data, indices: triangles });
      totalVertices += data.length / 2;
      totalIndices += triangles.length;
    }

    const mergedVertices = new Float32Array(totalVertices * 3);
    const mergedIndices = totalVertices > 65535 ? new Uint32Array(totalIndices) : new Uint16Array(totalIndices);

    let vOffset = 0;
    let iOffset = 0;

    for (const batch of batches) {
      const vCount = batch.vertices.length / 2;

      for (let i = 0; i < vCount; i++) {
        mergedVertices[(vOffset + i) * 3] = batch.vertices[i * 2]!;
        mergedVertices[(vOffset + i) * 3 + 1] = batch.vertices[i * 2 + 1]!;
        mergedVertices[(vOffset + i) * 3 + 2] = 0;
      }

      for (let i = 0; i < batch.indices.length; i++) {
        mergedIndices[iOffset + i] = batch.indices[i]! + vOffset;
      }

      vOffset += vCount;
      iOffset += batch.indices.length;
    }

    return { vertices: mergedVertices, indices: mergedIndices };
  }

  /** Calculate signed area of a polygon using the Shoelace formula. */
  private static signedArea(points: number[]): number {
    let area = 0;
    const n = points.length / 2;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += points[i * 2]! * points[j * 2 + 1]!;
      area -= points[j * 2]! * points[i * 2 + 1]!;
    }
    return area / 2;
  }

  /** Check if child contour is contained within parent contour. */
  private static contains(parent: Contour, child: Contour): boolean {
    if (child.bbox.minX < parent.bbox.minX || child.bbox.maxX > parent.bbox.maxX || child.bbox.minY < parent.bbox.minY || child.bbox.maxY > parent.bbox.maxY) {
      return false;
    }
    const px = child.points[0]!;
    const py = child.points[1]!;
    return this.isPointInPolygon(px, py, parent.points);
  }

  /** Ray casting algorithm to test if point is inside polygon. */
  private static isPointInPolygon(x: number, y: number, points: number[]): boolean {
    let inside = false;
    for (let i = 0, j = points.length - 2; i < points.length; i += 2) {
      const xi = points[i]!,
        yi = points[i + 1]!;
      const xj = points[j]!,
        yj = points[j + 1]!;

      const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
      j = i;
    }
    return inside;
  }
}
