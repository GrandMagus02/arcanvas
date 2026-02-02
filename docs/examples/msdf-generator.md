# MSDF/SDF Font Atlas Generator

<MSDFGeneratorExample />

This example generates SDF font atlases using the **atlas generator** from `@arcanvas/typography`, which uses [msdf-bmfont-xml](https://github.com/soimy/msdf-bmfont-xml) and opentype.js.

## Running the example

The live demo runs the generator **on the docs dev server** (Node.js). Start it with:

```bash
bun run docs:dev
```

Then open the MSDF Generator example. Choose a font file or URL, set options, and click **Generate from File** or **Generate from URL**. The server will generate the atlas and return the texture (as a data URL) and BMFont JSON.

## Using the generator in your app

### Browser (via your own API)

The generator uses Node-only APIs (`msdf-bmfont-xml` runs a native binary). To use it from the browser, call a backend that runs the generator, as this example does: the VitePress dev server exposes `POST /__atlas-generate__` with body `{ fontBase64, options?, filename? }`.

### Node / Electron / build scripts

Import the generator from the typography package and pass a font file or buffer:

```typescript
import { generateFontAtlas, generateFontAtlasFromBuffer } from "@arcanvas/typography/generate";
import type { BMFontOptions } from "@arcanvas/typography/generate";

// From a File (browser/Electron with DOM)
const result = await generateFontAtlas(fontFile, {
  fontSize: 42,
  distanceRange: 4,
  fieldType: "msdf",
  charset: " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~".split(""),
  outputType: "json",
});
// result: { imageData, json, dataUrl }

// From a Buffer (Node only, no DOM)
const { generateFontAtlasFromBuffer } = await import("@arcanvas/typography/generate");
const { Buffer } = await import("buffer");
const fontBuffer = Buffer.from(await fs.readFile("font.ttf"));
const nodeResult = await generateFontAtlasFromBuffer(fontBuffer, options, "font.ttf");
// nodeResult: { dataUrl, json }
```

### Options (BMFontOptions)

| Option                           | Type                             | Description                            |
| -------------------------------- | -------------------------------- | -------------------------------------- |
| `fontSize`                       | number                           | Font size for the atlas (default 42)   |
| `distanceRange`                  | number                           | Distance range for the SDF (default 4) |
| `fieldType`                      | `"msdf"` \| `"sdf"` \| `"psdf"`  | Type of distance field                 |
| `charset`                        | string \| string[]               | Characters to include                  |
| `outputType`                     | `"xml"` \| `"json"` \| `"txt"`   | BMFont file format (default `"xml"`)   |
| `textureWidth` / `textureHeight` | number                           | Atlas dimensions (default 512)         |
| `fontPadding`                    | [number, number, number, number] | Padding per glyph                      |

## Field types

| Type     | Channels      | Description                      |
| -------- | ------------- | -------------------------------- |
| **MSDF** | 3 (RGB)       | Multi-channel SDF; sharp corners |
| **SDF**  | 1 (grayscale) | Standard signed distance field   |
| **PSDF** | 1 (grayscale) | Perpendicular SDF                |

## Rendering SDF text

Use a shader that samples the atlas and uses the distance to compute alpha:

```glsl
// Fragment shader (MSDF)
uniform sampler2D u_atlas;
uniform vec4 u_color;
uniform float u_smoothing;

varying vec2 v_texCoord;

float median(float r, float g, float b) {
  return max(min(r, g), min(max(r, g), b));
}

void main() {
  vec4 sample = texture2D(u_atlas, v_texCoord);
  float dist = median(sample.r, sample.g, sample.b);
  float alpha = smoothstep(0.5 - u_smoothing, 0.5 + u_smoothing, dist);
  gl_FragColor = vec4(u_color.rgb, u_color.a * alpha);
}
```

For SDF/PSDF, use a single channel: `float dist = sample.r;`

## Package export

The typography package exposes the generator under a subpath so browser bundles that don’t need it can omit it:

- **`@arcanvas/typography`** – Font loading, layout, triangulation (browser-safe).
- **`@arcanvas/typography/generate`** – Atlas generation (Node/Electron; uses `msdf-bmfont-xml` and `Buffer`).
