# ProgramCache

Cache for compiled WebGL programs.

## Methods

- [getOrCreate](#getorcreate)
- [dispose](#dispose)

### getOrCreate

Gets an existing program or creates a new one.

| Method | Type |
| ---------- | ---------- |
| `getOrCreate` | `(gl: WebGLRenderingContext, key: string, vsSource: string, fsSource: string) => WebGLProgram or null` |

### dispose

Disposes all cached programs.

| Method | Type |
| ---------- | ---------- |
| `dispose` | `(gl: WebGLRenderingContext) => void` |
