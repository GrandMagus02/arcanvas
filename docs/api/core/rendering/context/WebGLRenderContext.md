# WebGLRenderContext

WebGL implementation of {@link IRenderContext}.

## Methods

- [createVertexBuffer](#createvertexbuffer)
- [createIndexBuffer](#createindexbuffer)
- [bindVertexBuffer](#bindvertexbuffer)
- [bindIndexBuffer](#bindindexbuffer)
- [vertexAttribPointer](#vertexattribpointer)
- [enableVertexAttribArray](#enablevertexattribarray)
- [disableVertexAttribArray](#disablevertexattribarray)
- [useProgram](#useprogram)
- [drawIndexed](#drawindexed)
- [drawArrays](#drawarrays)
- [uniform1f](#uniform1f)
- [uniform2f](#uniform2f)
- [uniform3f](#uniform3f)
- [uniform4f](#uniform4f)
- [uniform1i](#uniform1i)
- [uniformMatrix4fv](#uniformmatrix4fv)
- [clearColor](#clearcolor)
- [colorMask](#colormask)
- [clear](#clear)
- [getWebGLContext](#getwebglcontext)
- [getProgram](#getprogram)
- [getProgramCache](#getprogramcache)
- [getShaderLibrary](#getshaderlibrary)
- [createTexture](#createtexture)
- [updateTexture](#updatetexture)
- [bindTexture](#bindtexture)
- [deleteTexture](#deletetexture)

### createVertexBuffer

Creates a vertex buffer from the given data.

| Method | Type |
| ---------- | ---------- |
| `createVertexBuffer` | `(data: Float32Array<ArrayBufferLike>) => BufferHandle` |

### createIndexBuffer

Creates an index buffer from the given data.

| Method | Type |
| ---------- | ---------- |
| `createIndexBuffer` | `(data: Uint16Array<ArrayBufferLike>) => BufferHandle` |

### bindVertexBuffer

Binds a vertex buffer for rendering.

| Method | Type |
| ---------- | ---------- |
| `bindVertexBuffer` | `(buffer: BufferHandle) => void` |

### bindIndexBuffer

Binds an index buffer for rendering.

| Method | Type |
| ---------- | ---------- |
| `bindIndexBuffer` | `(buffer: BufferHandle) => void` |

### vertexAttribPointer

Sets up vertex attribute pointer for the given attribute location.

| Method | Type |
| ---------- | ---------- |
| `vertexAttribPointer` | `(location: number, size: number, type: number, normalized: boolean, stride: number, offset: number) => void` |

### enableVertexAttribArray

Enables a vertex attribute array.

| Method | Type |
| ---------- | ---------- |
| `enableVertexAttribArray` | `(location: number) => void` |

### disableVertexAttribArray

Disables a vertex attribute array.

| Method | Type |
| ---------- | ---------- |
| `disableVertexAttribArray` | `(location: number) => void` |

### useProgram

Uses a shader program for subsequent draw calls.

| Method | Type |
| ---------- | ---------- |
| `useProgram` | `(program: unknown) => void` |

### drawIndexed

Draws indexed primitives.

| Method | Type |
| ---------- | ---------- |
| `drawIndexed` | `(mode: number, count: number, type: number, offset: number) => void` |

### drawArrays

Draws non-indexed primitives (arrays).

| Method | Type |
| ---------- | ---------- |
| `drawArrays` | `(mode: number, first: number, count: number) => void` |

### uniform1f

Sets a uniform value (1 float).

| Method | Type |
| ---------- | ---------- |
| `uniform1f` | `(location: number or null, value: number) => void` |

### uniform2f

Sets a uniform value (2 floats).

| Method | Type |
| ---------- | ---------- |
| `uniform2f` | `(location: number or null, x: number, y: number) => void` |

### uniform3f

Sets a uniform value (3 floats).

| Method | Type |
| ---------- | ---------- |
| `uniform3f` | `(location: number or null, x: number, y: number, z: number) => void` |

### uniform4f

Sets a uniform value (4 floats).

| Method | Type |
| ---------- | ---------- |
| `uniform4f` | `(location: number or null, x: number, y: number, z: number, w: number) => void` |

### uniform1i

Sets a uniform value (1 integer).

| Method | Type |
| ---------- | ---------- |
| `uniform1i` | `(location: number or null, value: number) => void` |

### uniformMatrix4fv

Sets a uniform matrix value (4x4 matrix).

| Method | Type |
| ---------- | ---------- |
| `uniformMatrix4fv` | `(location: number or null, transpose: boolean, value: Float32Array<ArrayBufferLike>) => void` |

### clearColor

Sets the clear color for the color buffer.

| Method | Type |
| ---------- | ---------- |
| `clearColor` | `(r: number, g: number, b: number, a: number) => void` |

### colorMask

Enables or disables writing to color channels.

| Method | Type |
| ---------- | ---------- |
| `colorMask` | `(r: boolean, g: boolean, b: boolean, a: boolean) => void` |

### clear

Clears the specified buffers.

| Method | Type |
| ---------- | ---------- |
| `clear` | `(mask: number) => void` |

### getWebGLContext

Gets the underlying WebGL context (for advanced operations).
This method is WebGL-specific and may return null for other backends.

| Method | Type |
| ---------- | ---------- |
| `getWebGLContext` | `() => WebGLRenderingContext or null` |

### getProgram

Gets the WebGL program associated with this context.

| Method | Type |
| ---------- | ---------- |
| `getProgram` | `() => WebGLProgram or null` |

Returns:

The WebGL program, or null if none is set.

### getProgramCache

Gets the program cache for reusing compiled shader programs.

| Method | Type |
| ---------- | ---------- |
| `getProgramCache` | `() => ProgramCache` |

### getShaderLibrary

Gets the shader library for storing shader source code.

| Method | Type |
| ---------- | ---------- |
| `getShaderLibrary` | `() => ShaderLibrary` |

### createTexture

Creates a texture from image data.

| Method | Type |
| ---------- | ---------- |
| `createTexture` | `(data: ImageBitmap or HTMLImageElement or Uint8Array<ArrayBufferLike>, width: number, height: number, format?: "rgba8" or "rgb8" or "rg8" or undefined, pixelated?: boolean or undefined) => TextureHandle` |

### updateTexture

Updates an existing texture with new image data.

| Method | Type |
| ---------- | ---------- |
| `updateTexture` | `(handle: TextureHandle, data: ImageBitmap or HTMLImageElement or Uint8Array<ArrayBufferLike>) => void` |

### bindTexture

Binds a texture to a texture unit for rendering.

| Method | Type |
| ---------- | ---------- |
| `bindTexture` | `(handle: TextureHandle, unit: number) => void` |

### deleteTexture

Deletes a texture and frees its resources.

| Method | Type |
| ---------- | ---------- |
| `deleteTexture` | `(handle: TextureHandle) => void` |
