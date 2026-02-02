
# Interfaces

- [Builder](#builder)

## Builder

Interface for builder objects that construct instances of a type.

Builders follow the builder pattern, allowing for fluent configuration
of complex objects before construction.

| Property | Type | Description |
| ---------- | ---------- | ---------- |


Examples:

```ts
class MaterialBuilder implements Builder<Material> {
  build(): Material {
    return new Material(/* ... *\/);
  }
}
```

