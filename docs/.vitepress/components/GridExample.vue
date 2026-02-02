<script setup lang="ts">
import {
  Arcanvas,
  AutoResizePlugin,
  Camera,
  Camera2DController,
  EngineRenderSystem,
} from "@arcanvas/core";
import { GridObject } from "@arcanvas/feature-2d";
import { Scene } from "@arcanvas/scene";
import { onBeforeUnmount, onMounted, ref } from 'vue';

const canvasRef = ref<HTMLCanvasElement | null>(null);
let arc: Arcanvas | null = null;
let stopLoop = false;
let grid: GridObject | null = null;
let scene: Scene | null = null;

// Controls
const showGrid = ref(true);
const adaptive = ref(true);

onMounted(() => {
  if (!canvasRef.value) return;

  arc = new Arcanvas(canvasRef.value);
  arc.use(AutoResizePlugin);

  scene = new Scene({ width: 800, height: 600 });
  const camera = new Camera(arc);
  camera.pixelsPerUnit = 100;
  arc.setCamera(camera);

  const controller = new Camera2DController();
  controller.zoom = 0.5;
  controller.attach(camera);
  controller.enable();

  const renderSystem = new EngineRenderSystem(canvasRef.value, scene, camera, { backend: "webgl" });

  // Force initial resize to container size
  const parent = canvasRef.value.parentElement;
  if (parent) {
    const rect = parent.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      arc.resize(rect.width, rect.height);
    }
  }

  // Create grid
  grid = new GridObject({
    plane: "XY",
    cellSize: 1,
    majorDivisions: 4,
    adaptiveSpacing: true,
    fixedPixelSize: true,
    minCellPixelSize: 20,
    baseColor: [0.1, 0.1, 0.1, 1],
    minorColor: [0.3, 0.3, 0.3, 0.5],
    majorColor: [0.5, 0.5, 0.5, 0.8],
    xAxisColor: [0.8, 0.2, 0.2, 1],
    yAxisColor: [0.2, 0.8, 0.2, 1],
  });
  scene.addObject(grid);

  arc.on("resize", (width, height) => {
    if (scene) scene.viewport = { width, height };
  });

  const frame = () => {
    if (stopLoop) return;
    renderSystem.renderOnce();
    requestAnimationFrame(frame);
  };
  frame();
});

onBeforeUnmount(() => {
  stopLoop = true;
  arc?.destroy();
});

function toggleGrid() {
  if (!scene || !grid) return;
  if (scene.contains(grid)) {
    scene.removeChild(grid);
  } else {
    scene.addObject(grid);
  }
}

function toggleAdaptive() {
  if (grid) {
    grid.setAdaptiveSpacing(adaptive.value);
  }
}
</script>

<template>
  <div class="example-wrapper">
    <div class="controls">
      <label>
        <input type="checkbox" v-model="showGrid" @change="toggleGrid"> Show Grid
      </label>
      <label>
        <input type="checkbox" v-model="adaptive" @change="toggleAdaptive"> Adaptive Spacing
      </label>
    </div>
    <div class="example-container">
      <canvas ref="canvasRef"></canvas>
    </div>
  </div>
</template>

<style scoped>
.example-wrapper {
  border: 1px solid #333;
  border-radius: 8px;
  overflow: hidden;
}

.controls {
  padding: 10px;
  background: #252529;
  display: flex;
  gap: 20px;
  border-bottom: 1px solid #333;
}

.example-container {
  width: 100%;
  height: 400px;
  background: #1e1e1e;
  position: relative;
}

canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
