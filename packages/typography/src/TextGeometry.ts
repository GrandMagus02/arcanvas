import { Mesh, VERTEX_LAYOUT_POSITION_NORMAL_UV } from "@arcanvas/gfx";
import type * as opentype from "opentype.js";
import type { TriangulatedGlyph } from "./font/GlyphTriangulator";
import { GlyphTriangulator } from "./font/GlyphTriangulator";
import type { LayoutOptions } from "./layout/TextLayout";
import { TextLayout } from "./layout/TextLayout";

export type { LayoutOptions } from "./layout/TextLayout";

/**
 * Creates GPU-ready mesh geometry from text.
 *
 * Combines text layout and glyph triangulation into a single mesh.
 */
export class TextGeometry {
  private static triangulationCache = new WeakMap<opentype.Font, Map<number, TriangulatedGlyph>>();

  /**
   * Create a mesh from text string.
   *
   * @param text - Text to render
   * @param font - opentype.js Font object
   * @param options - Layout options (fontSize, align, etc.)
   * @returns GPU-ready Mesh
   */
  static create(text: string, font: opentype.Font, options: LayoutOptions): Mesh {
    const metrics = TextLayout.layout(text, font, options);
    const scale = (1 / font.unitsPerEm) * options.fontSize;

    let fontCache = TextGeometry.triangulationCache.get(font);
    if (!fontCache) {
      fontCache = new Map();
      TextGeometry.triangulationCache.set(font, fontCache);
    }

    let totalVertices = 0;
    let totalIndices = 0;
    const glyphGeometries: { glyph: TriangulatedGlyph; x: number; y: number }[] = [];

    for (const layoutItem of metrics.glyphs) {
      const glyphIndex = layoutItem.glyph.index;
      let tri = fontCache.get(glyphIndex);

      if (!tri) {
        const rawPath = layoutItem.glyph.getPath(0, 0, font.unitsPerEm);
        tri = GlyphTriangulator.triangulate(rawPath, 1.0);
        fontCache.set(glyphIndex, tri);
      }

      glyphGeometries.push({ glyph: tri, x: layoutItem.x, y: layoutItem.y });
      totalVertices += tri.vertices.length / 3;
      totalIndices += tri.indices.length;
    }

    const layout = VERTEX_LAYOUT_POSITION_NORMAL_UV;
    const strideFloats = layout.arrayStride / 4;
    const vertexData = new Float32Array(totalVertices * strideFloats);
    const indexData = totalVertices > 65535 ? new Uint32Array(totalIndices) : new Uint16Array(totalIndices);

    let vOffset = 0;
    let iOffset = 0;

    for (const item of glyphGeometries) {
      const tri = item.glyph;
      const vertexCount = tri.vertices.length / 3;

      for (let i = 0; i < vertexCount; i++) {
        const vx = tri.vertices[i * 3]!;
        const vy = tri.vertices[i * 3 + 1]!;
        const vz = tri.vertices[i * 3 + 2]!;

        const finalX = vx * scale + item.x;
        const finalY = item.y - vy * scale;
        const finalZ = vz * scale;

        const base = (vOffset + i) * strideFloats;
        vertexData[base] = finalX;
        vertexData[base + 1] = finalY;
        vertexData[base + 2] = finalZ;
        vertexData[base + 3] = 0;
        vertexData[base + 4] = 0;
        vertexData[base + 5] = 1;
        vertexData[base + 6] = 0;
        vertexData[base + 7] = 0;
      }

      for (let i = 0; i < tri.indices.length; i++) {
        indexData[iOffset + i] = tri.indices[i]! + vOffset;
      }

      vOffset += vertexCount;
      iOffset += tri.indices.length;
    }

    return new Mesh({
      label: "text",
      vertexBuffers: [
        {
          data: vertexData,
          layout,
        },
      ],
      indexData: {
        data: indexData,
        format: totalVertices > 65535 ? "uint32" : "uint16",
      },
    });
  }

  /**
   * Clear the triangulation cache for a specific font.
   */
  static clearCache(font: opentype.Font): void {
    TextGeometry.triangulationCache.delete(font);
  }

  /**
   * Clear all cached triangulations.
   * Note: WeakMap doesn't have a clear() method, but entries will be GC'd when fonts are released.
   */
  static clearAllCaches(): void {
    // Nothing to do: WeakMap doesn't have clear(), relies on GC when fonts are released.
  }
}
