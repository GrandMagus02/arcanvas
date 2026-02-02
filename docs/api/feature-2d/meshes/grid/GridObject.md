# GridObject

Engine-level grid object for the new rendering pipeline.
Uses a procedural shader to render an infinite grid.

## Methods

- [setPlane](#setplane)
- [setAdaptiveSpacing](#setadaptivespacing)
- [setCellSize](#setcellsize)
- [setMajorDivisions](#setmajordivisions)
- [setAxisLineWidth](#setaxislinewidth)
- [setMajorLineWidth](#setmajorlinewidth)
- [setMinorLineWidth](#setminorlinewidth)
- [setAxisDashScale](#setaxisdashscale)
- [setMinCellPixelSize](#setmincellpixelsize)
- [setFixedPixelSize](#setfixedpixelsize)
- [setBaseColor](#setbasecolor)
- [setMinorColor](#setminorcolor)
- [setMajorColor](#setmajorcolor)
- [setXAxisColor](#setxaxiscolor)
- [setXAxisDashColor](#setxaxisdashcolor)
- [setYAxisColor](#setyaxiscolor)
- [setYAxisDashColor](#setyaxisdashcolor)
- [setZAxisColor](#setzaxiscolor)
- [setZAxisDashColor](#setzaxisdashcolor)
- [setCenterColor](#setcentercolor)

### setPlane

| Method | Type |
| ---------- | ---------- |
| `setPlane` | `(plane: GridPlane or undefined) => this` |

### setAdaptiveSpacing

| Method | Type |
| ---------- | ---------- |
| `setAdaptiveSpacing` | `(enabled: boolean) => this` |

### setCellSize

| Method | Type |
| ---------- | ---------- |
| `setCellSize` | `(size: number) => this` |

### setMajorDivisions

| Method | Type |
| ---------- | ---------- |
| `setMajorDivisions` | `(div: number) => this` |

### setAxisLineWidth

| Method | Type |
| ---------- | ---------- |
| `setAxisLineWidth` | `(width: number) => this` |

### setMajorLineWidth

| Method | Type |
| ---------- | ---------- |
| `setMajorLineWidth` | `(width: number) => this` |

### setMinorLineWidth

| Method | Type |
| ---------- | ---------- |
| `setMinorLineWidth` | `(width: number) => this` |

### setAxisDashScale

| Method | Type |
| ---------- | ---------- |
| `setAxisDashScale` | `(scale: number) => this` |

### setMinCellPixelSize

| Method | Type |
| ---------- | ---------- |
| `setMinCellPixelSize` | `(pixels: number) => this` |

### setFixedPixelSize

| Method | Type |
| ---------- | ---------- |
| `setFixedPixelSize` | `(enabled: boolean) => this` |

### setBaseColor

| Method | Type |
| ---------- | ---------- |
| `setBaseColor` | `(r: number, g: number, b: number, a: number) => this` |

### setMinorColor

| Method | Type |
| ---------- | ---------- |
| `setMinorColor` | `(r: number, g: number, b: number, a: number) => this` |

### setMajorColor

| Method | Type |
| ---------- | ---------- |
| `setMajorColor` | `(r: number, g: number, b: number, a: number) => this` |

### setXAxisColor

| Method | Type |
| ---------- | ---------- |
| `setXAxisColor` | `(r: number, g: number, b: number, a: number) => this` |

### setXAxisDashColor

| Method | Type |
| ---------- | ---------- |
| `setXAxisDashColor` | `(r: number, g: number, b: number, a: number) => this` |

### setYAxisColor

| Method | Type |
| ---------- | ---------- |
| `setYAxisColor` | `(r: number, g: number, b: number, a: number) => this` |

### setYAxisDashColor

| Method | Type |
| ---------- | ---------- |
| `setYAxisDashColor` | `(r: number, g: number, b: number, a: number) => this` |

### setZAxisColor

| Method | Type |
| ---------- | ---------- |
| `setZAxisColor` | `(r: number, g: number, b: number, a: number) => this` |

### setZAxisDashColor

| Method | Type |
| ---------- | ---------- |
| `setZAxisDashColor` | `(r: number, g: number, b: number, a: number) => this` |

### setCenterColor

| Method | Type |
| ---------- | ---------- |
| `setCenterColor` | `(r: number, g: number, b: number, a: number) => this` |

## Properties

- [mesh](#mesh)
- [material](#material)
- [transform](#transform)

### mesh

| Property | Type |
| ---------- | ---------- |
| `mesh` | `Mesh` |

### material

| Property | Type |
| ---------- | ---------- |
| `material` | `BaseMaterial` |

### transform

| Property | Type |
| ---------- | ---------- |
| `transform` | `Transform` |
