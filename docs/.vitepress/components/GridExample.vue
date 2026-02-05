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
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

const canvasRef = ref<HTMLCanvasElement | null>(null);

let canvasHost: CanvasHost | null = null;
let frameLoop: FrameLoop | null = null;
let device: GfxDevice | null = null;
let gridPipeline: GfxRenderPipeline | null = null;
let quadBuffer: GfxBuffer | null = null;

// Controls
const showGrid = ref(true);
const showAxes = ref(true);
const cellSize = ref(50);

// Camera state (pan/zoom)
let cameraX = 0;
let cameraY = 0;
let cameraZoom = 1;
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;

// Grid shader - renders infinite grid with fade
const vertexShaderCode = `#version 300 es
layout(location = 0) in vec2 a_position;

out vec2 v_worldPos;

uniform vec2 u_resolution;
uniform vec2 u_cameraPos;
uniform float u_zoom;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);

  // Convert from clip space to world space
  vec2 screenPos = a_position * u_resolution * 0.5;
  v_worldPos = screenPos / u_zoom + u_cameraPos;
}
`;

const fragmentShaderCode = `#version 300 es
precision highp float;

in vec2 v_worldPos;
out vec4 fragColor;

uniform float u_cellSize;
uniform float u_zoom;
uniform bool u_showGrid;
uniform bool u_showAxes;

float gridLine(float coord, float lineWidth) {
  float d = abs(fract(coord - 0.5) - 0.5);
  return smoothstep(lineWidth, 0.0, d);
}

void main() {
  vec3 color = vec3(0.1, 0.1, 0.12);

  if (u_showGrid) {
    // Calculate adaptive cell size based on zoom
    float adaptiveCell = u_cellSize;
    float zoomLevel = u_zoom;

    // Minor grid lines
    float minorIntensity = gridLine(v_worldPos.x / adaptiveCell, 0.01 / zoomLevel);
    minorIntensity = max(minorIntensity, gridLine(v_worldPos.y / adaptiveCell, 0.01 / zoomLevel));
    color = mix(color, vec3(0.2, 0.2, 0.25), minorIntensity * 0.5);

    // Major grid lines (every 4 cells)
    float majorCell = adaptiveCell * 4.0;
    float majorIntensity = gridLine(v_worldPos.x / majorCell, 0.015 / zoomLevel);
    majorIntensity = max(majorIntensity, gridLine(v_worldPos.y / majorCell, 0.015 / zoomLevel));
    color = mix(color, vec3(0.35, 0.35, 0.4), majorIntensity * 0.7);
  }

  if (u_showAxes) {
    // X axis (red)
    float axisWidth = 2.0 / u_zoom;
    if (abs(v_worldPos.y) < axisWidth) {
      float t = 1.0 - abs(v_worldPos.y) / axisWidth;
      color = mix(color, vec3(0.8, 0.2, 0.2), t * 0.9);
    }

    // Y axis (green)
    if (abs(v_worldPos.x) < axisWidth) {
      float t = 1.0 - abs(v_worldPos.x) / axisWidth;
      color = mix(color, vec3(0.2, 0.8, 0.2), t * 0.9);
    }
  }

  fragColor = vec4(color, 1.0);
}
`;

function handleMouseDown(e: MouseEvent) {
  isDragging = true;
  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
}

function handleMouseMove(e: MouseEvent) {
  if (!isDragging) return;

  const dx = e.clientX - lastMouseX;
  const dy = e.clientY - lastMouseY;

  cameraX -= dx / cameraZoom;
  cameraY += dy / cameraZoom; // Note: Y is flipped in our coordinate system

  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
}

function handleMouseUp() {
  isDragging = false;
}

function handleWheel(e: WheelEvent) {
  e.preventDefault();

  const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
  cameraZoom = Math.max(0.1, Math.min(10, cameraZoom * zoomFactor));
}

