# MaterialBuilder

Builder class for creating materials with a fluent API.

Examples:

```ts
// Fluent API
const material = new MaterialBuilder()
  .solid([1, 0, 0, 1])
  .outline([0, 0, 0, 1], 2)
  .build();

// PBR material
const pbrMaterial = new MaterialBuilder()
  .albedo(texture)
  .normals(normalMap)
  .metallic(0.5)
  .roughness(0.3)
  .build();

// Options-based
const material = new MaterialBuilder({
  solid: [1, 0, 0, 1],
  outlineColor: [0, 0, 0, 1],
  outlineWidth: 2
}).build();
```


## Methods

- [solid](#solid)
- [baseColor](#basecolor)
- [albedo](#albedo)
- [baseColorTexture](#basecolortexture)
- [metallic](#metallic)
- [roughness](#roughness)
- [metallicRoughness](#metallicroughness)
- [normals](#normals)
- [normalTexture](#normaltexture)
- [outline](#outline)
- [outlineColor](#outlinecolor)
- [outlineWidth](#outlinewidth)
- [outlineScreenSpace](#outlinescreenspace)
- [doubleSided](#doublesided)
- [wireframe](#wireframe)
- [receiveShadows](#receiveshadows)
- [castShadows](#castshadows)
- [build](#build)

### solid

Set the solid/base color for unlit materials.
Alias for baseColor.

| Method | Type |
| ---------- | ---------- |
| `solid` | `(color: [number, number, number, number]) => this` |

### baseColor

Set the base color (works for both unlit and PBR).

| Method | Type |
| ---------- | ---------- |
| `baseColor` | `(color: [number, number, number, number]) => this` |

### albedo

Set the albedo/base color texture for PBR materials.
Alias for baseColorTexture.

| Method | Type |
| ---------- | ---------- |
| `albedo` | `(texture: TextureRef or null) => this` |

### baseColorTexture

Set the base color texture.

| Method | Type |
| ---------- | ---------- |
| `baseColorTexture` | `(texture: TextureRef or null) => this` |

### metallic

Set the metallic value for PBR materials.

| Method | Type |
| ---------- | ---------- |
| `metallic` | `(value: number) => this` |

### roughness

Set the roughness value for PBR materials.

| Method | Type |
| ---------- | ---------- |
| `roughness` | `(value: number) => this` |

### metallicRoughness

Set the metallic-roughness texture for PBR materials.

| Method | Type |
| ---------- | ---------- |
| `metallicRoughness` | `(texture: TextureRef or null) => this` |

### normals

Set the normal map texture for PBR materials.
Alias for normalTexture.

| Method | Type |
| ---------- | ---------- |
| `normals` | `(texture: TextureRef or null) => this` |

### normalTexture

Set the normal texture.

| Method | Type |
| ---------- | ---------- |
| `normalTexture` | `(texture: TextureRef or null) => this` |

### outline

Set the outline properties.

| Method | Type |
| ---------- | ---------- |
| `outline` | `(color: [number, number, number, number], thickness?: number or undefined, screenSpace?: boolean or undefined) => this` |

Parameters:

* `color`: - Outline color
* `thickness`: - Outline thickness (default: 1)
* `screenSpace`: - Whether outline is in screen space (default: false)


### outlineColor

Set outline color.

| Method | Type |
| ---------- | ---------- |
| `outlineColor` | `(color: [number, number, number, number]) => this` |

### outlineWidth

Set outline thickness/width.

| Method | Type |
| ---------- | ---------- |
| `outlineWidth` | `(thickness: number) => this` |

### outlineScreenSpace

Set whether outline is in screen space.

| Method | Type |
| ---------- | ---------- |
| `outlineScreenSpace` | `(screenSpace: boolean) => this` |

### doubleSided

Enable double-sided rendering.

| Method | Type |
| ---------- | ---------- |
| `doubleSided` | `(enabled?: boolean) => this` |

### wireframe

Enable wireframe rendering.

| Method | Type |
| ---------- | ---------- |
| `wireframe` | `(enabled?: boolean) => this` |

### receiveShadows

Enable shadow receiving.

| Method | Type |
| ---------- | ---------- |
| `receiveShadows` | `(enabled?: boolean) => this` |

### castShadows

Enable shadow casting.

| Method | Type |
| ---------- | ---------- |
| `castShadows` | `(enabled?: boolean) => this` |

### build

Build the material based on the configured options.
Returns a PBRMaterial if PBR properties are set, otherwise UnlitColorMaterial.

| Method | Type |
| ---------- | ---------- |
| `build` | `() => BaseMaterial` |

# Interfaces

- [MaterialBuilderOptions](#materialbuilderoptions)

## MaterialBuilderOptions

Options for MaterialBuilder.
Supports both unlit and PBR material properties.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `solid` | `[number, number, number, number] or undefined` |  |
| `baseColor` | `[number, number, number, number] or undefined` |  |
| `albedo` | `TextureRef or null or undefined` |  |
| `baseColorTexture` | `TextureRef or null or undefined` |  |
| `metallic` | `number or undefined` |  |
| `roughness` | `number or undefined` |  |
| `metallicRoughnessTexture` | `TextureRef or null or undefined` |  |
| `normals` | `TextureRef or null or undefined` |  |
| `normalTexture` | `TextureRef or null or undefined` |  |
| `outline` | `{ thickness: number; color: [number, number, number, number]; screenSpace: boolean; } or undefined` |  |
| `outlineColor` | `[number, number, number, number] or undefined` |  |
| `outlineThickness` | `number or undefined` |  |
| `outlineWidth` | `number or undefined` |  |
| `outlineScreenSpace` | `boolean or undefined` |  |
| `doubleSided` | `boolean or undefined` |  |
| `wireframe` | `boolean or undefined` |  |
| `receiveShadows` | `boolean or undefined` |  |
| `castShadows` | `boolean or undefined` |  |

