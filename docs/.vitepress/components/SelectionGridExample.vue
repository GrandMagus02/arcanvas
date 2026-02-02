<script setup lang="ts">
import {
  Arcanvas,
  AutoResizePlugin,
  Camera,
  Camera2DController,
  EngineRenderSystem,
} from "@arcanvas/core";
import { GridObject, HitTest2D, Polygon2DObject } from "@arcanvas/feature-2d";
import { UnlitColorMaterial } from "@arcanvas/graphics";
import { InputState, ModifierKey, normalizeEvent } from "@arcanvas/interaction";
import { Entity, Scene } from "@arcanvas/scene";
import { SelectionManager } from "@arcanvas/selection";
import { SelectionTool } from "@arcanvas/tools";
import { onBeforeUnmount, onMounted, ref } from "vue";

const canvasRef = ref<HTMLCanvasElement | null>(null);
let arc: Arcanvas | null = null;
let stopLoop = false;
let scene: Scene | null = null;
let camera: Camera | null = null;
let selectionTool: SelectionTool | null = null;
let overlay: Entity | null = null;
const inputState = new InputState();

const selectedCount = ref(0);
const hoverHitId = ref<string | null>(null);
const hoverWorld = ref<{ x: number; y: number } | null>(null);
const selectablesList: Polygon2DObject[] = [];
let selectionConsumed = false; // set on pointerdown when we hit a shape, so we prevent mousedown from starting pan

