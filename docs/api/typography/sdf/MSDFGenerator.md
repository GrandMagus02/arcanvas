# Functions

- [generateMSDFFromFile](#generatemsdffromfile)
- [generateMSDFFromUrl](#generatemsdffromurl)

## generateMSDFFromFile

Generate MSDF atlas from a font file.

| Function | Type |
| ---------- | ---------- |
| `generateMSDFFromFile` | `(file: File, options?: MSDFGeneratorOptions or undefined) => Promise<MSDFGeneratorResult>` |

## generateMSDFFromUrl

Generate MSDF atlas from a font URL.

| Function | Type |
| ---------- | ---------- |
| `generateMSDFFromUrl` | `(url: string, options?: MSDFGeneratorOptions or undefined) => Promise<MSDFGeneratorResult>` |


# MSDFGenerator

MSDF Font Atlas Generator

## Methods

- [generateFromFont](#generatefromfont)

### generateFromFont

| Method | Type |
| ---------- | ---------- |
| `generateFromFont` | `(font: Font, fontName: string) => MSDFGeneratorResult` |

# Interfaces

- [MSDFGeneratorOptions](#msdfgeneratoroptions)
- [MSDFGlyph](#msdfglyph)
- [MSDFKerning](#msdfkerning)
- [MSDFGeneratorResult](#msdfgeneratorresult)
- [MSDFFontData](#msdffontdata)

## MSDFGeneratorOptions

Configuration options for MSDF generation.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `fontSize` | `number or undefined` |  |
| `distanceRange` | `number or undefined` |  |
| `charset` | `string or undefined` |  |
| `padding` | `number or undefined` |  |
| `fieldType` | `"msdf" or "sdf" or undefined` |  |


## MSDFGlyph

Glyph metrics for the generated atlas.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `id` | `number` |  |
| `char` | `string` |  |
| `x` | `number` |  |
| `y` | `number` |  |
| `width` | `number` |  |
| `height` | `number` |  |
| `xoffset` | `number` |  |
| `yoffset` | `number` |  |
| `xadvance` | `number` |  |
| `page` | `number` |  |


## MSDFKerning

Kerning pair information.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `first` | `number` |  |
| `second` | `number` |  |
| `amount` | `number` |  |


## MSDFGeneratorResult

Generated MSDF font data.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `canvas` | `HTMLCanvasElement` |  |
| `atlasDataUrl` | `string` |  |
| `json` | `MSDFFontData` |  |


## MSDFFontData

BMFont-compatible JSON format.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `pages` | `string[]` |  |
| `chars` | `MSDFGlyph[]` |  |
| `kernings` | `MSDFKerning[]` |  |
| `info` | `{ face: string; size: number; bold: number; italic: number; charset: string[]; unicode: number; stretchH: number; smooth: number; aa: number; padding: [number, number, number, number]; spacing: [number, number]; }` |  |
| `common` | `{ lineHeight: number; base: number; scaleW: number; scaleH: number; pages: number; packed: number; }` |  |
| `distanceField` | `{ fieldType: "msdf" or "sdf"; distanceRange: number; }` |  |

