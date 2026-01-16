# PolygonMaterial

Material for polygon meshes that manages shader program and cached locations.

## Methods

- [bind](#bind)

### bind

Bind the material: activate program, set uniforms, enable attributes.

| Method | Type |
| ---------- | ---------- |
| `bind` | `(ctx: IRenderContext, viewProjectionMatrix: Float32Array<ArrayBufferLike> or null, fill: PolygonFill) => void` |
