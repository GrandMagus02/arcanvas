# CloneMixin

Mixin class that provides clone and deepClone functionality for tree-like structures.

Classes using this mixin must:
1. Have a `children` property (array of the same type)
2. Have an `add` method to add children
3. Implement `createCloneInstance()` method that creates a new instance without children

## Methods

- [clone](#clone)
- [deepClone](#deepclone)

### clone

Creates a copy of this object.

| Method | Type |
| ---------- | ---------- |
| `clone` | `(deep?: boolean) => T` |

Parameters:

* `deep`: When `true`, all descendants are also cloned recursively.
When `false`, the clone has no children.


Returns:

A cloned instance.

### deepClone

Creates a deep clone of this object and all its descendants.

| Method | Type |
| ---------- | ---------- |
| `deepClone` | `() => T` |

Returns:

A deep cloned instance.
