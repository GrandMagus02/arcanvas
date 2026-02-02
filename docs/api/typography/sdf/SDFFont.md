# Functions

- [loadSDFFont](#loadsdffont)
- [parseSDFFontJSON](#parsesdffontjson)
- [getKerning](#getkerning)

## loadSDFFont

Loads an SDF/MSDF font from JSON (msdf-bmfont-xml or msdfgen JSON format).

| Function | Type |
| ---------- | ---------- |
| `loadSDFFont` | `(jsonUrl: string) => Promise<SDFFont>` |

## parseSDFFontJSON

Parses SDF font JSON data.
Supports both msdf-bmfont-xml format and msdfgen JSON format.

| Function | Type |
| ---------- | ---------- |
| `parseSDFFontJSON` | `(data: unknown) => SDFFont` |

## getKerning

Gets kerning amount between two characters.

| Function | Type |
| ---------- | ---------- |
| `getKerning` | `(font: SDFFont, first: number, second: number) => number` |



# Interfaces

- [SDFGlyph](#sdfglyph)
- [SDFKerning](#sdfkerning)
- [SDFCommon](#sdfcommon)
- [SDFInfo](#sdfinfo)
- [SDFDistanceField](#sdfdistancefield)
- [SDFFont](#sdffont)

## SDFGlyph

Glyph metrics for a single character in the atlas.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `id` | `number` | Character code (unicode) |
| `x` | `number` | X position in atlas (pixels) |
| `y` | `number` | Y position in atlas (pixels) |
| `width` | `number` | Width in atlas (pixels) |
| `height` | `number` | Height in atlas (pixels) |
| `xoffset` | `number` | X offset when rendering (pixels) |
| `yoffset` | `number` | Y offset when rendering (pixels) |
| `xadvance` | `number` | Advance width for cursor (pixels) |
| `page` | `number` | Atlas page (for multi-page atlases) |


## SDFKerning

Kerning pair for adjusting spacing between specific character pairs.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `first` | `number` | First character code |
| `second` | `number` | Second character code |
| `amount` | `number` | Kerning amount (pixels) |


## SDFCommon

Font common metrics.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `lineHeight` | `number` | Line height (pixels) |
| `base` | `number` | Distance from top to baseline (pixels) |
| `scaleW` | `number` | Atlas texture width (pixels) |
| `scaleH` | `number` | Atlas texture height (pixels) |
| `pages` | `number` | Number of atlas pages |


## SDFInfo

Font info from the generator.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `face` | `string` | Font family name |
| `size` | `number` | Font size used to generate atlas |
| `bold` | `boolean` | Is bold |
| `italic` | `boolean` | Is italic |
| `padding` | `[number, number, number, number]` | Padding around glyphs |
| `spacing` | `[number, number]` | Spacing between glyphs |


## SDFDistanceField

Distance field specific info.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `fieldType` | `"sdf" or "msdf" or "mtsdf"` | Type: "sdf", "msdf", or "mtsdf" |
| `distanceRange` | `number` | Distance range in pixels |


## SDFFont

Complete SDF/MSDF font data.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `info` | `SDFInfo` | Font info |
| `common` | `SDFCommon` | Common metrics |
| `distanceField` | `SDFDistanceField or undefined` | Distance field info |
| `pages` | `string[]` | Atlas page filenames |
| `glyphs` | `Map<number, SDFGlyph>` | Glyph data indexed by character code |
| `kernings` | `Map<string, number>` | Kerning pairs |

