# Functions

- [createSDFTextGeometry](#createsdftextgeometry)

## createSDFTextGeometry

Creates SDF text geometry from a string and font.

| Function | Type |
| ---------- | ---------- |
| `createSDFTextGeometry` | `(text: string, font: SDFFont, options?: SDFTextOptions) => SDFTextResult` |


# SDFTextGeometry

SDFTextGeometry class for a more object-oriented API.

## Static Methods

- [create](#create)
- [createWithMetrics](#createwithmetrics)

### create

Creates SDF text mesh from a string and font.

| Method | Type |
| ---------- | ---------- |
| `create` | `(text: string, font: SDFFont, options?: SDFTextOptions or undefined) => Mesh` |

### createWithMetrics

Creates SDF text mesh with metrics.

| Method | Type |
| ---------- | ---------- |
| `createWithMetrics` | `(text: string, font: SDFFont, options?: SDFTextOptions or undefined) => SDFTextResult` |

# Interfaces

- [SDFTextOptions](#sdftextoptions)
- [SDFTextMetrics](#sdftextmetrics)
- [SDFTextResult](#sdftextresult)

## SDFTextOptions

Options for SDF text geometry creation.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `fontSize` | `number or undefined` | Font size in pixels (scaled from atlas size) |
| `lineHeight` | `number or undefined` | Line height multiplier (1.0 = use font's line height) |
| `letterSpacing` | `number or undefined` | Letter spacing in pixels |
| `align` | `"left" or "center" or "right" or undefined` | Text alignment |
| `maxWidth` | `number or undefined` | Maximum width for word wrapping (0 = no wrapping) |


## SDFTextMetrics

Text metrics returned after geometry creation.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `width` | `number` | Total width of the text |
| `height` | `number` | Total height of the text |
| `lineCount` | `number` | Number of lines |
| `glyphCount` | `number` | Number of glyphs rendered |


## SDFTextResult

Result of geometry creation.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `mesh` | `Mesh` | The mesh geometry |
| `metrics` | `SDFTextMetrics` | Text metrics |