onMounted(() => {
  if (!canvasRef.value) return;

  arc = new Arcanvas(canvasRef.value);
  arc.use(AutoResizePlugin);

  scene = new Scene({ width: 800, height: 600 });
  camera = new Camera(arc);
  camera.pixelsPerUnit = 100;
  arc.setCamera(camera);

  const controller = new Camera2DController();
  controller.zoom = 0.5;
  controller.attach(camera);
  controller.enable();

  const renderSystem = new EngineRenderSystem(canvasRef.value, scene, camera, { backend: "webgl" });

  const parent = canvasRef.value.parentElement;
  if (parent) {
    const rect = parent.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      arc.resize(rect.width, rect.height);
    }
  }

  // Grid (like GridExample)
  const grid = new GridObject({
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

  const selectionManager = new SelectionManager();
  selectionManager.setMultiSelectEnabled(true);
  selectionManager.setSelectionChangeCallback((event) => {
    selectedCount.value = event.selectedIds.length;
  });

  selectionTool = new SelectionTool({ camera, selectionManager });
  selectionTool.setCamera(camera);

  // Selectable polygons (world units; camera pixelsPerUnit = 100 so ~2–4 units visible)
  const rect1 = new Polygon2DObject(
    [[0, 0], [1.5, 0], [1.5, 1], [0, 1]],
    {},
    new UnlitColorMaterial({ baseColor: [0.2, 0.7, 0.9, 1] })
  );
  scene.addObject(rect1);
  selectionTool.registerSelectable(rect1);
  selectablesList.push(rect1);

  const rect2 = new Polygon2DObject(
    [[2, 0.5], [3.5, 0.5], [3.5, 1.5], [2, 1.5]],
    {},
    new UnlitColorMaterial({ baseColor: [0.2, 0.7, 0.9, 1] })
  );
  scene.addObject(rect2);
  selectionTool.registerSelectable(rect2);
  selectablesList.push(rect2);

  const tri = new Polygon2DObject(
    [[1, 1.5], [2, 2.5], [2, 1.5]],
    {},
    new UnlitColorMaterial({ baseColor: [0.9, 0.5, 0.2, 1] })
  );
  scene.addObject(tri);
  selectionTool.registerSelectable(tri);
  selectablesList.push(tri);

  // Overlay entity: each frame we replace its children with adorner meshes
  overlay = new Entity("selection-overlay");
  scene.addObject(overlay);

  // Hit test on every pointermove for header display
  function hitTestAt(screenPoint: { x: number; y: number }): { id: string; world: { x: number; y: number } } | null {
    if (!camera) return null;
    const world = HitTest2D.screenToWorld(screenPoint, camera);
    for (let i = selectablesList.length - 1; i >= 0; i--) {
      const poly = selectablesList[i]!;
      if (!poly.isVisible()) continue;
      if (HitTest2D.hitTestPolygon(screenPoint, poly, poly.transform, camera)) {
        return { id: poly.id, world };
      }
    }
    return null;
  }

  // Wire pointer events: use capture so we run before Camera2DController (selection wins over pan)
  function onPointer(ev: Event) {
    if (!canvasRef.value || !selectionTool || !camera) return;
    const normalized = normalizeEvent(ev, canvasRef.value);
    if (!normalized) return;
    const screenPoint = { x: normalized.position.x, y: normalized.position.y };

    if (normalized.type === "pointermove" || normalized.type === "mousemove") {
      const hit = hitTestAt(screenPoint);
      hoverHitId.value = hit?.id ?? null;
      hoverWorld.value = hit ? hit.world : HitTest2D.screenToWorld(screenPoint, camera);
    }

    if (normalized.type === "pointerleave" || normalized.type === "mouseleave") {
      hoverHitId.value = null;
      hoverWorld.value = null;
    }

    if (normalized.type === "pointerdown" || normalized.type === "mousedown") {
      if (normalized.buttons.length > 0) {
        const hit = hitTestAt(screenPoint);
        if (hit) {
          selectionConsumed = true;
          selectionTool.setPointerDownHit(hit.id);
          const addToSelection =
            normalized.modifiers.includes(ModifierKey.Shift) || normalized.modifiers.includes(ModifierKey.Meta);

          // Only change selection if not already selected, or if using multi-select modifiers
          if (addToSelection || !selectionManager.isSelected(hit.id)) {
            selectionManager.select(hit.id, addToSelection);
          }
        } else {
          selectionTool.setPointerDownHit(null);
          if (
            !normalized.modifiers.includes(ModifierKey.Shift) &&
            !normalized.modifiers.includes(ModifierKey.Meta)
          ) {
            selectionManager.clear();
          }
        }
      }
    }
    if (normalized.type === "pointerup" || normalized.type === "pointercancel" || normalized.type === "mouseup") {
      selectionConsumed = false;
    }

    inputState.update(normalized);
    // Feed all events to the tool. The tool now handles duplicate mouse events internally
    // and implements a drag threshold to allow both selection and dragging.
    selectionTool.handleInput(normalized, inputState);
  }

  // Swallow mouse events when we're doing selection (controller uses mousedown/move/up for pan)
  function onMouseCapture(ev: Event) {
    if (selectionConsumed) {
      ev.preventDefault();
      ev.stopPropagation();
      if (ev.type === "mouseup" || ev.type === "mouseleave") {
        selectionConsumed = false;
      }
    }
  }

  const useCapture = true;
  // Pointer events (primary)
  canvasRef.value.addEventListener("pointerdown", onPointer, { passive: false, capture: useCapture });
  canvasRef.value.addEventListener("pointermove", onPointer, { passive: false, capture: useCapture });
  canvasRef.value.addEventListener("pointerup", onPointer, { passive: false, capture: useCapture });
  canvasRef.value.addEventListener("pointercancel", onPointer, { passive: false, capture: useCapture });
  canvasRef.value.addEventListener("pointerleave", onPointer, { passive: false, capture: useCapture });
  // Mouse events (fallback and for blocking camera pan)
  canvasRef.value.addEventListener("mousedown", onPointer, { passive: false, capture: useCapture });
  canvasRef.value.addEventListener("mousemove", onPointer, { passive: false, capture: useCapture });
  canvasRef.value.addEventListener("mouseup", onPointer, { passive: false, capture: useCapture });
  canvasRef.value.addEventListener("mouseleave", onPointer, { passive: false, capture: useCapture });
  // Mouse capture for blocking camera pan when selection is active
  canvasRef.value.addEventListener("mousedown", onMouseCapture, { passive: false, capture: useCapture });
  canvasRef.value.addEventListener("mousemove", onMouseCapture, { passive: false, capture: useCapture });
  canvasRef.value.addEventListener("mouseup", onMouseCapture, { passive: false, capture: useCapture });
  canvasRef.value.addEventListener("mouseleave", onMouseCapture, { passive: false, capture: useCapture });
  canvasRef.value.addEventListener("contextmenu", (e) => e.preventDefault(), { passive: false });

  arc.on("resize", (width, height) => {
    if (scene) scene.viewport = { width, height };
  });

  const frame = () => {
    if (stopLoop) return;
    if (overlay && selectionTool) {
      overlay.removeChildren();
      const meshes = selectionTool.getAdornerMeshes();
      for (const ro of meshes) {
        overlay.add(ro);
      }
    }
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
  <div class="example-wrapper">
    <div class="controls">
      <span class="hint">Click shapes to select; drag to move; drag handles to resize/rotate.</span>
      <span>Selected: {{ selectedCount }}</span>
      <span class="hover-info">
        Hover: {{ hoverHitId ?? 'none' }}
        <template v-if="hoverWorld"> · World: ({{ hoverWorld.x.toFixed(2) }}, {{ hoverWorld.y.toFixed(2) }})</template>
      </span>
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
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
  border-bottom: 1px solid #333;
}

.hint {
  color: #888;
  font-size: 0.9em;
}

.hover-info {
  color: #aaa;
  font-size: 0.85em;
  font-family: ui-monospace, monospace;
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
