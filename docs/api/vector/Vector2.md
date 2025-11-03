# Vector2Base

Vector2Base is a base class for all 2D vectors.

Examples:

```ts
const vector = new Vector2Base<Float32Array>(new Float32Array([1, 2]));
console.log(vector.x); // 1
console.log(vector.y); // 2
```


## Static Methods

- [from](#from)

### from

| Method | Type |
| ---------- | ---------- |
| `from` | `<TArr extends TypedArray, TSelf extends Vector2Base<TArr>>(this: new (x: number, y: number) => TSelf, src: ArrayLike<number>) => TSelf` |

# Uint8Vector2

Uint8Vector2 is a 2D vector of unsigned 8-bit integers.

# Int8Vector2

Int8Vector2 is a 2D vector of signed 8-bit integers.

# Int16Vector2

Int16Vector2 is a 2D vector of signed 16-bit integers.

# Uint16Vector2

Uint16Vector2 is a 2D vector of unsigned 16-bit integers.

# Float32Vector2

Float32Vector2 is a 2D vector of 32-bit floating point numbers.

# Float64Vector2

Float64Vector2 is a 2D vector of 64-bit floating point numbers.

# Int32Vector2

Int32Vector2 is a 2D vector of signed 32-bit integers.

# Uint8ClampedVector2

Uint8ClampedVector2 is a 2D vector of unsigned 8-bit integers that are clamped to the range [0, 255].
