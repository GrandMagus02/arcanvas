<script setup lang="ts">
import { createCanvasHost, createFrameLoop, type FrameLoop, type CanvasHost } from "@arcanvas/runtime";
import {
  requestAdapter,
  BufferUsage,
  glslVertex,
  glslFragment,
  type GfxDevice,
  type GfxRenderPipeline,
  type GfxBuffer,
  WebGL2RenderPipeline,
} from "@arcanvas/webgl2";
import { SelectionManager, type BoundingBox, type ISelectable } from "@arcanvas/selection";
import { onBeforeUnmount, onMounted, ref } from "vue";

const canvasRef = ref<HTMLCanvasElement | null>(null);

let canvasHost: CanvasHost | null = null;
let frameLoop: FrameLoop | null = null;
let device: GfxDevice | null = null;
let shapePipeline: GfxRenderPipeline | null = null;
let gridPipeline: GfxRenderPipeline | null = null;
let shapeVertexBuffer: GfxBuffer | null = null;
let gridQuadBuffer: GfxBuffer | null = null;
let selectionManager: SelectionManager | null = null;

// Camera state
let cameraX = 0;
let cameraY = 0;
let cameraZoom = 0.5;
let isDragging = false;
let isMovingShape = false;
let lastMouseX = 0;
let lastMouseY = 0;
let draggedShapeId: string | null = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

const selectedCount = ref(0);
const hoverHitId = ref<string | null>(null);
const hoverWorld = ref<{ x: number; y: number } | null>(null);

// Shape data
interface Shape extends ISelectable {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: [number, number, number, number];
  selectedColor: [number, number, number, number];
  selected: boolean;
}

const shapes: Shape[] = [];

// Shape shader
const shapeVertexShader = `#version 300 es
layout(location = 0) in vec2 a_position;
layout(location = 1) in vec4 a_color;

out vec4 v_color;

uniform vec2 u_resolution;
uniform vec2 u_cameraPos;
uniform float u_zoom;

void main() {
  vec2 viewPos = (a_position - u_cameraPos) * u_zoom;
  vec2 clipPos = viewPos / (u_resolution * 0.5);
  clipPos.y = -clipPos.y;
  gl_Position = vec4(clipPos, 0.0, 1.0);
  v_color = a_color;
}
`;

const shapeFragmentShader = `#version 300 es
precision highp float;

in vec4 v_color;
out vec4 fragColor;

void main() {
  fragColor = v_color;
}
`;

// Grid shader
const gridVertexShader = `#version 300 es
layout(location = 0) in vec2 a_position;

out vec2 v_worldPos;

uniform vec2 u_resolution;
uniform vec2 u_cameraPos;
uniform float u_zoom;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  vec2 screenPos = a_position * u_resolution * 0.5;
  v_worldPos = screenPos / u_zoom + u_cameraPos;
}
`;

const gridFragmentShader = `#version 300 es
precision highp float;

in vec2 v_worldPos;
out vec4 fragColor;

uniform float u_cellSize;
uniform float u_zoom;

float gridLine(float coord, float lineWidth) {
  float d = abs(fract(coord - 0.5) - 0.5);
  return smoothstep(lineWidth, 0.0, d);
}

void main() {
  vec3 color = vec3(0.1, 0.1, 0.1);

  // Minor grid lines
  float minorIntensity = gridLine(v_worldPos.x / u_cellSize, 0.01 / u_zoom);
  minorIntensity = max(minorIntensity, gridLine(v_worldPos.y / u_cellSize, 0.01 / u_zoom));
  color = mix(color, vec3(0.3, 0.3, 0.3), minorIntensity * 0.5);

  // Major grid lines
  float majorCell = u_cellSize * 4.0;
  float majorIntensity = gridLine(v_worldPos.x / majorCell, 0.015 / u_zoom);
  majorIntensity = max(majorIntensity, gridLine(v_worldPos.y / majorCell, 0.015 / u_zoom));
  color = mix(color, vec3(0.5, 0.5, 0.5), majorIntensity * 0.8);

  // Axes
  float axisWidth = 2.0 / u_zoom;
  if (abs(v_worldPos.y) < axisWidth) {
    float t = 1.0 - abs(v_worldPos.y) / axisWidth;
    color = mix(color, vec3(0.8, 0.2, 0.2), t * 0.9);
  }
  if (abs(v_worldPos.x) < axisWidth) {
    float t = 1.0 - abs(v_worldPos.x) / axisWidth;
    color = mix(color, vec3(0.2, 0.8, 0.2), t * 0.9);
  }

  fragColor = vec4(color, 1.0);
}
`;

