# SDFTextMaterial

Material for rendering SDF/MSDF text.

Implements ShaderProvider for custom shader support.

## Methods

- [getShaderSource](#getshadersource)
- [getDrawConfig](#getdrawconfig)
- [dispose](#dispose)

### getShaderSource

Returns the shader source for this material.

| Method | Type |
| ---------- | ---------- |
| `getShaderSource` | `() => ShaderSource` |

### getDrawConfig

Returns the draw configuration for this material.

| Method | Type |
| ---------- | ---------- |
| `getDrawConfig` | `() => CustomDrawConfig` |

### dispose

Disposes of GPU resources.

| Method | Type |
| ---------- | ---------- |
| `dispose` | `(gl: WebGLRenderingContext) => void` |

## Properties

- [atlas](#atlas)
- [color](#color)
- [sdfType](#sdftype)
- [distanceRange](#distancerange)
- [atlasSize](#atlassize)
- [doubleSided](#doublesided)

### atlas

Atlas texture source

| Property | Type |
| ---------- | ---------- |
| `atlas` | `WebGLTexture or HTMLImageElement or HTMLCanvasElement or ImageBitmap` |

### color

Text color

| Property | Type |
| ---------- | ---------- |
| `color` | `[number, number, number, number]` |

### sdfType

SDF type

| Property | Type |
| ---------- | ---------- |
| `sdfType` | `SDFType` |

### distanceRange

Distance range

| Property | Type |
| ---------- | ---------- |
| `distanceRange` | `number` |

### atlasSize

Atlas size [width, height]

| Property | Type |
| ---------- | ---------- |
| `atlasSize` | `[number, number]` |

### doubleSided

Double-sided

| Property | Type |
| ---------- | ---------- |
| `doubleSided` | `boolean or undefined` |

# Interfaces

- [SDFTextMaterialOptions](#sdftextmaterialoptions)

## SDFTextMaterialOptions

Options for SDFTextMaterial.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `atlas` | `WebGLTexture or HTMLImageElement or HTMLCanvasElement or ImageBitmap` | Atlas texture (WebGL texture or image/canvas to be uploaded) |
| `color` | `[number, number, number, number] or undefined` | Text color [r, g, b, a] |
| `sdfType` | `SDFType or undefined` | SDF type for shader selection |
| `distanceRange` | `number or undefined` | Distance range used when generating the atlas (default: 4) |
| `atlasSize` | `[number, number] or undefined` | Atlas texture size [width, height] in pixels |
| `doubleSided` | `boolean or undefined` | Enable double-sided rendering |


# Types

- [SDFType](#sdftype)

## SDFType

SDF/MSDF font type.

| Type | Type |
| ---------- | ---------- |
| `SDFType` | `sdf" or "msdf" or "mtsdf` |

