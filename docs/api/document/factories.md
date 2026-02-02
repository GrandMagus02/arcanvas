# Functions

- [createDocument](#createdocument)
- [createRasterLayer](#createrasterlayer)
- [createGroupLayer](#creategrouplayer)

## createDocument

Create a new document.

| Function | Type |
| ---------- | ---------- |
| `createDocument` | `(width: number, height: number, options?: Partial<DocumentOptions> or undefined) => Document` |

## createRasterLayer

Create a raster layer.

| Function | Type |
| ---------- | ---------- |
| `createRasterLayer` | `(doc: Document, options?: { name?: string or undefined; width?: number or undefined; height?: number or undefined; } or undefined) => RasterLayer` |

## createGroupLayer

Create a group layer.

| Function | Type |
| ---------- | ---------- |
| `createGroupLayer` | `(doc: Document, options?: { name?: string or undefined; } or undefined) => GroupLayer` |


