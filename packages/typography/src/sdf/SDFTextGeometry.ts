/**
 * SDF Text Geometry Generator.
 *
 * Creates quad-based geometry for rendering text with SDF/MSDF font atlases.
 * Each glyph is rendered as 2 triangles (1 quad), sampling from the font atlas.
 */

import { Mesh, type VertexLayout } from "@arcanvas/graphics";
import { getKerning, type SDFFont, type SDFGlyph } from "./SDFFont";

/**
 * Options for SDF text geometry creation.
 */
export interface SDFTextOptions {
  /** Font size in pixels (scaled from atlas size) */
  fontSize?: number;
  /** Line height multiplier (1.0 = use font's line height) */
  lineHeight?: number;
  /** Letter spacing in pixels */
  letterSpacing?: number;
  /** Text alignment */
  align?: "left" | "center" | "right";
  /** Maximum width for word wrapping (0 = no wrapping) */
  maxWidth?: number;
}

/**
 * Text metrics returned after geometry creation.
 */
export interface SDFTextMetrics {
  /** Total width of the text */
  width: number;
  /** Total height of the text */
  height: number;
  /** Number of lines */
  lineCount: number;
  /** Number of glyphs rendered */
  glyphCount: number;
}

/**
 * Result of geometry creation.
 */
export interface SDFTextResult {
  /** The mesh geometry */
  mesh: Mesh;
  /** Text metrics */
  metrics: SDFTextMetrics;
}

/**
 * Vertex layout for SDF text: position (3) + uv (2)
 */
const SDF_TEXT_LAYOUT: VertexLayout = {
  stride: 5 * 4, // 5 floats * 4 bytes
  attributes: [
    { semantic: "position", components: 3, type: "float", normalized: false, offset: 0 },
    { semantic: "uv", components: 2, type: "float", normalized: false, offset: 3 * 4 },
  ],
};

/**
 * Creates SDF text geometry from a string and font.
 */
export function createSDFTextGeometry(text: string, font: SDFFont, options: SDFTextOptions = {}): SDFTextResult {
  const fontSize = options.fontSize ?? font.info.size;
  const scale = fontSize / font.info.size;
  const lineHeightMult = options.lineHeight ?? 1.0;
  const letterSpacing = options.letterSpacing ?? 0;
  const align = options.align ?? "left";
  const maxWidth = options.maxWidth ?? 0;

  const lineHeight = font.common.lineHeight * scale * lineHeightMult;
  const atlasWidth = font.common.scaleW;
  const atlasHeight = font.common.scaleH;

  // Split into lines and handle word wrapping
  const rawLines = text.split("\n");
  const lines: Array<{ chars: number[]; width: number }> = [];

  for (const rawLine of rawLines) {
    if (maxWidth > 0) {
      // Word wrap
      const words = rawLine.split(/(\s+)/);
      let currentLine: number[] = [];
      let currentWidth = 0;

      for (const word of words) {
        const wordChars = Array.from(word).map((c) => c.codePointAt(0)!);
        const wordWidth = measureWord(wordChars, font, scale, letterSpacing);

        if (currentLine.length > 0 && currentWidth + wordWidth > maxWidth) {
          // Wrap to new line
          lines.push({ chars: currentLine, width: currentWidth });
          currentLine = [];
          currentWidth = 0;
        }

        // Add word to current line
        for (const char of wordChars) {
          currentLine.push(char);
        }
        currentWidth += wordWidth;
      }

      if (currentLine.length > 0) {
        lines.push({ chars: currentLine, width: currentWidth });
      }
    } else {
      // No wrapping
      const chars = Array.from(rawLine).map((c) => c.codePointAt(0)!);
      const width = measureWord(chars, font, scale, letterSpacing);
      lines.push({ chars, width });
    }
  }

  // Count total glyphs (excluding whitespace without glyphs)
  let totalGlyphs = 0;
  for (const line of lines) {
    for (const charCode of line.chars) {
      if (font.glyphs.has(charCode)) {
        totalGlyphs++;
      }
    }
  }

  // Allocate arrays: 4 vertices per glyph (quad), 6 indices per glyph (2 triangles)
  const vertices = new Float32Array(totalGlyphs * 4 * 5); // 4 verts * 5 floats
  const indices = new Uint16Array(totalGlyphs * 6);

  let vertexOffset = 0;
  let indexOffset = 0;
  let glyphIndex = 0;

  let cursorY = 0;
  let maxLineWidth = 0;

  for (const line of lines) {
    const lineWidth = line.width;
    maxLineWidth = Math.max(maxLineWidth, lineWidth);

    // Calculate X offset based on alignment
    let cursorX = 0;
    if (align === "center") {
      cursorX = -lineWidth / 2;
    } else if (align === "right") {
      cursorX = -lineWidth;
    }

    let prevChar: number | null = null;

    for (const charCode of line.chars) {
      const glyph = font.glyphs.get(charCode);

      // Apply kerning
      if (prevChar !== null) {
        cursorX += getKerning(font, prevChar, charCode) * scale;
      }

      if (glyph) {
        // Add glyph quad
        addGlyphQuad(vertices, indices, vertexOffset, indexOffset, glyphIndex, glyph, cursorX, cursorY, scale, atlasWidth, atlasHeight);

        vertexOffset += 4 * 5; // 4 vertices * 5 floats
        indexOffset += 6; // 6 indices
        glyphIndex++;

        cursorX += glyph.xadvance * scale + letterSpacing;
      } else {
        // Whitespace or missing glyph - just advance
        const spaceGlyph = font.glyphs.get(32); // space
        if (spaceGlyph) {
          cursorX += spaceGlyph.xadvance * scale + letterSpacing;
        } else {
          cursorX += fontSize * 0.3 + letterSpacing;
        }
      }

      prevChar = charCode;
    }

    cursorY -= lineHeight;
  }

  const mesh = new Mesh(vertices, indices, SDF_TEXT_LAYOUT);

  return {
    mesh,
    metrics: {
      width: maxLineWidth,
      height: lines.length * lineHeight,
      lineCount: lines.length,
      glyphCount: totalGlyphs,
    },
  };
}

