# LayerMaterial

Material for rendering a document layer with blend mode and opacity support.

## Methods

- [setTexture](#settexture)
- [setOpacity](#setopacity)
- [setBlendMode](#setblendmode)
- [getShaderSource](#getshadersource)
- [getDrawConfig](#getdrawconfig)

### setTexture

Update the texture.

| Method | Type |
| ---------- | ---------- |
| `setTexture` | `(texture: TextureRef or null) => void` |

### setOpacity

Update the opacity.

| Method | Type |
| ---------- | ---------- |
| `setOpacity` | `(opacity: number) => void` |

### setBlendMode

Update the blend mode.

| Method | Type |
| ---------- | ---------- |
| `setBlendMode` | `(blendMode: BlendMode) => void` |

### getShaderSource

| Method | Type |
| ---------- | ---------- |
| `getShaderSource` | `() => ShaderSource` |

### getDrawConfig

| Method | Type |
| ---------- | ---------- |
| `getDrawConfig` | `() => CustomDrawConfig` |

## Properties

- [baseColor](#basecolor)
- [baseColorTexture](#basecolortexture)
- [opacity](#opacity)
- [blendMode](#blendmode)

### baseColor

| Property | Type |
| ---------- | ---------- |
| `baseColor` | `[number, number, number, number] or undefined` |

### baseColorTexture

| Property | Type |
| ---------- | ---------- |
| `baseColorTexture` | `TextureRef or null or undefined` |

### opacity

| Property | Type |
| ---------- | ---------- |
| `opacity` | `number` |

### blendMode

| Property | Type |
| ---------- | ---------- |
| `blendMode` | `BlendMode` |
