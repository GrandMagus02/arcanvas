# Typography

Render text in WebGL with the `@arcanvas/typography` package.

<TypographyExample />

## Overview

The typography package provides utilities for rendering text in WebGL:

- **FontLoader** - Load TTF/OTF fonts from URLs or files
- **TextGeometry** - Create WebGL-ready mesh from text
- **TextLayout** - Calculate glyph positions with wrapping and alignment
- **GlyphTriangulator** - Convert font paths to triangles

## Quick Start

```typescript
import { FontLoader, TextGeometry } from "@arcanvas/typography";
import { RenderObject, UnlitColorMaterial } from "@arcanvas/graphics";

// Load a font
const font = await FontLoader.load("/fonts/Roboto-Regular.ttf");

// Create text mesh
const mesh = TextGeometry.create("Hello World", font, {
  fontSize: 48,
  align: "center",
});

// Create render object with material
const material = new UnlitColorMaterial({ baseColor: [1, 1, 1, 1] });
const textObject = new RenderObject(mesh, material);

// Add to scene
scene.addObject(textObject);
```

## Font Loading

Load fonts from various sources:

```typescript
import { FontLoader } from "@arcanvas/typography";

// From URL
const font = await FontLoader.load("https://example.com/font.ttf");

// From ArrayBuffer
const buffer = await fetch("/font.otf").then((r) => r.arrayBuffer());
const font = FontLoader.parse(buffer);

// From File (for user uploads)
const file = inputElement.files[0];
const font = await FontLoader.fromFile(file);
```

## Layout Options

Control text appearance with layout options:

```typescript
const mesh = TextGeometry.create(text, font, {
  // Font size in pixels
  fontSize: 48,

  // Text alignment: "left" | "center" | "right"
  align: "left",

  // Line height multiplier (default: 1.2)
  lineHeight: 1.5,

  // Letter spacing in pixels
  letterSpacing: 2,

  // Max width for word wrapping
  width: 400,

  // Max height for overflow handling
  height: 200,

  // Overflow: "visible" | "hidden" | "ellipsis"
  overflow: "ellipsis",

  // Word wrap: "normal" | "break-word" | "nowrap"
  wordWrap: "normal",
});
```

## Multi-line Text

Text automatically wraps when a `width` is specified:

```typescript
const mesh = TextGeometry.create(
  "This is a long text that will wrap to multiple lines when it exceeds the specified width.",
  font,
  {
    fontSize: 24,
    width: 300,
    lineHeight: 1.4,
  }
);
```

## Text Colors

Use materials to control text color:

```typescript
import { UnlitColorMaterial } from "@arcanvas/graphics";

// Solid white
const white = new UnlitColorMaterial({ baseColor: [1, 1, 1, 1] });

// Red with transparency
const red = new UnlitColorMaterial({ baseColor: [1, 0, 0, 0.8] });

// From hex color
function hexToRgba(hex: string): [number, number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b, 1];
}

const custom = new UnlitColorMaterial({ baseColor: hexToRgba("#4a9eff") });
```

## Performance

The typography package caches triangulated glyphs per font, so rendering the same characters multiple times is efficient.

```typescript
// First call triangulates glyphs
const mesh1 = TextGeometry.create("Hello", font, { fontSize: 48 });

// Second call reuses cached triangulations
const mesh2 = TextGeometry.create("Hello World", font, { fontSize: 48 });

// Clear cache if needed (e.g., when done with a font)
TextGeometry.clearCache(font);
```

## API Reference

### FontLoader

| Method | Description |
| --- | --- |
| `load(url)` | Load font from URL |
| `parse(buffer)` | Parse font from ArrayBuffer |
| `fromFile(file)` | Load font from File object |

### TextGeometry

| Method | Description |
| --- | --- |
| `create(text, font, options)` | Create mesh from text |
| `clearCache(font)` | Clear triangulation cache for font |

### LayoutOptions

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `fontSize` | `number` | required | Font size in pixels |
| `align` | `string` | `"left"` | Text alignment |
| `lineHeight` | `number` | `1.2` | Line height multiplier |
| `letterSpacing` | `number` | `0` | Letter spacing in pixels |
| `width` | `number` | `Infinity` | Max width for wrapping |
| `height` | `number` | `Infinity` | Max height |
| `overflow` | `string` | `"visible"` | Overflow handling |
| `wordWrap` | `string` | `"normal"` | Word wrap mode |
