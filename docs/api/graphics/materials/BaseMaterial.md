
# Interfaces

- [BaseMaterial](#basematerial)

## BaseMaterial

Base material interface.
All materials must implement this interface.

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

