# Selection on Grid

<SelectionGridExample />

This example combines a 2D grid (like the [Grid](/examples/grid) example) with **selectable elements** to test how the selection adorner system works: click-to-select, drag-to-move, and resize/rotate via handles. Selection visuals (outline and handles) are rendered as **meshes** via `getAdornerMeshes()` and submitted to the WebGL pipeline.

## What to try

- **Click** a shape to select it (orange outline and handles).
- **Shift+Click** to add/remove from selection (multi-select).
- **Drag** a selected shape to move it.
- **Drag** corner or edge handles to resize; drag the rotation handle (above the box) to rotate.
- **Pan/zoom** the view with the camera (e.g. middle mouse or two-finger drag) — the grid and shapes move together.

## Setup

The example uses:

1. **Grid** — same as the [Grid](/examples/grid) example (adaptive spacing, axis colors).
2. **SelectionManager** — tracks selected IDs and notifies on change (e.g. to update a “Selected: N” UI).
3. **SelectionTool** — uses the **adorner** (Strategy + Decorator): `buildAdornerFor(selection)` returns a single-element or group adorner; the tool calls `getHandles()` for hit-testing, `dragHandle()` on drag, and **`getAdornerMeshes()`** for rendering (outline + handle meshes).
4. **Overlay entity** — each frame, the scene clears an overlay container and adds the current adorner meshes from `getAdornerMeshes()` so they render on top.

## Code sketch

```vue
<script setup lang="ts">
import { GridObject, Polygon2DObject } from "@arcanvas/feature-2d";
import { SelectionManager } from "@arcanvas/selection";
import { SelectionTool } from "@arcanvas/tools";
import { normalizeEvent, InputState } from "@arcanvas/interaction";
import { Entity, Scene } from "@arcanvas/scene";

// Scene + camera + grid (as in Grid example)
const scene = new Scene({ width: 800, height: 600 });
// ... camera, controller, EngineRenderSystem ...

// Grid
const grid = new GridObject({ plane: "XY", cellSize: 1, ... });
scene.addObject(grid);

// Selection
const selectionManager = new SelectionManager();
selectionManager.setMultiSelectEnabled(true);
const selectionTool = new SelectionTool({ camera, selectionManager });

// Selectable shapes (Polygon2DObject has getBounds + transform for adorners)
const rect = new Polygon2DObject([[0,0], [1.5,0], [1.5,1], [0,1]], {}, material);
scene.addObject(rect);
selectionTool.registerSelectable(rect);

// Overlay: adorner meshes rendered each frame
const overlay = new Entity("selection-overlay");
scene.addObject(overlay);

// Pointer events → SelectionTool
canvas.addEventListener("pointerdown", (ev) => {
  const normalized = normalizeEvent(ev, canvas);
  if (normalized) { inputState.update(normalized); selectionTool.handleInput(normalized, inputState); }
});
// ... pointermove, pointerup, pointerleave ...

// Render loop: update overlay with current adorner meshes
function frame() {
  overlay.removeChildren();
  for (const ro of selectionTool.getAdornerMeshes()) overlay.add(ro);
  renderSystem.renderOnce();
  requestAnimationFrame(frame);
}
</script>
```

## Adorner system (recap)

- **Strategy**: `ISelectionAdorner` — per element (or group) defines bounds, handles, and how drag applies (transform vs parametric).
- **Decorator**: Default transform box + optional extras (e.g. `TextExtrasAdorner` for kerning/leading).
- **Composite**: Multiple selected → `GroupAdorner` with one combined box and transform handles.
- **Meshes**: No custom draw; outline and handles come from `getMeshes()` / `getAdornerMeshes()` and are rendered as normal WebGL meshes.
