# Grid

<GridExample />

This example shows how to create an infinite 2D grid with adaptive spacing and interactive controls using Vue.js.

## Grid Component

```vue
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { GridObject } from "@arcanvas/feature-2d";

const showGrid = ref(true);
const adaptive = ref(true);
let grid = null;

onMounted(() => {
  // ... init engine ...

  // Create Grid
  grid = new GridObject({
    plane: "XY",
    cellSize: 1,
    majorDivisions: 4,
    adaptiveSpacing: true,
    fixedPixelSize: true,
    minCellPixelSize: 20,
    // Custom colors
    baseColor: [0.1, 0.1, 0.1, 1],
    minorColor: [0.3, 0.3, 0.3, 0.5],
    majorColor: [0.5, 0.5, 0.5, 0.8],
    xAxisColor: [0.8, 0.2, 0.2, 1],
    yAxisColor: [0.2, 0.8, 0.2, 1],
  });
  scene.addObject(grid);
});

// Reactive controls
function toggleGrid() {
  if (grid) grid.visible = showGrid.value;
}

function toggleAdaptive() {
  if (grid) grid.adaptiveSpacing = adaptive.value;
}
</script>

<template>
  <div>
    <div class="controls">
      <label> <input type="checkbox" v-model="showGrid" @change="toggleGrid" /> Show Grid </label>
      <label> <input type="checkbox" v-model="adaptive" @change="toggleAdaptive" /> Adaptive </label>
    </div>
    <canvas ref="canvasRef"></canvas>
  </div>
</template>
```

## Grid Configuration

The `GridObject` supports extensive customization:

```typescript
const grid = new GridObject({
  cellSize: 1, // World units per cell
  majorDivisions: 4, // Major lines every N cells
  adaptiveSpacing: true, // Hide small cells when zoomed out
  minCellPixelSize: 20, // Minimum pixel size for visibility
  axisLineWidth: 2, // Width of X/Y axis lines
});
```
