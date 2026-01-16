# GridMaterial

Material for the infinite grid shader.
Implements ShaderProvider to provide its own shaders to the backend.

## Methods

- [getShaderSource](#getshadersource)
- [getDrawConfig](#getdrawconfig)

### getShaderSource

Returns the shader sources for this material.

| Method | Type |
| ---------- | ---------- |
| `getShaderSource` | `() => ShaderSource` |

### getDrawConfig

Returns the draw configuration for this material.

| Method | Type |
| ---------- | ---------- |
| `getDrawConfig` | `() => CustomDrawConfig` |

## Properties

- [plane](#plane)
- [adaptiveSpacing](#adaptivespacing)
- [cellSize](#cellsize)
- [majorDivisions](#majordivisions)
- [minCellPixelSize](#mincellpixelsize)
- [axisLineWidth](#axislinewidth)
- [majorLineWidth](#majorlinewidth)
- [minorLineWidth](#minorlinewidth)
- [axisDashScale](#axisdashscale)
- [fixedPixelSize](#fixedpixelsize)
- [baseColor](#basecolor)
- [minorColor](#minorcolor)
- [majorColor](#majorcolor)
- [xAxisColor](#xaxiscolor)
- [xAxisDashColor](#xaxisdashcolor)
- [yAxisColor](#yaxiscolor)
- [yAxisDashColor](#yaxisdashcolor)
- [zAxisColor](#zaxiscolor)
- [zAxisDashColor](#zaxisdashcolor)
- [centerColor](#centercolor)

### plane

| Property | Type |
| ---------- | ---------- |
| `plane` | `GridPlane` |

### adaptiveSpacing

| Property | Type |
| ---------- | ---------- |
| `adaptiveSpacing` | `boolean` |

### cellSize

| Property | Type |
| ---------- | ---------- |
| `cellSize` | `number` |

### majorDivisions

| Property | Type |
| ---------- | ---------- |
| `majorDivisions` | `number` |

### minCellPixelSize

| Property | Type |
| ---------- | ---------- |
| `minCellPixelSize` | `number` |

### axisLineWidth

| Property | Type |
| ---------- | ---------- |
| `axisLineWidth` | `number` |

### majorLineWidth

| Property | Type |
| ---------- | ---------- |
| `majorLineWidth` | `number` |

### minorLineWidth

| Property | Type |
| ---------- | ---------- |
| `minorLineWidth` | `number` |

### axisDashScale

| Property | Type |
| ---------- | ---------- |
| `axisDashScale` | `number` |

### fixedPixelSize

| Property | Type |
| ---------- | ---------- |
| `fixedPixelSize` | `boolean` |

### baseColor

| Property | Type |
| ---------- | ---------- |
| `baseColor` | `[number, number, number, number]` |

### minorColor

| Property | Type |
| ---------- | ---------- |
| `minorColor` | `[number, number, number, number]` |

### majorColor

| Property | Type |
| ---------- | ---------- |
| `majorColor` | `[number, number, number, number]` |

### xAxisColor

| Property | Type |
| ---------- | ---------- |
| `xAxisColor` | `[number, number, number, number]` |

### xAxisDashColor

| Property | Type |
| ---------- | ---------- |
| `xAxisDashColor` | `[number, number, number, number]` |

### yAxisColor

| Property | Type |
| ---------- | ---------- |
| `yAxisColor` | `[number, number, number, number]` |

### yAxisDashColor

| Property | Type |
| ---------- | ---------- |
| `yAxisDashColor` | `[number, number, number, number]` |

### zAxisColor

| Property | Type |
| ---------- | ---------- |
| `zAxisColor` | `[number, number, number, number]` |

### zAxisDashColor

| Property | Type |
| ---------- | ---------- |
| `zAxisDashColor` | `[number, number, number, number]` |

### centerColor

| Property | Type |
| ---------- | ---------- |
| `centerColor` | `[number, number, number, number]` |

# Interfaces

- [GridMaterialOptions](#gridmaterialoptions)

## GridMaterialOptions

Options for creating a GridMaterial.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `plane` | `GridPlane or undefined` |  |
| `adaptiveSpacing` | `boolean or undefined` |  |
| `cellSize` | `number or undefined` |  |
| `majorDivisions` | `number or undefined` |  |
| `axisLineWidth` | `number or undefined` |  |
| `majorLineWidth` | `number or undefined` |  |
| `minorLineWidth` | `number or undefined` |  |
| `axisDashScale` | `number or undefined` |  |
| `fixedPixelSize` | `boolean or undefined` |  |
| `minCellPixelSize` | `number or undefined` |  |
| `baseColor` | `[number, number, number, number] or undefined` |  |
| `minorColor` | `[number, number, number, number] or undefined` |  |
| `majorColor` | `[number, number, number, number] or undefined` |  |
| `xAxisColor` | `[number, number, number, number] or undefined` |  |
| `xAxisDashColor` | `[number, number, number, number] or undefined` |  |
| `yAxisColor` | `[number, number, number, number] or undefined` |  |
| `yAxisDashColor` | `[number, number, number, number] or undefined` |  |
| `zAxisColor` | `[number, number, number, number] or undefined` |  |
| `zAxisDashColor` | `[number, number, number, number] or undefined` |  |
| `centerColor` | `[number, number, number, number] or undefined` |  |


# Types

- [GridPlane](#gridplane)

## GridPlane

Grid plane orientation.

| Type | Type |
| ---------- | ---------- |
| `GridPlane` | `XY" or "XZ" or "YZ` |

