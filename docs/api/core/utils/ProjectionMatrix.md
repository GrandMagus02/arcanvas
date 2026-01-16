# ProjectionMatrix

ProjectionMatrix is a 4x4 matrix that represents a projection in 3D space.

## Methods

- [update](#update)

### update

Update the projection matrix with new options.

| Method | Type |
| ---------- | ---------- |
| `update` | `(options?: Partial<ProjectionMatrixOptions<T>> or undefined) => void` |

# Interfaces

- [OrthographicProjectionMatrixOptions](#orthographicprojectionmatrixoptions)
- [PerspectiveProjectionMatrixOptions](#perspectiveprojectionmatrixoptions)

## OrthographicProjectionMatrixOptions

OrthographicProjectionMatrixOptions is an interface for the options of the OrthographicProjectionMatrix.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `left` | `number` |  |
| `right` | `number` |  |
| `bottom` | `number` |  |
| `top` | `number` |  |
| `near` | `number` |  |
| `far` | `number` |  |


## PerspectiveProjectionMatrixOptions

PerspectiveProjectionMatrixOptions is an interface for the options of the PerspectiveProjectionMatrix.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `fovY` | `number` |  |
| `aspect` | `number` |  |
| `near` | `number` |  |
| `far` | `number` |  |


# Types

- [ProjectionMatrixOptions](#projectionmatrixoptions)

## ProjectionMatrixOptions

ProjectionMatrixOptions is a discriminated union type for the options of the ProjectionMatrix.

| Type | Type |
| ---------- | ---------- |
| `ProjectionMatrixOptions` | `(T extends ProjectionMode.Perspective ? PerspectiveProjectionMatrixOptions : OrthographicProjectionMatrixOptions) and { mode: T; }` |

