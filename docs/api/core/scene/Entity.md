# Entity

A Entity in the scene graph.

## Constructors

`public`: Creates a new {@link Entity}.

Parameters:

* `name`: Optional name for the Entity. Defaults to `null`.
* `id`: Optional id. If omitted, a new UUID will be generated.


## Static Methods

- [fromJSON](#fromjson)

### fromJSON

Reconstructs a Entity (and its subtree) from its JSON representation.

| Method | Type |
| ---------- | ---------- |
| `fromJSON` | `(json: EntityJSON) => Entity` |

Parameters:

* `json`: The serialized 


Returns:

The root {@link Entity } of the reconstructed subtree.

## Methods

- [toJSON](#tojson)
- [findById](#findbyid)
- [findByName](#findbyname)

### toJSON

Serializes this Entity (and its children) into a JSON-friendly structure.

| Method | Type |
| ---------- | ---------- |
| `toJSON` | `() => EntityJSON` |

Returns:

A {@link EntityJSON } object describing this subtree.

### findById

Finds a Entity in this subtree by its id.

| Method | Type |
| ---------- | ---------- |
| `findById` | `(id: string) => Entity or null` |

Parameters:

* `id`: The id to search for.


Returns:

The first Entity with the given id, or `null` if none is found.

### findByName

Finds Entities in this subtree by name.

| Method | Type |
| ---------- | ---------- |
| `findByName` | `(name: string) => Entity[]` |

Parameters:

* `name`: The name to search for.


Returns:

An array of all Entities with the given name.

## Properties

- [id](#id)
- [name](#name)
- [visible](#visible)

### id

Unique identifier for the object.

| Property | Type |
| ---------- | ---------- |
| `id` | `string` |

### name

Optional name for the object.

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

JSON representation of a Entity.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `id` | `string` |  |
| `name` | `string or undefined` |  |
| `parent` | `string or undefined` |  |
| `children` | `EntityJSON[] or undefined` |  |
| `visible` | `boolean or undefined` |  |


## EntityLike

Interface for objects that are Entity-like (have Entity-specific properties and methods).

This interface combines Identifiable, Named, and Entity-specific search methods.
Useful for type constraints when working with Entity-like objects.

| Property | Type | Description |
| ---------- | ---------- | ---------- |

