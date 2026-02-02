# DocumentRenderPass

RenderPass that composites document layers.
Renders layers bottom-to-top with blend modes and opacity.

## Methods

- [name](#name)
- [execute](#execute)
- [getDocumentView](#getdocumentview)

### name

| Method | Type |
| ---------- | ---------- |
| `name` | `() => string` |

### execute

| Method | Type |
| ---------- | ---------- |
| `execute` | `(ctx: PassContext) => void` |

### getDocumentView

Get the document view.

| Method | Type |
| ---------- | ---------- |
| `getDocumentView` | `() => DocumentView` |