/**
 * Measures the width of a sequence of characters.
 */
function measureWord(chars: number[], font: SDFFont, scale: number, letterSpacing: number): number {
  let width = 0;
  let prevChar: number | null = null;

  for (const charCode of chars) {
    if (prevChar !== null) {
      width += getKerning(font, prevChar, charCode) * scale;
    }

    const glyph = font.glyphs.get(charCode);
    if (glyph) {
      width += glyph.xadvance * scale + letterSpacing;
    } else {
      const spaceGlyph = font.glyphs.get(32);
      if (spaceGlyph) {
        width += spaceGlyph.xadvance * scale + letterSpacing;
      }
    }

    prevChar = charCode;
  }

  return width;
}

/**
 * Adds a single glyph quad to the vertex/index arrays.
 */
function addGlyphQuad(
  vertices: Float32Array,
  indices: Uint16Array,
  vOffset: number,
  iOffset: number,
  glyphIndex: number,
  glyph: SDFGlyph,
  cursorX: number,
  cursorY: number,
  scale: number,
  atlasWidth: number,
  atlasHeight: number
): void {
  // Position of the glyph quad
  const x0 = cursorX + glyph.xoffset * scale;
  const y0 = cursorY - glyph.yoffset * scale;
  const x1 = x0 + glyph.width * scale;
  const y1 = y0 - glyph.height * scale;

  // UV coordinates in the atlas (normalized 0-1)
  const u0 = glyph.x / atlasWidth;
  const v0 = glyph.y / atlasHeight;
  const u1 = (glyph.x + glyph.width) / atlasWidth;
  const v1 = (glyph.y + glyph.height) / atlasHeight;

  const z = 0;
  const baseVertex = glyphIndex * 4;

  // Vertex 0: top-left
  vertices[vOffset + 0] = x0;
  vertices[vOffset + 1] = y0;
  vertices[vOffset + 2] = z;
  vertices[vOffset + 3] = u0;
  vertices[vOffset + 4] = v0;

  // Vertex 1: top-right
  vertices[vOffset + 5] = x1;
  vertices[vOffset + 6] = y0;
  vertices[vOffset + 7] = z;
  vertices[vOffset + 8] = u1;
  vertices[vOffset + 9] = v0;

  // Vertex 2: bottom-right
  vertices[vOffset + 10] = x1;
  vertices[vOffset + 11] = y1;
  vertices[vOffset + 12] = z;
  vertices[vOffset + 13] = u1;
  vertices[vOffset + 14] = v1;

  // Vertex 3: bottom-left
  vertices[vOffset + 15] = x0;
  vertices[vOffset + 16] = y1;
  vertices[vOffset + 17] = z;
  vertices[vOffset + 18] = u0;
  vertices[vOffset + 19] = v1;

  // Indices for two triangles (CCW winding)
  // Triangle 1: 0, 1, 2
  indices[iOffset + 0] = baseVertex + 0;
  indices[iOffset + 1] = baseVertex + 1;
  indices[iOffset + 2] = baseVertex + 2;
  // Triangle 2: 0, 2, 3
  indices[iOffset + 3] = baseVertex + 0;
  indices[iOffset + 4] = baseVertex + 2;
  indices[iOffset + 5] = baseVertex + 3;
}

/**
 * SDFTextGeometry class for a more object-oriented API.
 */
export class SDFTextGeometry {
  /**
   * Creates SDF text mesh from a string and font.
   */
  static create(text: string, font: SDFFont, options?: SDFTextOptions): Mesh {
    return createSDFTextGeometry(text, font, options).mesh;
  }

  /**
   * Creates SDF text mesh with metrics.
   */
  static createWithMetrics(text: string, font: SDFFont, options?: SDFTextOptions): SDFTextResult {
    return createSDFTextGeometry(text, font, options);
  }
}
