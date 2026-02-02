# Getting Started

<GettingStartedExample />

This example shows how to initialize Arcanvas and render a basic scene using Vue.js.

## Minimal Setup

```vue
<script setup lang="ts">
import { onMounted, ref, onBeforeUnmount } from "vue";
import { Arcanvas, AutoResizePlugin, Camera, EngineRenderSystem } from "@arcanvas/core";
import { Scene } from "@arcanvas/scene";

const canvasRef = ref<HTMLCanvasElement | null>(null);
let arc: Arcanvas | null = null;

onMounted(() => {
  if (!canvasRef.value) return;

  // Initialize Arcanvas
  arc = new Arcanvas(canvasRef.value, {
    rendererOptions: {
      clearColor: [0.1, 0.1, 0.15, 1],
    },
  });
  arc.use(AutoResizePlugin);

  // Create Scene
  const scene = new Scene({ width: 800, height: 600 });

  // Setup Camera
  const camera = new Camera(arc);
  camera.pixelsPerUnit = 1;
  arc.setCamera(camera);

  // Setup Renderer
  const renderSystem = new EngineRenderSystem(canvasRef.value, scene, camera, {
    backend: "webgl",
  });

  // Handle Resize
  arc.on("resize", (width, height) => {
    scene.viewport = { width, height };
  });

  // Render Loop
  const frame = () => {
    renderSystem.renderOnce();
    requestAnimationFrame(frame);
  };
  frame();
});

onBeforeUnmount(() => {
  arc?.destroy();
});
</script>

<template>
  <canvas ref="canvasRef"></canvas>
</template>

<style scoped>
canvas {
  width: 100%;
  height: 100vh;
  display: block;
}
</style>
```

## Adding Camera Controls

To enable pan and zoom, use the `Camera2DController`:

```typescript
import { Camera2DController } from "@arcanvas/core";

// Inside onMounted:
const controller = new Camera2DController();
controller.attach(camera);
controller.enable();
```

## Next Steps

- [Basic Shapes](./basic-shapes)
- [Grid](./grid)
