# ShaderRegistry

Registry for shader sources by shading model.

## Static Methods

- [getInstance](#getinstance)

### getInstance

| Method | Type |
| ---------- | ---------- |
| `getInstance` | `() => ShaderRegistry` |

## Methods

- [register](#register)
- [get](#get)
- [has](#has)

### register

| Method | Type |
| ---------- | ---------- |
| `register` | `(model: ShadingModel, registration: ShaderRegistration) => void` |

### get

| Method | Type |
| ---------- | ---------- |
| `get` | `(model: ShadingModel) => ShaderRegistration or undefined` |

### has

| Method | Type |
| ---------- | ---------- |
| `has` | `(model: ShadingModel) => boolean` |

# Interfaces

- [ShaderRegistration](#shaderregistration)

## ShaderRegistration

Registration entry for a shader.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `source` | `ShaderSource` |  |
| `config` | `CustomDrawConfig` |  |

