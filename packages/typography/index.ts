/**
 * @arcanvas/typography
 *
 * Text rendering utilities for WebGL.
 *
 * Basic usage:
 * ```typescript
 * import { FontLoader, TextGeometry } from "@arcanvas/typography";
 *
 * const font = await FontLoader.load("path/to/font.ttf");
 * const mesh = TextGeometry.create("Hello World", font, { fontSize: 48 });
 * ```
 */

export { FontLoader, type Font } from "./src/font/FontLoader";
export { GlyphTriangulator, type TriangulatedGlyph } from "./src/font/GlyphTriangulator";
export { TextLayout, type LayoutOptions, type GlyphLayout, type TextMetrics } from "./src/layout/TextLayout";
export { TextGeometry } from "./src/TextGeometry";
export { BezierUtils } from "./src/utils/BezierUtils";