function createShapeSelectable(id: string, x: number, y: number, width: number, height: number, baseColor: [number, number, number, number]): Shape {
  return {
    id,
    x,
    y,
    width,
    height,
    color: baseColor,
    selectedColor: [1, 0.5, 0, 1],
    selected: false,
    getBounds(): BoundingBox {
      const self = this;
      return {
        getCenter: () => ({ x: self.x + self.width / 2, y: self.y + self.height / 2 }),
        contains: (point: { x: number; y: number }) =>
          point.x >= self.x && point.x <= self.x + self.width &&
          point.y >= self.y && point.y <= self.y + self.height,
      };
    },
    isVisible: () => true,
  };
}

function screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
  if (!canvasHost) return { x: 0, y: 0 };
  const centerX = canvasHost.cssWidth / 2;
  const centerY = canvasHost.cssHeight / 2;
  const worldX = (screenX - centerX) / cameraZoom + cameraX;
  const worldY = -(screenY - centerY) / cameraZoom + cameraY;
  return { x: worldX, y: worldY };
}

function hitTestShapes(worldX: number, worldY: number): Shape | null {
  for (let i = shapes.length - 1; i >= 0; i--) {
    const shape = shapes[i]!;
    if (worldX >= shape.x && worldX <= shape.x + shape.width &&
        worldY >= shape.y && worldY <= shape.y + shape.height) {
      return shape;
    }
  }
  return null;
}

function buildShapeVertices(): Float32Array {
  const vertices: number[] = [];

  for (const shape of shapes) {
    const color = shape.selected ? shape.selectedColor : shape.color;
    const [r, g, b, a] = color;
    const { x, y, width, height } = shape;

    // Two triangles for rectangle
    // prettier-ignore
    vertices.push(
      x, y, r, g, b, a,
      x + width, y, r, g, b, a,
      x + width, y + height, r, g, b, a,
      x, y, r, g, b, a,
      x + width, y + height, r, g, b, a,
      x, y + height, r, g, b, a,
    );
  }

  return new Float32Array(vertices);
}

function updateShapeVertexBuffer() {
  if (!device) return;

  shapeVertexBuffer?.destroy();

  const vertices = buildShapeVertices();
  shapeVertexBuffer = device.createBuffer({
    label: "Shape Vertex Buffer",
    size: vertices.byteLength,
    usage: BufferUsage.VERTEX | BufferUsage.COPY_DST,
    mappedAtCreation: true,
  });
  new Float32Array(shapeVertexBuffer.getMappedRange()).set(vertices);
  shapeVertexBuffer.unmap();
}

function handleMouseDown(e: MouseEvent) {
  if (!canvasRef.value) return;

  const rect = canvasRef.value.getBoundingClientRect();
  const screenX = e.clientX - rect.left;
  const screenY = e.clientY - rect.top;
  const world = screenToWorld(screenX, screenY);

  const hitShape = hitTestShapes(world.x, world.y);

  if (hitShape) {
    // Start dragging shape
    isMovingShape = true;
    draggedShapeId = hitShape.id;
    dragOffsetX = world.x - hitShape.x;
    dragOffsetY = world.y - hitShape.y;

    // Select if not already selected
    if (!hitShape.selected && selectionManager) {
      const addToSelection = e.shiftKey || e.metaKey;
      if (!addToSelection) {
        selectionManager.clear();
      }
      selectionManager.select(hitShape.id, true);
    }
  } else {
    // Start panning
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;

    // Clear selection if not shift-clicking
    if (!e.shiftKey && !e.metaKey && selectionManager) {
      selectionManager.clear();
    }
  }
}

function handleMouseMove(e: MouseEvent) {
  if (!canvasRef.value) return;

  const rect = canvasRef.value.getBoundingClientRect();
  const screenX = e.clientX - rect.left;
  const screenY = e.clientY - rect.top;
  const world = screenToWorld(screenX, screenY);

  hoverWorld.value = world;

  const hitShape = hitTestShapes(world.x, world.y);
  hoverHitId.value = hitShape?.id ?? null;

  if (isMovingShape && draggedShapeId) {
    // Move all selected shapes
    const shape = shapes.find(s => s.id === draggedShapeId);
    if (shape) {
      const dx = world.x - dragOffsetX - shape.x;
      const dy = world.y - dragOffsetY - shape.y;

      for (const s of shapes) {
        if (s.selected) {
          s.x += dx;
          s.y += dy;
        }
      }
      updateShapeVertexBuffer();
    }
  } else if (isDragging) {
    const dx = e.clientX - lastMouseX;
    const dy = e.clientY - lastMouseY;
    cameraX -= dx / cameraZoom;
    cameraY += dy / cameraZoom;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  }
}

