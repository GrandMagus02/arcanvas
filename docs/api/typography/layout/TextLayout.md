# TextLayout

## Static Methods

- [layout](#layout)

### layout

| Method | Type |
| ---------- | ---------- |
| `layout` | `(text: string, font: Font, options: LayoutOptions) => TextMetrics` |

# Interfaces

- [LayoutOptions](#layoutoptions)
- [GlyphLayout](#glyphlayout)
- [TextMetrics](#textmetrics)

## LayoutOptions



| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `fontSize` | `number` |  |
| `lineHeight` | `number or undefined` |  |
| `letterSpacing` | `number or undefined` |  |
| `width` | `number or undefined` |  |
| `height` | `number or undefined` |  |
| `align` | `"left" or "center" or "right" or undefined` |  |
| `overflow` | `"visible" or "hidden" or "ellipsis" or undefined` |  |
| `wordWrap` | `"normal" or "break-word" or "break-all" or "nowrap" or undefined` |  |


## GlyphLayout



| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `glyph` | `Glyph` |  |
| `x` | `number` |  |
| `y` | `number` |  |
| `index` | `number` |  |


## TextMetrics



| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `width` | `number` |  |
| `height` | `number` |  |
| `glyphs` | `GlyphLayout[]` |  |

