<script setup lang="ts">
import {
    Arcanvas,
    AutoResizePlugin,
    Camera,
    Camera2DController,
    EngineRenderSystem,
} from "@arcanvas/core";
import { Scene } from "@arcanvas/scene";
import { onBeforeUnmount, onMounted, ref } from 'vue';

const canvasRef = ref<HTMLCanvasElement | null>(null);
let arc: Arcanvas | null = null;
let stopLoop = false;

onMounted(() => {
  if (!canvasRef.value) return;

  // Initialize Arcanvas
  arc = new Arcanvas(canvasRef.value, {
    rendererOptions: {
      clearColor: [0.1, 0.1, 0.15, 1],
    },
  });
  arc.use(AutoResizePlugin);

  // Scene
  const scene = new Scene({
    width: 800,
    height: 600,
  });

  // Camera
  const camera = new Camera(arc);
  camera.pixelsPerUnit = 1;
  arc.setCamera(camera);

  const controller = new Camera2DController();
  controller.attach(camera);
  controller.enable();

  // Renderer
  const renderSystem = new EngineRenderSystem(canvasRef.value, scene, camera, {
    backend: "webgl",
  });

  // Force initial resize to container size
  const parent = canvasRef.value.parentElement;
  if (parent) {
    const rect = parent.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      arc.resize(rect.width, rect.height);
    }
  }

  // Resize handling
  arc.on("resize", (width, height) => {
    scene.viewport = { width, height };
  });

  // Render loop
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
</script>

<template>
  <div class="example-container">
    <canvas ref="canvasRef"></canvas>
    <div class="overlay">Drag to pan, Scroll to zoom</div>
  </div>
</template>

<style scoped>
.example-container {
  width: 100%;
  height: 400px;
  position: relative;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}
canvas {
  width: 100%;
  height: 100%;
  display: block;
}
.overlay {
  position: absolute;
  bottom: 10px;
  left: 10px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  pointer-events: none;
}
</style>
