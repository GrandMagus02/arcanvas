# Entity

An Entity in the scene graph.
Provides identity, naming, and serialization on top of TreeNode.

## Static Methods

- [fromJSON](#fromjson)

### fromJSON

| Method | Type |
| ---------- | ---------- |
| `fromJSON` | `(json: EntityJSON) => Entity` |

## Methods

- [clone](#clone)
- [deepClone](#deepclone)
- [toJSON](#tojson)
- [findById](#findbyid)
- [findByName](#findbyname)

### clone

Creates a shallow or deep clone of this entity.

| Method | Type |
| ---------- | ---------- |
| `clone` | `(deep?: boolean) => Entity` |

### deepClone

Creates a deep clone of this entity.

| Method | Type |
| ---------- | ---------- |
| `deepClone` | `() => Entity` |

### toJSON

| Method | Type |
| ---------- | ---------- |
| `toJSON` | `() => EntityJSON` |

### findById

| Method | Type |
| ---------- | ---------- |
| `findById` | `(id: string) => Entity or null` |

### findByName

| Method | Type |
| ---------- | ---------- |
| `findByName` | `(name: string) => Entity[]` |

## Properties

- [id](#id)
- [name](#name)
- [visible](#visible)

### id

| Property | Type |
| ---------- | ---------- |
| `id` | `string` |

### name

| Property | Type |
| ---------- | ---------- |
| `name` | `string or null` |

### visible

| Property | Type |
| ---------- | ---------- |
| `visible` | `boolean` |

# Interfaces

- [EntityJSON](#entityjson)
- [EntityLike](#entitylike)

## EntityJSON

JSON representation of an Entity.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `id` | `string` |  |
| `name` | `string or undefined` |  |
| `parent` | `string or undefined` |  |
| `children` | `EntityJSON[] or undefined` |  |
| `visible` | `boolean or undefined` |  |


## EntityLike

Interface for objects that are Entity-like.

| Property | Type | Description |
| ---------- | ---------- | ---------- |

