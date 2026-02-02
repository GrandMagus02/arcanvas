# Selection

<SelectionExample />

This example demonstrates how to implement object selection in Arcanvas using Vue.js.

## Selection Setup

```vue
<script setup lang="ts">
import { SelectionManager } from "@arcanvas/selection";
import { HandleRenderer2D, PhotoshopHandleStyle2D } from "@arcanvas/feature-2d";
import { Polygon2DObject } from "@arcanvas/feature-2d";

// State
const selectedCount = ref(0);
let selectionManager = null;

onMounted(() => {
  // ... init engine ...

  // 1. Initialize Selection Manager
  selectionManager = new SelectionManager();
  selectionManager.setMultiSelectEnabled(true);

  // 2. Setup Handle Renderer (visuals)
  const handleRenderer = new HandleRenderer2D(scene);
  handleRenderer.setStyle(new PhotoshopHandleStyle2D());

  // 3. Listen for changes
  selectionManager.setSelectionChangeCallback((event) => {
    selectedCount.value = event.selectedIds.length;

    // Update highlights
    event.addedIds.forEach(id => highlightObject(id, true));
    event.removedIds.forEach(id => highlightObject(id, false));

    // Update handles
    const selectedObjects = selectionManager.getSelected();
    handleRenderer.attach(selectedObjects);
  });

  // 4. Register objects
  const rect = new Polygon2DObject(...);
  scene.addObject(rect);
  selectionManager.register(rect);
});

// Helper to change color
function highlightObject(id, isSelected) {
  const obj = selectionManager.getSelectable(id);
  if (obj) {
    obj.material.baseColor = isSelected ? [1, 0.5, 0, 1] : [0.2, 0.7, 0.9, 1];
  }
}

// Select via ID (e.g. from UI)
function selectObject(id) {
  selectionManager.select(id, true); // true = append to selection
}
</script>
```

## Interaction

To implement click-to-select, you would typically use a hit-testing utility (coming soon to core) or a simple raycaster. For this example, we use UI buttons to trigger selection via ID.

```typescript
// Example manual selection
selectionManager.select(object.id);
selectionManager.deselect(object.id);
selectionManager.clear();
```
