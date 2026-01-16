# Functions

- [createBackend](#createbackend)

## createBackend

Creates a render backend instance based on the specified backend type.

| Function | Type |
| ---------- | ---------- |
| `createBackend` | `(target: HTMLCanvasElement or WebGLRenderingContext or CanvasRenderingContext2D, backend: BackendType) => IRenderBackend` |

Parameters:

* `target`: - Canvas element or rendering context
* `backend`: - Backend type to create


Returns:

Configured render backend instance



# Types

- [BackendType](#backendtype)

## BackendType

Supported rendering backend types.

| Type | Type |
| ---------- | ---------- |
| `BackendType` | `webgl" or "canvas2d" or "webgpu` |

