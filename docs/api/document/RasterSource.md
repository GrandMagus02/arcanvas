
# Interfaces

- [RasterSourceRef](#rastersourceref)

## RasterSourceRef

Abstract reference to raster image data (API-agnostic).
Can represent CPU buffer, GPU texture handle, file reference, etc.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `id` | `string` |  |
| `width` | `number` |  |
| `height` | `number` |  |
| `source` | `string or ImageBitmap or HTMLImageElement or OffscreenCanvas` |  |

