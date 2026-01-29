import { createPositionNormalUVLayout, Mesh } from "@arcanvas/graphics";
import * as opentype from "opentype.js";
import type { TriangulatedGlyph } from "./font/GlyphTriangulator";
import { GlyphTriangulator } from "./font/GlyphTriangulator";
import type { LayoutOptions } from "./layout/TextLayout";
import { TextLayout } from "./layout/TextLayout";

// Re-export LayoutOptions for convenience
export type { LayoutOptions } from "./layout/TextLayout";

const triangulationCache = new WeakMap<opentype.Font, Map<number, TriangulatedGlyph>>();

export class TextGeometry {
  static create(text: string, font: opentype.Font, options: LayoutOptions): Mesh {
    const metrics = TextLayout.layout(text, font, options);
    const scale = (1 / font.unitsPerEm) * options.fontSize;

    // Cache lookup
    let fontCache = triangulationCache.get(font);
    if (!fontCache) {
      fontCache = new Map();
      triangulationCache.set(font, fontCache);
    }

    let totalVertices = 0;
    let totalIndices = 0;

    const glyphGeometries: { glyph: TriangulatedGlyph; x: number; y: number }[] = [];

    // Collect geometries
    for (const layoutItem of metrics.glyphs) {
      const glyphIndex = layoutItem.glyph.index;
      let tri = fontCache.get(glyphIndex);

      if (!tri) {
        // Triangulate
        // Note: opentype.js paths are in font units. We triangulate in font units to maximize precision before scaling?
        // Or triangulate scaled?
        // Better to triangulate in font units and scale later.
        // GlyphTriangulator works on path commands which are in font units.
        const path = layoutItem.glyph.getPath(0, 0, font.unitsPerEm); // Normalize size? No, getPath(x,y, fontSize)
        // Actually glyph.path is available but it's relative to 0,0 usually.
        // glyph.getPath(x, y, fontSize) returns a Path.
        // If we want raw units, fontSize = unitsPerEm.

        const rawPath = layoutItem.glyph.getPath(0, 0, font.unitsPerEm);
        tri = GlyphTriangulator.triangulate(rawPath, 1.0); // Tolerance 1.0 font unit is usually fine (units usually 1000-2048)
        fontCache.set(glyphIndex, tri);
      }

      glyphGeometries.push({
        glyph: tri,
        x: layoutItem.x,
        y: layoutItem.y,
      });

      totalVertices += tri.vertices.length / 3;
      totalIndices += tri.indices.length;
    }

    // Create buffers
    const layout = createPositionNormalUVLayout();
    const strideFloats = layout.stride / 4;
    const vertexData = new Float32Array(totalVertices * strideFloats);
    const indexData = totalVertices > 65535 ? new Uint32Array(totalIndices) : new Uint16Array(totalIndices);

    let vOffset = 0;
    let iOffset = 0;

    // Merge
    for (const item of glyphGeometries) {
      const tri = item.glyph;
      const startV = vOffset;

      const vertexCount = tri.vertices.length / 3;

      // Calculate bounds for UV
      // Or just use font units range.
      // Usually (0, descender) to (advance, ascender) map to UV?
      // Let's use 0..1 based on Glyph BBox for now.

      for (let i = 0; i < vertexCount; i++) {
        const vx = tri.vertices[i * 3];
        const vy = tri.vertices[i * 3 + 1];
        const vz = tri.vertices[i * 3 + 2];

        // Transform
        // We need to scale vx,vy (which are in unitsPerEm) by `scale` (which brings them to fontSize pixels),
        // BUT wait. `TextLayout` returns x,y in pixels (because we used `scale` inside layout).
        // `tri` vertices are in `unitsPerEm`.
        // So we multiply `tri` by `scale`?
        // But `scale` in TextGeometry is `1/units * fontSize`.
        // Yes.

        const wx = vx * scale + item.x;
        const wy = -vy * scale + item.y; // Flip Y?
        // Font coordinates: Y up. Canvas: Y down usually.
        // TextLayout assumes standard advance.
        // `currentY` in TextLayout started at `ascender * scale` and increased.
        // Usually we render text from top-left.
        // In WebGL world space, Y is up.
        // In 2D screen space (top-left 0,0), Y is down.
        // If Arcanvas 2D uses Y down (like Canvas2D), we need to flip Y from font (Y up).
        // TextLayout calculated `y` as positive increasing (Y down).
        // Font glyphs are Y up relative to baseline.
        // So to place them correctly:
        // baseline position `item.y`.
        // glyph point `vy` (positive is up from baseline).
        // screen Y = item.y - (vy * scale).

        const finalX = wx;
        const finalY = item.y - vy * scale;
        const finalZ = vz * scale;

        // Fill Vertex Buffer
        const base = (vOffset + i) * strideFloats;

        // Position
        vertexData[base] = finalX;
        vertexData[base + 1] = finalY;
        vertexData[base + 2] = finalZ;

        // Normal (0, 0, 1)
        vertexData[base + 3] = 0;
        vertexData[base + 4] = 0;
        vertexData[base + 5] = 1;

        // UV (Placeholder)
        vertexData[base + 6] = 0;
        vertexData[base + 7] = 0;
      }

      // Indices
      for (let i = 0; i < tri.indices.length; i++) {
        indexData[iOffset + i] = tri.indices[i] + vOffset;
      }

      vOffset += vertexCount;
      iOffset += tri.indices.length;
    }

    return new Mesh(vertexData, indexData, layout);
  }
}
