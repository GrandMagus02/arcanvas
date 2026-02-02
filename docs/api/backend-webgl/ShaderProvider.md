# Functions

- [isShaderProvider](#isshaderprovider)

## isShaderProvider

Type guard to check if a material implements ShaderProvider.

| Function | Type |
| ---------- | ---------- |
| `isShaderProvider` | `(material: BaseMaterial) => material is BaseMaterial and ShaderProvider` |



# Interfaces

- [ShaderSource](#shadersource)
- [CustomDrawConfig](#customdrawconfig)
- [UniformContext](#uniformcontext)
- [ShaderProvider](#shaderprovider)

## ShaderSource

Shader source definition for a material.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `vertex` | `string` |  |
| `fragment` | `string` |  |


## CustomDrawConfig

Draw configuration for custom materials.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `positionComponents` | `2 or 3` | Number of position components (2 or 3) |
| `disableDepthWrite` | `boolean or undefined` | Whether to disable depth write during rendering |
| `disableDepthTest` | `boolean or undefined` | Whether to disable depth test during rendering (useful for overlapping transparent geometry) |
| `shaderKey` | `string or undefined` | Unique key for shader caching (to differentiate materials with same shadingModel but different shaders) |
| `blendMode` | `CustomBlendMode or undefined` | Blend mode for transparency. Use 'premultiplied' for correct alpha compositing with overlapping quads. |
| `setUniforms` | `((gl: WebGLRenderingContext, program: WebGLProgram, material: BaseMaterial, context: UniformContext) => void) or undefined` | Custom uniform setter function |


## UniformContext

Context passed to uniform setters.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `viewMatrix` | `Float32Array<ArrayBufferLike>` |  |
| `projMatrix` | `Float32Array<ArrayBufferLike>` |  |
| `modelMatrix` | `Float32Array<ArrayBufferLike>` |  |
| `cameraPosition` | `[number, number, number]` |  |
| `viewportWidth` | `number` |  |
| `viewportHeight` | `number` |  |


## ShaderProvider

Interface for materials that provide their own shaders.

| Property | Type | Description |
| ---------- | ---------- | ---------- |


# Types

- [CustomBlendMode](#customblendmode)

## CustomBlendMode

Blend mode for custom materials.

| Type | Type |
| ---------- | ---------- |
| `CustomBlendMode` | `normal" or "premultiplied" or "additive" or "none` |

