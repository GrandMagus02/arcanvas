# ViewMatrix

ViewMatrix is a 4x4 matrix that represents a view in 3D space.

Examples:

```ts
const view = new ViewMatrix(new Vector3(0, 0, 0), new Vector3(0, 0, 0), new Vector3(0, 1, 0));
console.log(view.eye); // Vector3(0, 0, 0)
console.log(view.center); // Vector3(0, 0, 0)
console.log(view.up); // Vector3(0, 1, 0)
```


## Methods

- [update](#update)

### update

| Method | Type |
| ---------- | ---------- |
| `update` | `(eye?: Vector3<Float32Array<ArrayBufferLike>> or undefined, center?: Vector3<Float32Array<ArrayBufferLike>> or undefined, up?: Vector3<...> or undefined) => void` |
