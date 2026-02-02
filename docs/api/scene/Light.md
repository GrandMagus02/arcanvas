# Light

Light source in the scene.

## Properties

- [type](#type)
- [position](#position)
- [direction](#direction)
- [color](#color)
- [intensity](#intensity)

### type

| Property | Type |
| ---------- | ---------- |
| `type` | `LightType` |

### position

| Property | Type |
| ---------- | ---------- |
| `position` | `[number, number, number] or undefined` |

### direction

| Property | Type |
| ---------- | ---------- |
| `direction` | `[number, number, number] or undefined` |

### color

| Property | Type |
| ---------- | ---------- |
| `color` | `[number, number, number]` |

### intensity

| Property | Type |
| ---------- | ---------- |
| `intensity` | `number` |

# Interfaces

- [LightOptions](#lightoptions)

## LightOptions

Options for creating a Light.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `type` | `LightType` |  |
| `position` | `[number, number, number] or undefined` |  |
| `direction` | `[number, number, number] or undefined` |  |
| `color` | `[number, number, number] or undefined` |  |
| `intensity` | `number or undefined` |  |


# Types

- [LightType](#lighttype)

## LightType

Type of light source.

| Type | Type |
| ---------- | ---------- |
| `LightType` | `directional" or "point" or "spot` |

