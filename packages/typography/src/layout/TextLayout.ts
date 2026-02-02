import type * as opentype from "opentype.js";

/**
 * Text layout options.
 */
export interface LayoutOptions {
  /** Font size in pixels */
  fontSize: number;
  /** Line height multiplier (default: 1.2) */
  lineHeight?: number;
  /** Additional spacing between letters in pixels */
  letterSpacing?: number;
  /** Maximum width for text wrapping */
  width?: number;
  /** Maximum height for overflow handling */
  height?: number;
  /** Text alignment */
  align?: "left" | "center" | "right";
  /** Overflow handling */
  overflow?: "visible" | "hidden" | "ellipsis";
  /** Word wrapping mode */
  wordWrap?: "normal" | "break-word" | "break-all" | "nowrap";
}

/**
 * Positioned glyph in the layout.
 */
export interface GlyphLayout {
  glyph: opentype.Glyph;
  x: number;
  y: number;
  index: number;
}

/**
 * Result of text layout calculation.
 */
export interface TextMetrics {
  /** Total width of laid out text */
  width: number;
  /** Total height of laid out text */
  height: number;
  /** Positioned glyphs */
  glyphs: GlyphLayout[];
}

interface Line {
  glyphs: GlyphLayout[];
  width: number;
}

/**
 * Text layout engine for positioning glyphs.
 *
 * Handles text wrapping, alignment, and overflow.
 */
export class TextLayout {
  /**
   * Calculate glyph positions for the given text.
   *
   * @param text - Text to layout
   * @param font - opentype.js Font object
   * @param options - Layout options
   * @returns Text metrics with positioned glyphs
   */
  static layout(text: string, font: opentype.Font, options: LayoutOptions): TextMetrics {
    const fontSize = options.fontSize;
    const scale = (1 / font.unitsPerEm) * fontSize;
    const lineHeight = (options.lineHeight ?? 1.2) * fontSize;
    const letterSpacing = options.letterSpacing ?? 0;
    const maxWidth = options.width ?? Infinity;
    const maxHeight = options.height ?? Infinity;
    const align = options.align ?? "left";
    const wordWrap = options.wordWrap ?? "normal";

    const lines: Line[] = [];
    const ellipsisGlyph = font.charToGlyph("…") || font.charToGlyph(".");
    const ellipsisWidth = ellipsisGlyph ? (ellipsisGlyph.advanceWidth ?? 0) * scale + letterSpacing : 0;

    const paragraphs = text.split("\n");
    let currentY = font.ascender * scale;

    for (const paragraph of paragraphs) {
      const words = paragraph.split(" ");
      let currentLine: GlyphLayout[] = [];
      let currentLineWidth = 0;

      for (let w = 0; w < words.length; w++) {
        const word = words[w]!;
        const isLastWord = w === words.length - 1;
        const wordGlyphs: GlyphLayout[] = [];
        let wordWidth = 0;

        const chars = word.split("");
        if (!isLastWord) chars.push(" ");

        for (let i = 0; i < chars.length; i++) {
          const char = chars[i]!;
          const glyph = font.charToGlyph(char);
          const advance = (glyph.advanceWidth ?? 0) * scale + letterSpacing;

          wordGlyphs.push({ glyph, x: wordWidth, y: 0, index: 0 });
          wordWidth += advance;

          if (i < chars.length - 1) {
            const nextGlyph = font.charToGlyph(chars[i + 1]!);
            wordWidth += font.getKerningValue(glyph, nextGlyph) * scale;
          }
        }

        if (wordWrap !== "nowrap" && currentLineWidth + wordWidth > maxWidth && currentLine.length > 0) {
          lines.push({ glyphs: currentLine, width: currentLineWidth });
          currentLine = [];
          currentLineWidth = 0;
        }

        for (const g of wordGlyphs) {
          g.x += currentLineWidth;
          currentLine.push(g);
        }
        currentLineWidth += wordWidth;
      }

      if (currentLine.length > 0) {
        lines.push({ glyphs: currentLine, width: currentLineWidth });
      } else if (words.length === 0 || (words.length === 1 && words[0] === "")) {
        lines.push({ glyphs: [], width: 0 });
      }
    }

    let totalHeight = 0;
    let maxLineWidth = 0;
    const finalGlyphs: GlyphLayout[] = [];

    for (let l = 0; l < lines.length; l++) {
      const line = lines[l]!;
      const exceedsHeight = totalHeight + lineHeight > maxHeight;

      if (exceedsHeight) {
        if (options.overflow === "hidden" || options.overflow === "ellipsis") {
          break;
        }
      }

      if (line.width > maxWidth && (options.overflow === "hidden" || options.overflow === "ellipsis")) {
        let newWidth = 0;
        const keptGlyphs: GlyphLayout[] = [];
        const targetWidth = options.overflow === "ellipsis" ? maxWidth - ellipsisWidth : maxWidth;

        for (const g of line.glyphs) {
          const glyphWidth = (g.glyph.advanceWidth ?? 0) * scale + letterSpacing;
          if (g.x + glyphWidth > targetWidth) break;
          keptGlyphs.push(g);
          newWidth = g.x + glyphWidth;
        }

        if (options.overflow === "ellipsis") {
          keptGlyphs.push({ glyph: ellipsisGlyph, x: newWidth, y: 0, index: 0 });
          newWidth += ellipsisWidth;
        }

        line.glyphs = keptGlyphs;
        line.width = newWidth;
      }

      let xOffset = 0;
      if (align === "center") {
        xOffset = (maxWidth - line.width) / 2;
      } else if (align === "right") {
        xOffset = maxWidth - line.width;
      }

      for (const g of line.glyphs) {
        g.x += xOffset;
        g.y = currentY;
        finalGlyphs.push(g);
      }

      if (line.width > maxLineWidth) maxLineWidth = line.width;
      currentY += lineHeight;
      totalHeight += lineHeight;
    }

    return { width: maxLineWidth, height: totalHeight, glyphs: finalGlyphs };
  }
}