function handleMouseUp() {
  isDragging = false;
  isMovingShape = false;
  draggedShapeId = null;
}

function handleMouseLeave() {
  hoverHitId.value = null;
  hoverWorld.value = null;
}

function handleWheel(e: WheelEvent) {
  e.preventDefault();
  const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
  cameraZoom = Math.max(0.1, Math.min(10, cameraZoom * zoomFactor));
}

function handleContextMenu(e: Event) {
  e.preventDefault();
}

onMounted(async () => {
  if (!canvasRef.value) return;

  canvasRef.value.addEventListener('mousedown', handleMouseDown);
  canvasRef.value.addEventListener('mousemove', handleMouseMove);
  canvasRef.value.addEventListener('mouseup', handleMouseUp);
  canvasRef.value.addEventListener('mouseleave', handleMouseLeave);
  canvasRef.value.addEventListener('wheel', handleWheel, { passive: false });
  canvasRef.value.addEventListener('contextmenu', handleContextMenu);

  canvasHost = createCanvasHost({
    canvas: canvasRef.value,
    autoResize: true,
    handleDpr: true,
    maxDpr: 2,
  });

  const adapter = await requestAdapter({ canvas: canvasHost.canvas });
  if (!adapter) {
    console.error("WebGL2 not supported");
    return;
  }

  device = await adapter.requestDevice({ label: "SelectionGrid Device" });

  // Create shape pipeline
  const shapeVS = device.createShaderModule({
    label: "Shape Vertex Shader",
    sources: [glslVertex(shapeVertexShader)],
  });

  const shapeFS = device.createShaderModule({
    label: "Shape Fragment Shader",
    sources: [glslFragment(shapeFragmentShader)],
  });

  shapePipeline = device.createRenderPipeline({
    label: "Shape Pipeline",
    layout: "auto",
    vertex: {
      module: shapeVS,
      entryPoint: "main",
      buffers: [{
        arrayStride: 6 * 4,
        attributes: [
          { format: "float32x2", offset: 0, shaderLocation: 0 },
          { format: "float32x4", offset: 2 * 4, shaderLocation: 1 },
        ],
      }],
    },
    fragment: {
      module: shapeFS,
      entryPoint: "main",
      targets: [{ format: "rgba8unorm" }],
    },
    primitive: { topology: "triangle-list" },
  });

  // Create grid pipeline
  const gridVS = device.createShaderModule({
    label: "Grid Vertex Shader",
    sources: [glslVertex(gridVertexShader)],
  });

  const gridFS = device.createShaderModule({
    label: "Grid Fragment Shader",
    sources: [glslFragment(gridFragmentShader)],
  });

  gridPipeline = device.createRenderPipeline({
    label: "Grid Pipeline",
    layout: "auto",
    vertex: {
      module: gridVS,
      entryPoint: "main",
      buffers: [{
        arrayStride: 2 * 4,
        attributes: [
          { format: "float32x2", offset: 0, shaderLocation: 0 },
        ],
      }],
    },
    fragment: {
      module: gridFS,
      entryPoint: "main",
      targets: [{ format: "rgba8unorm" }],
    },
    primitive: { topology: "triangle-list" },
  });

  // Fullscreen quad for grid
  const quadVertices = new Float32Array([
    -1, -1, 1, -1, 1, 1,
    -1, -1, 1, 1, -1, 1,
  ]);

  gridQuadBuffer = device.createBuffer({
    label: "Grid Quad Buffer",
    size: quadVertices.byteLength,
    usage: BufferUsage.VERTEX | BufferUsage.COPY_DST,
    mappedAtCreation: true,
  });
  new Float32Array(gridQuadBuffer.getMappedRange()).set(quadVertices);
  gridQuadBuffer.unmap();

  // Selection manager
  selectionManager = new SelectionManager();
  selectionManager.setMultiSelectEnabled(true);

  selectionManager.setSelectionChangeCallback((event) => {
    selectedCount.value = event.selectedIds.length;

    for (const id of event.addedIds) {
      const shape = shapes.find(s => s.id === id);
      if (shape) shape.selected = true;
    }
    for (const id of event.removedIds) {
      const shape = shapes.find(s => s.id === id);
      if (shape) shape.selected = false;
    }

    updateShapeVertexBuffer();
  });

  // Create shapes (in world units, camera pixelsPerUnit ~ 100 so 1-2 units visible initially)
  const rect1 = createShapeSelectable("rect1", 0, 0, 1.5, 1, [0.2, 0.7, 0.9, 1]);
  const rect2 = createShapeSelectable("rect2", 2, 0.5, 1.5, 1, [0.2, 0.7, 0.9, 1]);
  const tri = createShapeSelectable("triangle", 1, 1.5, 1, 1, [0.9, 0.5, 0.2, 1]);

  shapes.push(rect1, rect2, tri);

  for (const shape of shapes) {
    selectionManager.register(shape);
  }

  updateShapeVertexBuffer();

  // Frame loop
  frameLoop = createFrameLoop();

  frameLoop.onFrame(() => {
    if (!device || !canvasHost) return;

    const gl = (device as unknown as { native: WebGL2RenderingContext }).native;
    gl.viewport(0, 0, canvasHost.width, canvasHost.height);

    const encoder = device.createCommandEncoder({ label: "Frame Encoder" });

    const renderPass = encoder.beginRenderPass({
      colorAttachments: [{
        view: null as unknown as Parameters<typeof encoder.beginRenderPass>[0]["colorAttachments"][0]["view"],
        clearValue: { r: 0.1, g: 0.1, b: 0.1, a: 1.0 },
        loadOp: "clear",
        storeOp: "store",
      }],
    });

    // Render grid
    if (gridPipeline && gridQuadBuffer) {
      renderPass.setPipeline(gridPipeline);
      renderPass.setVertexBuffer(0, gridQuadBuffer);

      const gridProg = (gridPipeline as WebGL2RenderPipeline).program.native;
      gl.uniform2f(gl.getUniformLocation(gridProg, "u_resolution"), canvasHost.cssWidth, canvasHost.cssHeight);
      gl.uniform2f(gl.getUniformLocation(gridProg, "u_cameraPos"), cameraX, cameraY);
      gl.uniform1f(gl.getUniformLocation(gridProg, "u_zoom"), cameraZoom);
      gl.uniform1f(gl.getUniformLocation(gridProg, "u_cellSize"), 1);

      renderPass.draw(6);
    }

    // Render shapes
    if (shapePipeline && shapeVertexBuffer) {
      renderPass.setPipeline(shapePipeline);
      renderPass.setVertexBuffer(0, shapeVertexBuffer);

      const shapeProg = (shapePipeline as WebGL2RenderPipeline).program.native;
      gl.uniform2f(gl.getUniformLocation(shapeProg, "u_resolution"), canvasHost.cssWidth, canvasHost.cssHeight);
      gl.uniform2f(gl.getUniformLocation(shapeProg, "u_cameraPos"), cameraX, cameraY);
      gl.uniform1f(gl.getUniformLocation(shapeProg, "u_zoom"), cameraZoom);

      renderPass.draw(shapes.length * 6);
    }

    renderPass.end();
    device.queue.submit([encoder.finish()]);
  });

  frameLoop.start();
});

onBeforeUnmount(() => {
  if (canvasRef.value) {
    canvasRef.value.removeEventListener('mousedown', handleMouseDown);
    canvasRef.value.removeEventListener('mousemove', handleMouseMove);
    canvasRef.value.removeEventListener('mouseup', handleMouseUp);
    canvasRef.value.removeEventListener('mouseleave', handleMouseLeave);
    canvasRef.value.removeEventListener('wheel', handleWheel);
    canvasRef.value.removeEventListener('contextmenu', handleContextMenu);
  }

  frameLoop?.dispose();
  shapeVertexBuffer?.destroy();
  gridQuadBuffer?.destroy();
  device?.destroy();
  canvasHost?.dispose();
});
</script>

<template>
  <div class="example-wrapper">
    <div class="controls">
      <span class="hint">Click shapes to select; drag to move; drag empty space to pan.</span>
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
  cursor: grab;
}

canvas:active {
  cursor: grabbing;
}
</style>
