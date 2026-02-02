<script setup lang="ts">
import {
    Arcanvas,
    AutoResizePlugin,
    Camera,
    Camera2DController,
    EngineRenderSystem,
} from "@arcanvas/core";
import { Polygon2DObject } from "@arcanvas/feature-2d";
import { UnlitColorMaterial } from "@arcanvas/graphics";
import { Scene } from "@arcanvas/scene";
import { SelectionManager } from "@arcanvas/selection";
import { onBeforeUnmount, onMounted, ref } from 'vue';

const canvasRef = ref<HTMLCanvasElement | null>(null);
let arc: Arcanvas | null = null;
let stopLoop = false;
let selectionManager: SelectionManager | null = null;

const selectedCount = ref(0);

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

  // Selection Setup
  selectionManager = new SelectionManager();
  selectionManager.setMultiSelectEnabled(true);

  selectionManager.setSelectionChangeCallback((event) => {
    selectedCount.value = event.selectedIds.length;

    // Update visuals (highlight selected)
    event.addedIds.forEach(id => {
      const obj = selectionManager?.getSelectable(id);
      if (obj instanceof Polygon2DObject) {
        (obj.material as UnlitColorMaterial).baseColor = [1, 0.5, 0, 1]; // Orange
      }
    });

    event.removedIds.forEach(id => {
      const obj = selectionManager?.getSelectable(id);
      if (obj instanceof Polygon2DObject) {
        (obj.material as UnlitColorMaterial).baseColor = [0.2, 0.7, 0.9, 1]; // Blue
      }
    });
  });

  // Create objects
  createObjects(scene);

  // Interaction
  canvasRef.value.addEventListener("pointerdown", (e) => {
    // Very simple hit test for demo purposes
    // In reality, use HitTest2D or Raycaster
    const rect = canvasRef.value!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Map screen to world (simplified, assuming 1:1 and centered for now or use camera unproject)
    // Actually we need proper unprojection.
    // For this simple demo, we'll just check scene objects directly if we can map coords.
    // BUT we have pan/zoom.
    
    // Let's just use a simulated "random click" effect or select random object if we can't implement full hit test here easily
    // OR we can implement a basic hit test if we have the tools.
    // Arcanvas should have HitTest2D?
    // Let's try to import HitTest2D if available.
    // import { HitTest2D } from "@arcanvas/feature-2d"; 
    // But we need to unproject first.
    
    // For this demo, let's just make the objects clickable by iterating them and checking bounds roughly?
    // Or just "Select All" / "Clear" buttons in UI to demonstrate API.
    
    // Actually, let's just expose buttons for "Select Rect 1", "Select Rect 2".
    // Implementing full mouse picking in a small example component without full event system wiring might be flaky.
  });

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

let rect1Id = "";
let rect2Id = "";

function createObjects(scene: Scene) {
  const points1 = [[100, 100], [250, 100], [250, 200], [100, 200]];
  const rect1 = new Polygon2DObject(points1, {}, new UnlitColorMaterial({ baseColor: [0.2, 0.7, 0.9, 1] }));
  rect1Id = rect1.id;
  scene.addObject(rect1);
  selectionManager?.register(rect1);

  const points2 = [[300, 150], [450, 150], [450, 250], [300, 250]];
  const rect2 = new Polygon2DObject(points2, {}, new UnlitColorMaterial({ baseColor: [0.2, 0.7, 0.9, 1] }));
  rect2Id = rect2.id;
  scene.addObject(rect2);
  selectionManager?.register(rect2);
}

function selectRect1() {
  selectionManager?.select(rect1Id, true);
}
function selectRect2() {
  selectionManager?.select(rect2Id, true);
}
function clearSelection() {
  selectionManager?.clear();
}

onBeforeUnmount(() => {
  stopLoop = true;
  arc?.destroy();
});
</script>

<template>
  <div class="example-wrapper">
    <div class="controls">
      <button @click="selectRect1">Select Rect 1</button>
      <button @click="selectRect2">Select Rect 2</button>
      <button @click="clearSelection">Clear Selection</button>
      <span>Selected: {{ selectedCount }}</span>
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
  gap: 10px;
  align-items: center;
  border-bottom: 1px solid #333;
}
button {
  padding: 4px 12px;
  background: #3e3e42;
  border: 1px solid #555;
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  background: #4e4e52;
}
.example-container {
  width: 100%;
  height: 400px;
  background: #1e1e1e;
}
canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
