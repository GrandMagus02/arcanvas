# Basic Shapes

<BasicShapesExample />

This example shows how to draw 2D shapes using Arcanvas in a Vue component.

## Component Setup

```vue
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Arcanvas, ... } from "@arcanvas/core";
import { Polygon2DObject } from "@arcanvas/feature-2d";
import { UnlitColorMaterial } from "@arcanvas/graphics";

const canvasRef = ref(null);

onMounted(() => {
  // Initialize engine...

  // Add shapes
  addShapes(scene);
});

function addShapes(scene) {
  // Rectangle
  const rect = new Polygon2DObject(
    [[100, 100], [300, 100], [300, 250], [100, 250]],
    {},
    new UnlitColorMaterial({ baseColor: [0.2, 0.7, 0.9, 1] })
  );
  scene.addObject(rect);

  // Ellipse (approximated)
  const ellipsePoints = [];
  for (let i = 0; i < 64; i++) {
    const angle = (i / 64) * 2 * Math.PI;
    ellipsePoints.push([
      400 + 80 * Math.cos(angle),
      200 + 50 * Math.sin(angle)
    ]);
  }
  const ellipse = new Polygon2DObject(
    ellipsePoints,
    {},
    new UnlitColorMaterial({ baseColor: [0.2, 0.9, 0.4, 1] })
  );
  scene.addObject(ellipse);
}
</script>

<template>
  <canvas ref="canvasRef"></canvas>
</template>
```

## Creating Different Shapes

### Rectangle

```typescript
const rect = new Polygon2DObject(
  [
    [x, y],
    [x + w, y],
    [x + w, y + h],
    [x, y + h],
  ],
  {},
  material
);
```

### Regular Polygon

```typescript
const points = [];
const sides = 6;
for (let i = 0; i < sides; i++) {
  const angle = (i / sides) * 2 * Math.PI;
  points.push([cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)]);
}
const hexagon = new Polygon2DObject(points, {}, material);
```

### SVG Path

```typescript
import { Path } from "@arcanvas/graphics";

const starPath = "M 50 0 L 61 35 ... Z";
const star = new Path(starPath, material);
star.transform.matrix.translate(450, 320, 0);
scene.addObject(star);
```
