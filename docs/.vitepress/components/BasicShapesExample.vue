<script setup lang="ts">
import {
    Arcanvas,
    AutoResizePlugin,
    Camera,
    Camera2DController,
    EngineRenderSystem,
} from "@arcanvas/core";
import { Polygon2DObject } from "@arcanvas/feature-2d";
import { Line, Path, UnlitColorMaterial } from "@arcanvas/graphics";
import { Scene } from "@arcanvas/scene";
import { onBeforeUnmount, onMounted, ref } from 'vue';

const canvasRef = ref<HTMLCanvasElement | null>(null);
let arc: Arcanvas | null = null;
let stopLoop = false;

onMounted(() => {
  if (!canvasRef.value) return;

  arc = new Arcanvas(canvasRef.value);
  arc.use(AutoResizePlugin);

  const scene = new Scene({ width: 800, height: 600 });
  const camera = new Camera(arc);
  camera.pixelsPerUnit = 1;
  arc.setCamera(camera);

  const controller = new Camera2DController();
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

  addShapes(scene);

  arc.on("resize", (width, height) => {
    scene.viewport = { width, height };
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

function addShapes(scene: Scene) {
  // Rectangle
  const rectPoints = [[100, 100], [300, 100], [300, 250], [100, 250]];
  const rect = new Polygon2DObject(rectPoints, {}, new UnlitColorMaterial({ baseColor: [0.2, 0.7, 0.9, 1] }));
  scene.addObject(rect);

  // Ellipse
  const ellipsePoints: number[][] = [];
  const cx = 400, cy = 200, rx = 80, ry = 50, segments = 64;
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * 2 * Math.PI;
    ellipsePoints.push([cx + rx * Math.cos(angle), cy + ry * Math.sin(angle)]);
  }
  const ellipse = new Polygon2DObject(ellipsePoints, {}, new UnlitColorMaterial({ baseColor: [0.2, 0.9, 0.4, 1] }));
  scene.addObject(ellipse);

  // Hexagon
  const hexPoints: number[][] = [];
  const hcx = 200, hcy = 350, hr = 60, hsides = 6;
  for (let i = 0; i < hsides; i++) {
    const angle = (i / hsides) * 2 * Math.PI - Math.PI / 2;
    hexPoints.push([hcx + hr * Math.cos(angle), hcy + hr * Math.sin(angle)]);
  }
  const hexagon = new Polygon2DObject(hexPoints, {}, new UnlitColorMaterial({ baseColor: [0.9, 0.5, 0.2, 1] }));
  scene.addObject(hexagon);

  // Line
  const line = new Line(50, 450, 300, 450, new UnlitColorMaterial({ baseColor: [0.6, 0.2, 0.9, 1] }), 10);
  scene.addObject(line);

  // Star (SVG)
  const starPath = "M 50 0 L 61 35 L 98 35 L 68 57 L 79 91 L 50 70 L 21 91 L 32 57 L 2 35 L 39 35 Z";
  const star = new Path(starPath, new UnlitColorMaterial({ baseColor: [0.9, 0.8, 0.2, 1] }));
  star.transform.matrix.translate(450, 320, 0);
  scene.addObject(star);
}
</script>

<template>
  <div class="example-container">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<style scoped>
.example-container {
  width: 100%;
  height: 500px;
  background: #1e1e1e;
  border-radius: 8px;
  overflow: hidden;
}
canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