onMounted(async () => {
  if (!canvasRef.value) return;

  // Set up mouse handlers
  canvasRef.value.addEventListener('mousedown', handleMouseDown);
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseup', handleMouseUp);
  canvasRef.value.addEventListener('wheel', handleWheel, { passive: false });

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

  device = await adapter.requestDevice({ label: "Grid Device" });
  const gl = (device as unknown as { native: WebGL2RenderingContext }).native;

  // Create shaders
  const vertexShader = device.createShaderModule({
    label: "Grid Vertex Shader",
    sources: [glslVertex(vertexShaderCode)],
  });

  const fragmentShader = device.createShaderModule({
    label: "Grid Fragment Shader",
    sources: [glslFragment(fragmentShaderCode)],
  });

  // Fullscreen quad vertices
  // prettier-ignore
  const quadVertices = new Float32Array([
    -1, -1,
     1, -1,
     1,  1,
    -1, -1,
     1,  1,
    -1,  1,
  ]);

  quadBuffer = device.createBuffer({
    label: "Quad Vertex Buffer",
    size: quadVertices.byteLength,
    usage: BufferUsage.VERTEX | BufferUsage.COPY_DST,
    mappedAtCreation: true,
  });

  new Float32Array(quadBuffer.getMappedRange()).set(quadVertices);
  quadBuffer.unmap();

  // Create render pipeline
  gridPipeline = device.createRenderPipeline({
    label: "Grid Pipeline",
    layout: "auto",
    vertex: {
      module: vertexShader,
      entryPoint: "main",
      buffers: [{
        arrayStride: 2 * 4,
        attributes: [
          { format: "float32x2", offset: 0, shaderLocation: 0 },
        ],
      }],
    },
    fragment: {
      module: fragmentShader,
      entryPoint: "main",
      targets: [{ format: "rgba8unorm" }],
    },
    primitive: {
      topology: "triangle-list",
    },
  });

  // Frame loop
  frameLoop = createFrameLoop();

  frameLoop.onFrame(() => {
    if (!device || !gridPipeline || !quadBuffer || !canvasHost) return;

    // Update viewport
    gl.viewport(0, 0, canvasHost.width, canvasHost.height);

    const encoder = device.createCommandEncoder({ label: "Frame Encoder" });

    const renderPass = encoder.beginRenderPass({
      colorAttachments: [{
        view: null as unknown as Parameters<typeof encoder.beginRenderPass>[0]["colorAttachments"][0]["view"],
        clearValue: { r: 0.1, g: 0.1, b: 0.12, a: 1.0 },
        loadOp: "clear",
        storeOp: "store",
      }],
    });

    renderPass.setPipeline(gridPipeline);
    renderPass.setVertexBuffer(0, quadBuffer);

    // Set uniforms directly via WebGL2 (since we're using regular uniforms, not UBOs)
    const webgl2Pipeline = gridPipeline as WebGL2RenderPipeline;
    const program = webgl2Pipeline.program.native;
    gl.uniform2f(gl.getUniformLocation(program, "u_resolution"), canvasHost.cssWidth, canvasHost.cssHeight);
    gl.uniform2f(gl.getUniformLocation(program, "u_cameraPos"), cameraX, cameraY);
    gl.uniform1f(gl.getUniformLocation(program, "u_zoom"), cameraZoom);
    gl.uniform1f(gl.getUniformLocation(program, "u_cellSize"), cellSize.value);
    gl.uniform1i(gl.getUniformLocation(program, "u_showGrid"), showGrid.value ? 1 : 0);
    gl.uniform1i(gl.getUniformLocation(program, "u_showAxes"), showAxes.value ? 1 : 0);

    renderPass.draw(6);
    renderPass.end();

    device.queue.submit([encoder.finish()]);
  });

  frameLoop.start();
});

onBeforeUnmount(() => {
  if (canvasRef.value) {
    canvasRef.value.removeEventListener('mousedown', handleMouseDown);
    canvasRef.value.removeEventListener('wheel', handleWheel);
  }
  window.removeEventListener('mousemove', handleMouseMove);
  window.removeEventListener('mouseup', handleMouseUp);

  frameLoop?.dispose();
  quadBuffer?.destroy();
  device?.destroy();
  canvasHost?.dispose();
});

// Watch for control changes
watch([showGrid, showAxes, cellSize], () => {
  // Values are used in frame loop via refs
});
</script>

<template>
  <div class="example-wrapper">
    <div class="controls">
      <label>
        <input type="checkbox" v-model="showGrid"> Show Grid
      </label>
      <label>
        <input type="checkbox" v-model="showAxes"> Show Axes
      </label>
      <label>
        Cell Size: {{ cellSize }}
        <input type="range" v-model.number="cellSize" min="10" max="100" step="5">
      </label>
    </div>
    <div class="example-container">
      <canvas ref="canvasRef"></canvas>
      <div class="overlay">Drag to pan, Scroll to zoom</div>
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
  flex-wrap: wrap;
  align-items: center;
  border-bottom: 1px solid #333;
}

.controls label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #ccc;
}

.controls input[type="range"] {
  width: 100px;
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

.overlay {
  position: absolute;
  bottom: 10px;
  left: 10px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  pointer-events: none;
}
</style>
