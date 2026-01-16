# ShaderRegistry

Registry for shader sources by shading model.
Allows registering custom shaders for new material types.

## Static Methods

- [getInstance](#getinstance)

### getInstance

Get the singleton instance of the registry.

| Method | Type |
| ---------- | ---------- |
| `getInstance` | `() => ShaderRegistry` |

## Methods

- [register](#register)
- [get](#get)
- [has](#has)

### register

Register a shader for a shading model.

| Method | Type |
| ---------- | ---------- |
| `register` | `(model: ShadingModel, registration: ShaderRegistration) => void` |

### get

Get the shader registration for a shading model.

| Method | Type |
| ---------- | ---------- |
| `get` | `(model: ShadingModel) => ShaderRegistration or undefined` |

### has

Check if a shader is registered for a shading model.

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

