
# Interfaces

- [IRenderContext](#irendercontext)

## IRenderContext

Abstraction over rendering API (WebGL, WebGPU, Canvas2D, etc.).

This interface provides a unified API for mesh rendering operations,
allowing the same mesh code to work with different rendering backends.

| Property | Type | Description |
| ---------- | ---------- | ---------- |


# Types

- [BufferHandle](#bufferhandle)
- [ProgramHandle](#programhandle)
- [TextureHandle](#texturehandle)

## BufferHandle

Handle for a buffer resource managed by the render context.
The actual type depends on the implementation (WebGLBuffer, GPUBuffer, etc.).

| Type | Type |
| ---------- | ---------- |
| `BufferHandle` | `object or null` |

## ProgramHandle

Handle for a shader program managed by the render context.
The actual type depends on the implementation (WebGLProgram, GPUShaderModule, etc.).

| Type | Type |
| ---------- | ---------- |
| `ProgramHandle` |  |

## TextureHandle

Handle for a texture resource managed by the render context.
The actual type depends on the implementation (WebGLTexture, GPUTexture, etc.).

| Type | Type |
| ---------- | ---------- |
| `TextureHandle` | `object or null` |

