# GridMesh

GridMesh renders an infinite grid with major/minor lines, colored axes, and optional dashes.
Supports three planes (XY, XZ, YZ) and both adaptive and fixed spacing modes.

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
- [setViewportSize](#setviewportsize)
- [setViewProjection](#setviewprojection)
- [setCameraPosition](#setcameraposition)

### setPlane

Set the plane orientation: XY (default), XZ, or YZ.

| Method | Type |
| ---------- | ---------- |
| `setPlane` | `(plane: GridPlane) => void` |

### setAdaptiveSpacing

Enable or disable adaptive spacing (zoom-aware).

| Method | Type |
| ---------- | ---------- |
| `setAdaptiveSpacing` | `(enabled: boolean) => void` |

### setCellSize

Set fixed cell size in world units (used when adaptive spacing is disabled).

| Method | Type |
| ---------- | ---------- |
| `setCellSize` | `(size: number) => void` |

### setMajorDivisions

Set the number of major grid divisions per cell.

| Method | Type |
| ---------- | ---------- |
| `setMajorDivisions` | `(div: number) => void` |

### setAxisLineWidth

Set axis line width in pixels.

| Method | Type |
| ---------- | ---------- |
| `setAxisLineWidth` | `(width: number) => void` |

### setMajorLineWidth

Set major grid line width in pixels.

| Method | Type |
| ---------- | ---------- |
| `setMajorLineWidth` | `(width: number) => void` |

### setMinorLineWidth

Set minor grid line width in pixels.

| Method | Type |
| ---------- | ---------- |
| `setMinorLineWidth` | `(width: number) => void` |

### setAxisDashScale

Set axis dash scale (controls dash frequency).

| Method | Type |
| ---------- | ---------- |
| `setAxisDashScale` | `(scale: number) => void` |

### setMinCellPixelSize

Set minimum cell size in pixels for adaptive grid.
If the visual size of a cell drops below this, the grid will switch to a larger interval.

| Method | Type |
| ---------- | ---------- |
| `setMinCellPixelSize` | `(pixels: number) => void` |

### setFixedPixelSize

Enable or disable fixed pixel-size lines (lines maintain constant pixel width regardless of zoom).
When enabled, lines always render at the specified pixel width.
When disabled, lines scale with camera zoom.

| Method | Type |
| ---------- | ---------- |
| `setFixedPixelSize` | `(enabled: boolean) => void` |

### setBaseColor

Set base color (background).

| Method | Type |
| ---------- | ---------- |
| `setBaseColor` | `(r: number, g: number, b: number, a: number) => void` |

### setMinorColor

Set minor grid line color.

| Method | Type |
| ---------- | ---------- |
| `setMinorColor` | `(r: number, g: number, b: number, a: number) => void` |

### setMajorColor

Set major grid line color.

| Method | Type |
| ---------- | ---------- |
| `setMajorColor` | `(r: number, g: number, b: number, a: number) => void` |

### setXAxisColor

Set X axis color.

| Method | Type |
| ---------- | ---------- |
| `setXAxisColor` | `(r: number, g: number, b: number, a: number) => void` |

### setXAxisDashColor

Set X axis dash color.

| Method | Type |
| ---------- | ---------- |
| `setXAxisDashColor` | `(r: number, g: number, b: number, a: number) => void` |

### setYAxisColor

Set Y axis color.

| Method | Type |
| ---------- | ---------- |
| `setYAxisColor` | `(r: number, g: number, b: number, a: number) => void` |

### setYAxisDashColor

Set Y axis dash color.

| Method | Type |
| ---------- | ---------- |
| `setYAxisDashColor` | `(r: number, g: number, b: number, a: number) => void` |

### setZAxisColor

Set Z axis color.

| Method | Type |
| ---------- | ---------- |
| `setZAxisColor` | `(r: number, g: number, b: number, a: number) => void` |

### setZAxisDashColor

Set Z axis dash color.

| Method | Type |
| ---------- | ---------- |
| `setZAxisDashColor` | `(r: number, g: number, b: number, a: number) => void` |

### setCenterColor

Set center highlight color (where axes intersect).

| Method | Type |
| ---------- | ---------- |
| `setCenterColor` | `(r: number, g: number, b: number, a: number) => void` |

### setViewportSize

Set viewport size in pixels.

| Method | Type |
| ---------- | ---------- |
| `setViewportSize` | `(width: number, height: number) => void` |

### setViewProjection

Set the view-projection matrix (combines view and projection).
The inverse will be computed automatically.

| Method | Type |
| ---------- | ---------- |
| `setViewProjection` | `(matrix: TransformationMatrix or null) => void` |

### setCameraPosition

Set camera position in world space.

| Method | Type |
| ---------- | ---------- |
| `setCameraPosition` | `(x: number, y: number, z: number) => void` |

# Types

- [GridPlane](#gridplane)

## GridPlane

Grid plane orientation.

| Type | Type |
| ---------- | ---------- |
| `GridPlane` | `XY" or "XZ" or "YZ` |

