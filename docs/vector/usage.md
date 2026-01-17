# Vector and Matrix Usage Guide

## API Design Principles

The Vector and Matrix classes follow a clear pattern for mutating vs non-mutating operations:

### Mutating Methods (In-Place)

Methods that **modify the current instance** and return `this` for method chaining:

- **Vector**: `add()`, `sub()`, `mult()`, `div()`, `scale()`, `normalize()`, `reverse()`, `fill()`
- **Matrix**: `addSelf()`, `subSelf()`, `scaleSelf()`, `fill()`

These methods mutate the object and return `this` for chaining:

```typescript
const v = Vector3.of(1, 2, 3);
v.add(Vector3.of(1, 1, 1)).scale(2); // v is now (4, 6, 8)
```

### Non-Mutating Methods

Methods that **create new instances** without modifying the original:

- **Vector**: `clone()`, `toReversed()`
- **Matrix**: `add()`, `sub()`, `div()`, `mult()`, `transpose()`, `clone()`

These methods return new instances:

```typescript
const v1 = Vector3.of(1, 2, 3);
const v2 = v1.clone().add(Vector3.of(1, 1, 1)); // v1 is unchanged, v2 is (2, 3, 4)
```

## Performance Recommendations

### Hot Path Code (Rendering, Physics, etc.)

Use **in-place methods** to minimize allocations:

```typescript
// Good: In-place operations
const velocity = Vector3.of(1, 0, 0);
velocity.add(acceleration.scale(dt)); // Mutates velocity

// Avoid: Creating unnecessary copies
const velocity = velocity.add(acceleration.scale(dt)); // Creates new instance
```

### Non-Hot Path Code (Tools, UI, Setup)

Use **high-level classes** with method chaining for readability:

```typescript
// Good: Clear and readable
const position = Vector3.of(0, 0, 0)
  .add(offset)
  .scale(scaleFactor);

// Or use immutable operations when needed
const result = position.clone().add(offset);
```

## Vector Usage

### Creating Vectors

```typescript
// From components
const v2 = Vector2.of(1, 2);
const v3 = Vector3.of(1, 2, 3);
const v4 = Vector4.of(1, 2, 3, 4);

// From array
const v = Vector3.fromArray([1, 2, 3]);

// From buffer (for performance)
const buffer = new ArrayBuffer(12);
const v = Vector3.fromBuffer(buffer, 0);
```

### Vector Operations

```typescript
const a = Vector3.of(1, 2, 3);
const b = Vector3.of(4, 5, 6);

// In-place operations
a.add(b); // a is now (5, 7, 9)
a.scale(2); // a is now (10, 14, 18)
a.normalize(); // a is now normalized

// Non-mutating operations
const c = a.clone(); // Create a copy
const reversed = a.toReversed(); // New reversed vector

// Cross product (Vector3 only)
const cross = a.clone().cross(b); // Proper 3D cross product
```

## Matrix Usage

### Creating Matrices

```typescript
// Identity matrices
const m2 = Matrix2.identity();
const m3 = Matrix3.identity();
const m4 = Matrix4.identity();

// From values
const m2 = Matrix2.fromValues(1, 2, 3, 4);
const m3 = Matrix3.fromValues(1, 2, 3, 4, 5, 6, 7, 8, 9);

// From array
const m = Matrix3.fromArray([1, 2, 3, 4, 5, 6, 7, 8, 9], 3, 3);
```

### Matrix Operations

```typescript
const a = Matrix3.identity();
const b = Matrix3.identity();

// Non-mutating operations (create new instances)
const sum = a.add(b);
const product = a.mult(b);
const transposed = a.transpose();

// In-place operations
a.addSelf(b); // Mutates a
a.scaleSelf(2); // Mutates a
a.fill(0); // Mutates a
```

## Common Patterns

### Method Chaining

```typescript
// Vector chaining
const result = Vector3.of(1, 2, 3)
  .add(offset)
  .scale(2)
  .normalize();

// Matrix chaining (in-place)
const transform = Matrix4.identity()
  .fill(0)
  .scaleSelf(2);
```

### Cloning for Safety

```typescript
// When you need to preserve the original
const original = Vector3.of(1, 2, 3);
const modified = original.clone().add(Vector3.of(1, 1, 1));
// original is still (1, 2, 3)
```

### Performance-Critical Code

```typescript
// Reuse vectors to avoid allocations
const temp = Vector3.of(0, 0, 0);
for (let i = 0; i < 1000; i++) {
  temp.add(force).scale(dt); // Reuse temp vector
  position.add(temp);
}
```

## Type Safety

All methods preserve the vector/matrix type:

```typescript
const v2 = Vector2.of(1, 2);
const cloned = v2.clone(); // Type is Vector2, not Vector

const m3 = Matrix3.identity();
const cloned = m3.clone(); // Type is Matrix3, not Matrix
```
