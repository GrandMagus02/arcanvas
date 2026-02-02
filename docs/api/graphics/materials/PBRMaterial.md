# PBRMaterial

Physically-based rendering material.

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

- [PBRMaterialOptions](#pbrmaterialoptions)

## PBRMaterialOptions

Options for PBRMaterial.

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

