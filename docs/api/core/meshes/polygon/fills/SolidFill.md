# SolidFill

Solid color fill backed by a simple uniform.

## Methods

- [getCacheKey](#getcachekey)
- [getFragmentSource](#getfragmentsource)
- [getUniformLocations](#getuniformlocations)
- [applyUniforms](#applyuniforms)

### getCacheKey

Stable key for caching programs by shader layout.
Do not include per-instance uniform values.

| Method | Type |
| ---------- | ---------- |
| `getCacheKey` | `() => string` |

### getFragmentSource

Fragment shader source for this fill.

| Method | Type |
| ---------- | ---------- |
| `getFragmentSource` | `() => string` |

### getUniformLocations

Cache uniform locations after program creation.

| Method | Type |
| ---------- | ---------- |
| `getUniformLocations` | `(gl: WebGLRenderingContext, program: WebGLProgram) => PolygonFillUniformLocations` |

### applyUniforms

Apply per-draw uniforms for this fill.

| Method | Type |
| ---------- | ---------- |
| `applyUniforms` | `(ctx: IRenderContext, locations: PolygonFillUniformLocations) => void` |

# Interfaces

- [SolidFillColor](#solidfillcolor)

## SolidFillColor



| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `r` | `number` |  |
| `g` | `number` |  |
| `b` | `number` |  |
| `a` | `number or undefined` |  |

