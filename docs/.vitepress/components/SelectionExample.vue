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
let pipeline: GfxRenderPipeline | null = null;
let vertexBuffer: GfxBuffer | null = null;
let selectionManager: SelectionManager | null = null;

const selectedCount = ref(0);

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
let rect1Id = "";
let rect2Id = "";

// Shader code
const vertexShaderCode = `#version 300 es
layout(location = 0) in vec2 a_position;
layout(location = 1) in vec4 a_color;

out vec4 v_color;

uniform vec2 u_resolution;

void main() {
  vec2 clipPos = (a_position / u_resolution) * 2.0 - 1.0;
  clipPos.y = -clipPos.y;
  gl_Position = vec4(clipPos, 0.0, 1.0);
  v_color = a_color;
}
`;

const fragmentShaderCode = `#version 300 es
precision highp float;

in vec4 v_color;
out vec4 fragColor;

void main() {
  fragColor = v_color;
}
`;

function createShapeSelectable(id: string, x: number, y: number, width: number, height: number): Shape {
  return {
    id,
    x,
    y,
    width,
    height,
    color: [0.2, 0.7, 0.9, 1],
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

function buildVertices(): Float32Array {
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

onMounted(async () => {
  if (!canvasRef.value) return;

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

  device = await adapter.requestDevice({ label: "Selection Device" });

  // Create shaders
  const vertexShader = device.createShaderModule({
    label: "Selection Vertex Shader",
    sources: [glslVertex(vertexShaderCode)],
  });

  const fragmentShader = device.createShaderModule({
    label: "Selection Fragment Shader",
    sources: [glslFragment(fragmentShaderCode)],
  });

  // Create pipeline
  pipeline = device.createRenderPipeline({
    label: "Selection Pipeline",
    layout: "auto",
    vertex: {
      module: vertexShader,
      entryPoint: "main",
      buffers: [{
        arrayStride: 6 * 4, // pos2 + color4
        attributes: [
          { format: "float32x2", offset: 0, shaderLocation: 0 },
          { format: "float32x4", offset: 2 * 4, shaderLocation: 1 },
        ],
      }],
    },
    fragment: {
      module: fragmentShader,
      entryPoint: "main",
      targets: [{ format: "rgba8unorm" }],
    },
    primitive: { topology: "triangle-list" },
  });

  // Selection manager setup
  selectionManager = new SelectionManager();
  selectionManager.setMultiSelectEnabled(true);

  selectionManager.setSelectionChangeCallback((event) => {
    selectedCount.value = event.selectedIds.length;

    // Update shape selection state
    for (const id of event.addedIds) {
      const shape = shapes.find(s => s.id === id);
      if (shape) shape.selected = true;
    }
    for (const id of event.removedIds) {
      const shape = shapes.find(s => s.id === id);
      if (shape) shape.selected = false;
    }

    // Rebuild vertices with new colors
    updateVertexBuffer();
  });

  // Create shapes
  const shape1 = createShapeSelectable("rect1", 100, 100, 150, 100);
  const shape2 = createShapeSelectable("rect2", 300, 150, 150, 100);
  shapes.push(shape1, shape2);
  rect1Id = shape1.id;
  rect2Id = shape2.id;

  selectionManager.register(shape1);
  selectionManager.register(shape2);

  // Create initial vertex buffer
  updateVertexBuffer();

  // Frame loop
  frameLoop = createFrameLoop();

  frameLoop.onFrame(() => {
    if (!device || !pipeline || !vertexBuffer || !canvasHost) return;

    const gl = (device as unknown as { native: WebGL2RenderingContext }).native;
    gl.viewport(0, 0, canvasHost.width, canvasHost.height);

    const encoder = device.createCommandEncoder({ label: "Frame Encoder" });

    const renderPass = encoder.beginRenderPass({
      colorAttachments: [{
        view: null as unknown as Parameters<typeof encoder.beginRenderPass>[0]["colorAttachments"][0]["view"],
        clearValue: { r: 0.12, g: 0.12, b: 0.12, a: 1.0 },
        loadOp: "clear",
        storeOp: "store",
      }],
    });

    renderPass.setPipeline(pipeline);
    renderPass.setVertexBuffer(0, vertexBuffer);

    // Set resolution uniform
    const program = (pipeline as WebGL2RenderPipeline).program.native;
    gl.uniform2f(gl.getUniformLocation(program, "u_resolution"), canvasHost.cssWidth, canvasHost.cssHeight);

    renderPass.draw(shapes.length * 6); // 6 vertices per rectangle
    renderPass.end();

    device.queue.submit([encoder.finish()]);
  });

  frameLoop.start();
});

function updateVertexBuffer() {
  if (!device) return;

  vertexBuffer?.destroy();

  const vertices = buildVertices();
  vertexBuffer = device.createBuffer({
    label: "Shape Vertex Buffer",
    size: vertices.byteLength,
    usage: BufferUsage.VERTEX | BufferUsage.COPY_DST,
    mappedAtCreation: true,
  });
  new Float32Array(vertexBuffer.getMappedRange()).set(vertices);
  vertexBuffer.unmap();
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
  frameLoop?.dispose();
  vertexBuffer?.destroy();
  device?.destroy();
  canvasHost?.dispose();
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
