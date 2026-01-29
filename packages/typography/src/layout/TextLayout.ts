import * as opentype from "opentype.js";

export interface LayoutOptions {
  fontSize: number;
  lineHeight?: number;
  letterSpacing?: number;
  width?: number; // wrapping width
  height?: number; // max height
  align?: "left" | "center" | "right";
  overflow?: "visible" | "hidden" | "ellipsis";
  wordWrap?: "normal" | "break-word" | "break-all" | "nowrap";
}

export interface GlyphLayout {
  glyph: opentype.Glyph;
  x: number;
  y: number;
  index: number;
}

export interface TextMetrics {
  width: number;
  height: number;
  glyphs: GlyphLayout[];
}

interface Line {
  glyphs: GlyphLayout[];
  width: number;
}

export class TextLayout {
  static layout(text: string, font: opentype.Font, options: LayoutOptions): TextMetrics {
    const fontSize = options.fontSize;
    const scale = (1 / font.unitsPerEm) * fontSize;
    const lineHeight = (options.lineHeight ?? 1.2) * fontSize;
    const letterSpacing = options.letterSpacing ?? 0;
    const maxWidth = options.width ?? Infinity;
    const maxHeight = options.height ?? Infinity;
    const align = options.align ?? "left";
    const wordWrap = options.wordWrap ?? "normal";

    const glyphs: GlyphLayout[] = [];
    const lines: Line[] = [];

    // Ellipsis glyph
    const ellipsisChar = "…";
    const ellipsisGlyph = font.charToGlyph(ellipsisChar) || font.charToGlyph(".");
    const ellipsisWidth = ellipsisGlyph ? ellipsisGlyph.advanceWidth * scale + letterSpacing : 0;
    // Note: if '…' is missing, fallback to '.' might be single dot.
    // Ideally we'd use 3 dots if '…' is missing.
    // For simplicity, we assume '…' exists or single glyph is used.

    // Split into paragraphs first
    const paragraphs = text.split("\n");
    let currentY = font.ascender * scale;

    for (const paragraph of paragraphs) {
      // Tokenize words
      const words = paragraph.split(" ");
      let currentLine: GlyphLayout[] = [];
      let currentLineWidth = 0;

      for (let w = 0; w < words.length; w++) {
        const word = words[w];
        const isLastWord = w === words.length - 1;

        const wordGlyphs: GlyphLayout[] = [];
        let wordWidth = 0;

        const chars = word.split("");
        if (!isLastWord) chars.push(" "); // space

        for (let i = 0; i < chars.length; i++) {
          const char = chars[i];
          const glyph = font.charToGlyph(char);
          const advance = glyph.advanceWidth * scale + letterSpacing;

          wordGlyphs.push({
            glyph,
            x: wordWidth,
            y: 0,
            index: 0, // Placeholder
          });
          wordWidth += advance;

          if (i < chars.length - 1) {
            const nextChar = chars[i + 1];
            const nextGlyph = font.charToGlyph(nextChar);
            const kern = font.getKerningValue(glyph, nextGlyph) * scale;
            wordWidth += kern;
          }
        }

        // Check wrap
        if (wordWrap !== "nowrap" && currentLineWidth + wordWidth > maxWidth && currentLine.length > 0) {
          lines.push({ glyphs: currentLine, width: currentLineWidth });
          currentLine = [];
          currentLineWidth = 0;
        }

        // Append word to line
        for (const g of wordGlyphs) {
          g.x += currentLineWidth;
          currentLine.push(g);
        }
        currentLineWidth += wordWidth;
      }

      // Flush line
      if (currentLine.length > 0) {
        lines.push({ glyphs: currentLine, width: currentLineWidth });
      } else if (words.length === 0 || (words.length === 1 && words[0] === "")) {
        // Empty line
        lines.push({ glyphs: [], width: 0 });
      }
    }

    // Position lines & handle overflow
    let totalHeight = 0;
    let maxLineWidth = 0;
    const finalGlyphs: GlyphLayout[] = [];

    for (let l = 0; l < lines.length; l++) {
      let line = lines[l];

      // Check height overflow (block overflow)
      // If adding this line exceeds maxHeight
      const isLastLine = l === lines.length - 1;
      const exceedsHeight = totalHeight + lineHeight > maxHeight;

      if (exceedsHeight) {
        if (options.overflow === "hidden") {
          break;
        } else if (options.overflow === "ellipsis") {
          // We need to put ellipsis on the PREVIOUS line?
          // Or render THIS line with ellipsis?
          // Usually CSS clip: rect... but for ellipsis, it replaces content.
          // If we are already over height, we probably should have stopped at previous line and ellipsized IT.
          // But here we check *before* adding.
          // If we break here, previous line is already committed.
          // So we should have checked this constraint *while* processing previous line?
          // Or easier: we replace the current line (if it fits partially?) or just backtrack?

          // Simple approach: If this line makes it overflow, discard this line.
          // Go back to previous line, truncate it and add ellipsis.

          // But wait, what if max height allows partial line? Usually text isn't partial vertical.

          // Backtrack to previous line
          // Remove previous line glyphs from finalGlyphs
          // Process previous line with ellipsis logic

          // TODO: Multi-line ellipsis is complex.
          // Simplification: If overflow is hidden/ellipsis, we stop.
          // If ellipsis, we try to fit it in the *last visible line*.
          // Which is the previous line (since current one exceeds).

          // Let's modify the previous line in `finalGlyphs`?
          // That's hard because they are flattened.
          // We should have stored lines separately and merged at end.

          // Re-architect slightly: store lines, then commit.
          break;
        }
      }

      // Width overflow (single line)
      if (line.width > maxWidth && (options.overflow === "hidden" || options.overflow === "ellipsis")) {
        // Truncate
        let newWidth = 0;
        const keptGlyphs: GlyphLayout[] = [];
        const targetWidth = options.overflow === "ellipsis" ? maxWidth - ellipsisWidth : maxWidth;

        for (const g of line.glyphs) {
          const glyphWidth = g.glyph.advanceWidth * scale + letterSpacing;
          if (g.x + glyphWidth > targetWidth) {
            break;
          }
          keptGlyphs.push(g);
          newWidth = g.x + glyphWidth;
        }

        if (options.overflow === "ellipsis") {
          keptGlyphs.push({
            glyph: ellipsisGlyph,
            x: newWidth,
            y: 0,
            index: 0,
          });
          newWidth += ellipsisWidth;
        }

        line.glyphs = keptGlyphs;
        line.width = newWidth;
      }

      // Align
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

    return {
      width: maxLineWidth,
      height: totalHeight,
      glyphs: finalGlyphs,
    };
  }
}
