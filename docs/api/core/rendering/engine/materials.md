# UnlitColorMaterial

## Properties

- [baseColor](#basecolor)
- [doubleSided](#doublesided)
- [wireframe](#wireframe)
- [outline](#outline)

### baseColor

| Property | Type |
| ---------- | ---------- |
| `baseColor` | `[number, number, number, number]` |

### doubleSided

| Property | Type |
| ---------- | ---------- |
| `doubleSided` | `boolean or undefined` |

### wireframe

| Property | Type |
| ---------- | ---------- |
| `wireframe` | `boolean or undefined` |

### outline

| Property | Type |
| ---------- | ---------- |
| `outline` | `{ thickness: number; color: [number, number, number, number]; screenSpace: boolean; } or undefined` |

# PBRMaterial

## Properties

- [baseColor](#basecolor)
- [metallic](#metallic)
- [roughness](#roughness)
- [metallicRoughnessTexture](#metallicroughnesstexture)
- [normalTexture](#normaltexture)
- [doubleSided](#doublesided)
- [wireframe](#wireframe)
- [outline](#outline)

### baseColor

| Property | Type |
| ---------- | ---------- |
| `baseColor` | `[number, number, number, number]` |

### metallic

| Property | Type |
| ---------- | ---------- |
| `metallic` | `number` |

### roughness

| Property | Type |
| ---------- | ---------- |
| `roughness` | `number` |

### metallicRoughnessTexture

| Property | Type |
| ---------- | ---------- |
| `metallicRoughnessTexture` | `TextureRef or null or undefined` |

### normalTexture

| Property | Type |
| ---------- | ---------- |
| `normalTexture` | `TextureRef or null or undefined` |

### doubleSided

| Property | Type |
| ---------- | ---------- |
| `doubleSided` | `boolean or undefined` |

### wireframe

| Property | Type |
| ---------- | ---------- |
| `wireframe` | `boolean or undefined` |

### outline

| Property | Type |
| ---------- | ---------- |
| `outline` | `{ thickness: number; color: [number, number, number, number]; screenSpace: boolean; } or undefined` |

# Interfaces

- [TextureRef](#textureref)
- [BaseMaterial](#basematerial)
- [UnlitColorMaterialOptions](#unlitcolormaterialoptions)
- [PBRMaterialOptions](#pbrmaterialoptions)

## TextureRef



| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `source` | `HTMLImageElement or ImageBitmap or Uint8Array<ArrayBufferLike> or Record<string, unknown>` |  |
| `width` | `number` |  |
| `height` | `number` |  |
| `format` | `"rgba8" or "rgb8" or "rg8"` |  |


## BaseMaterial



| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `shadingModel` | `ShadingModel` |  |
| `baseColor` | `[number, number, number, number] or undefined` |  |
| `baseColorTexture` | `TextureRef or null or undefined` |  |
| `metallic` | `number or undefined` |  |
| `roughness` | `number or undefined` |  |
| `metallicRoughnessTexture` | `TextureRef or null or undefined` |  |
| `normalTexture` | `TextureRef or null or undefined` |  |
| `doubleSided` | `boolean or undefined` |  |
| `wireframe` | `boolean or undefined` |  |
| `receiveShadows` | `boolean or undefined` |  |
| `castShadows` | `boolean or undefined` |  |
| `outline` | `{ thickness: number; color: [number, number, number, number]; screenSpace: boolean; } or undefined` |  |
| `extra` | `Record<string, unknown> or undefined` |  |


## UnlitColorMaterialOptions



| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `baseColor` | `[number, number, number, number] or undefined` |  |
| `doubleSided` | `boolean or undefined` |  |
| `wireframe` | `boolean or undefined` |  |
| `outline` | `{ thickness: number; color: [number, number, number, number]; screenSpace: boolean; } or undefined` |  |


## PBRMaterialOptions



| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `baseColor` | `[number, number, number, number] or undefined` |  |
| `metallic` | `number or undefined` |  |
| `roughness` | `number or undefined` |  |
| `metallicRoughnessTexture` | `TextureRef or null or undefined` |  |
| `normalTexture` | `TextureRef or null or undefined` |  |
| `doubleSided` | `boolean or undefined` |  |
| `wireframe` | `boolean or undefined` |  |
| `outline` | `{ thickness: number; color: [number, number, number, number]; screenSpace: boolean; } or undefined` |  |


# Types

- [ShadingModel](#shadingmodel)

## ShadingModel

| Type | Type |
| ---------- | ---------- |
| `ShadingModel` | `unlit" or "phong" or "pbr" or "grid` |

