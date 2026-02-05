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
import { FontLoader, TextGeometry } from "@arcanvas/typography";
import type * as opentype from "opentype.js";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

const canvasRef = ref<HTMLCanvasElement | null>(null);
const currentFont = ref<opentype.Font | null>(null);

let canvasHost: CanvasHost | null = null;
let frameLoop: FrameLoop | null = null;
let device: GfxDevice | null = null;
let pipeline: GfxRenderPipeline | null = null;
let gridPipeline: GfxRenderPipeline | null = null;
let textVertexBuffer: GfxBuffer | null = null;
let textIndexBuffer: GfxBuffer | null = null;
let gridQuadBuffer: GfxBuffer | null = null;
let textIndexCount = 0;

// Camera state
let cameraX = 0;
let cameraY = 0;
let cameraZoom = 1;
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;

const status = ref("Upload a font file to get started");
const text = ref("Hello Arcanvas!");
const fontSize = ref(64);
const color = ref("#ffffff");
const fontName = ref("No font loaded");
const showGrid = ref(true);

const colorRgb = computed(() => {
  const hex = color.value.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  return [r, g, b, 1] as [number, number, number, number];
});

// Text shader
const textVertexShader = `#version 300 es
layout(location = 0) in vec3 a_position;
layout(location = 1) in vec3 a_normal;
layout(location = 2) in vec2 a_uv;

uniform vec2 u_resolution;
uniform vec2 u_cameraPos;
uniform float u_zoom;
uniform vec2 u_offset;

void main() {
  vec2 worldPos = a_position.xy + u_offset;
  vec2 viewPos = (worldPos - u_cameraPos) * u_zoom;
  vec2 clipPos = viewPos / (u_resolution * 0.5);
  clipPos.y = -clipPos.y; // Flip Y for screen coordinates
  gl_Position = vec4(clipPos, 0.0, 1.0);
}
`;

const textFragmentShader = `#version 300 es
precision highp float;

uniform vec4 u_color;
out vec4 fragColor;

void main() {
  fragColor = u_color;
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
uniform bool u_showGrid;

float gridLine(float coord, float lineWidth) {
  float d = abs(fract(coord - 0.5) - 0.5);
  return smoothstep(lineWidth, 0.0, d);
}

void main() {
  vec3 color = vec3(0.08, 0.08, 0.08);

  if (u_showGrid) {
    float adaptiveCell = u_cellSize;

    // Minor grid lines
    float minorIntensity = gridLine(v_worldPos.x / adaptiveCell, 0.01 / u_zoom);
    minorIntensity = max(minorIntensity, gridLine(v_worldPos.y / adaptiveCell, 0.01 / u_zoom));
    color = mix(color, vec3(0.2, 0.2, 0.2), minorIntensity * 0.5);

    // Major grid lines
    float majorCell = adaptiveCell * 4.0;
    float majorIntensity = gridLine(v_worldPos.x / majorCell, 0.015 / u_zoom);
    majorIntensity = max(majorIntensity, gridLine(v_worldPos.y / majorCell, 0.015 / u_zoom));
    color = mix(color, vec3(0.35, 0.35, 0.35), majorIntensity * 0.8);

    // Axes
    float axisWidth = 2.0 / u_zoom;
    if (abs(v_worldPos.y) < axisWidth) {
      float t = 1.0 - abs(v_worldPos.y) / axisWidth;
      color = mix(color, vec3(0.6, 0.15, 0.15), t * 0.9);
    }
    if (abs(v_worldPos.x) < axisWidth) {
      float t = 1.0 - abs(v_worldPos.x) / axisWidth;
      color = mix(color, vec3(0.15, 0.6, 0.15), t * 0.9);
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
  cameraY += dy / cameraZoom;
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
    status.value = "Error: WebGL2 not supported";
    return;
  }

  device = await adapter.requestDevice({ label: "Typography Device" });

  // Create text pipeline
  const textVS = device.createShaderModule({
    label: "Text Vertex Shader",
    sources: [glslVertex(textVertexShader)],
  });

  const textFS = device.createShaderModule({
    label: "Text Fragment Shader",
    sources: [glslFragment(textFragmentShader)],
  });

  pipeline = device.createRenderPipeline({
    label: "Text Pipeline",
    layout: "auto",
    vertex: {
      module: textVS,
      entryPoint: "main",
      buffers: [{
        arrayStride: 8 * 4, // position(3) + normal(3) + uv(2)
        attributes: [
          { format: "float32x3", offset: 0, shaderLocation: 0 },
          { format: "float32x3", offset: 3 * 4, shaderLocation: 1 },
          { format: "float32x2", offset: 6 * 4, shaderLocation: 2 },
        ],
      }],
    },
    fragment: {
      module: textFS,
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

  frameLoop = createFrameLoop();

  frameLoop.onFrame(() => {
    if (!device || !canvasHost) return;

    const gl = (device as unknown as { native: WebGL2RenderingContext }).native;
    gl.viewport(0, 0, canvasHost.width, canvasHost.height);

    const encoder = device.createCommandEncoder({ label: "Frame Encoder" });

    const renderPass = encoder.beginRenderPass({
      colorAttachments: [{
        view: null as unknown as Parameters<typeof encoder.beginRenderPass>[0]["colorAttachments"][0]["view"],
        clearValue: { r: 0.08, g: 0.08, b: 0.08, a: 1.0 },
        loadOp: "clear",
        storeOp: "store",
      }],
    });

    // Render grid
    if (showGrid.value && gridPipeline && gridQuadBuffer) {
      renderPass.setPipeline(gridPipeline);
      renderPass.setVertexBuffer(0, gridQuadBuffer);

      const gridProg = (gridPipeline as WebGL2RenderPipeline).program.native;
      gl.uniform2f(gl.getUniformLocation(gridProg, "u_resolution"), canvasHost.cssWidth, canvasHost.cssHeight);
      gl.uniform2f(gl.getUniformLocation(gridProg, "u_cameraPos"), cameraX, cameraY);
      gl.uniform1f(gl.getUniformLocation(gridProg, "u_zoom"), cameraZoom);
      gl.uniform1f(gl.getUniformLocation(gridProg, "u_cellSize"), 50);
      gl.uniform1i(gl.getUniformLocation(gridProg, "u_showGrid"), 1);

      renderPass.draw(6);
    }

    // Render text
    if (pipeline && textVertexBuffer && textIndexBuffer && textIndexCount > 0) {
      renderPass.setPipeline(pipeline);
      renderPass.setVertexBuffer(0, textVertexBuffer);
      renderPass.setIndexBuffer(textIndexBuffer, "uint16");

      const textProg = (pipeline as WebGL2RenderPipeline).program.native;
      gl.uniform2f(gl.getUniformLocation(textProg, "u_resolution"), canvasHost.cssWidth, canvasHost.cssHeight);
      gl.uniform2f(gl.getUniformLocation(textProg, "u_cameraPos"), cameraX, cameraY);
      gl.uniform1f(gl.getUniformLocation(textProg, "u_zoom"), cameraZoom);
      gl.uniform2f(gl.getUniformLocation(textProg, "u_offset"), 20, 80);
      gl.uniform4fv(gl.getUniformLocation(textProg, "u_color"), colorRgb.value);

      renderPass.drawIndexed(textIndexCount);
    }

    renderPass.end();
    device.queue.submit([encoder.finish()]);
  });

  frameLoop.start();
});

async function handleFontUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  status.value = "Loading font...";
  try {
    currentFont.value = await FontLoader.fromFile(file);
    fontName.value = file.name.replace(/\.(ttf|otf|woff|woff2)$/i, "");
    status.value = "Ready - drag to pan, scroll to zoom";
    updateText();
  } catch (err) {
    status.value = "Error: Invalid font file";
    console.error(err);
  }
}

function updateText() {
  if (!device || !currentFont.value || !text.value) return;

  // Cleanup old buffers
  textVertexBuffer?.destroy();
  textIndexBuffer?.destroy();
  textVertexBuffer = null;
  textIndexBuffer = null;
  textIndexCount = 0;

  try {
    const mesh = TextGeometry.create(text.value, currentFont.value, {
      fontSize: fontSize.value,
      align: "left",
    });

    if (!mesh.vertexBuffers[0] || !mesh.indexData) return;

    const vertexData = mesh.vertexBuffers[0].data;
    const indexData = mesh.indexData.data;

    textVertexBuffer = device.createBuffer({
      label: "Text Vertex Buffer",
      size: vertexData.byteLength,
      usage: BufferUsage.VERTEX | BufferUsage.COPY_DST,
      mappedAtCreation: true,
    });
    new Float32Array(textVertexBuffer.getMappedRange()).set(vertexData as Float32Array);
    textVertexBuffer.unmap();

    textIndexBuffer = device.createBuffer({
      label: "Text Index Buffer",
      size: indexData.byteLength,
      usage: BufferUsage.INDEX | BufferUsage.COPY_DST,
      mappedAtCreation: true,
    });
    new Uint16Array(textIndexBuffer.getMappedRange()).set(indexData as Uint16Array);
    textIndexBuffer.unmap();

    textIndexCount = indexData.length;
  } catch (err) {
    console.error("Error creating text:", err);
  }
}

function toggleGrid() {
  // Grid visibility is controlled by showGrid ref
}

function resetView() {
  cameraZoom = 1;
  cameraX = 0;
  cameraY = 0;
}

watch([text, fontSize, color], () => {
  updateText();
});

onBeforeUnmount(() => {
  if (canvasRef.value) {
    canvasRef.value.removeEventListener('mousedown', handleMouseDown);
    canvasRef.value.removeEventListener('wheel', handleWheel);
  }
  window.removeEventListener('mousemove', handleMouseMove);
  window.removeEventListener('mouseup', handleMouseUp);

  frameLoop?.dispose();
  textVertexBuffer?.destroy();
  textIndexBuffer?.destroy();
  gridQuadBuffer?.destroy();
  device?.destroy();
  canvasHost?.dispose();
});
</script>

<template>
  <div class="typography-example">
    <div class="controls">
      <div class="control-group">
        <label>
          <span class="label">Text</span>
          <input v-model="text" type="text" placeholder="Enter text..." class="text-input" />
        </label>
      </div>

      <div class="control-row">
        <label class="control-group">
          <span class="label">Size</span>
          <input v-model.number="fontSize" type="range" min="12" max="200" class="slider" />
          <span class="value">{{ fontSize }}px</span>
        </label>

        <label class="control-group">
          <span class="label">Color</span>
          <input v-model="color" type="color" class="color-picker" />
        </label>

        <label class="control-group checkbox">
          <input type="checkbox" v-model="showGrid" @change="toggleGrid" />
          <span>Grid</span>
        </label>

        <button class="reset-btn" @click="resetView">Reset View</button>
      </div>

      <div class="control-group">
        <span class="label">Font</span>
        <div class="font-controls">
          <span class="font-name">{{ fontName }}</span>
          <label class="upload-btn">
            Upload Font
            <input type="file" accept=".ttf,.otf,.woff,.woff2" @change="handleFontUpload" hidden />
          </label>
        </div>
      </div>
    </div>

    <div class="canvas-container">
      <canvas ref="canvasRef"></canvas>
      <div v-if="!currentFont" class="no-font-overlay">
        <div class="no-font-message">
          <p>Upload a font file to render text</p>
          <p class="hint">Supports .ttf and .otf formats</p>
        </div>
      </div>
      <div class="status">{{ status }}</div>
      <div class="controls-hint">Drag to pan | Scroll to zoom</div>
    </div>
  </div>
</template>

<style scoped>
.typography-example {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  background: #1e1e1e;
  border: 1px solid #333;
}

.controls {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-bottom: 1px solid #333;
  background: #252529;
}

.control-row {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-group.checkbox {
  gap: 4px;
  color: #aaa;
  font-size: 13px;
}

.control-group.checkbox input {
  accent-color: #4a9eff;
}

.label {
  color: #888;
  font-size: 12px;
  min-width: 40px;
}

.text-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #444;
  border-radius: 4px;
  background: #2a2a2a;
  color: #fff;
  font-size: 14px;
}

.text-input:focus {
  outline: none;
  border-color: #666;
}

.slider {
  width: 120px;
  accent-color: #4a9eff;
}

.value {
  color: #aaa;
  font-size: 12px;
  min-width: 50px;
}

.color-picker {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: transparent;
}

.font-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.font-name {
  color: #ccc;
  font-size: 14px;
}

.upload-btn {
  padding: 6px 12px;
  background: #4a9eff;
  border: none;
  border-radius: 4px;
  color: #fff;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-btn:hover {
  background: #5aafff;
}

.reset-btn {
  padding: 6px 12px;
  background: #333;
  border: 1px solid #444;
  border-radius: 4px;
  color: #aaa;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-btn:hover {
  background: #444;
  color: #fff;
}

.canvas-container {
  position: relative;
  height: 400px;
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

.status {
  position: absolute;
  bottom: 10px;
  left: 10px;
  color: #666;
  font-family: monospace;
  font-size: 11px;
  background: rgba(0, 0, 0, 0.5);
  padding: 4px 8px;
  border-radius: 4px;
}

.controls-hint {
  position: absolute;
  bottom: 10px;
  right: 10px;
  color: #555;
  font-family: monospace;
  font-size: 10px;
  background: rgba(0, 0, 0, 0.5);
  padding: 4px 8px;
  border-radius: 4px;
}

.no-font-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(30, 30, 30, 0.85);
  pointer-events: none;
}

.no-font-message {
  text-align: center;
  color: #888;
}

.no-font-message p {
  margin: 0;
  font-size: 16px;
}

.no-font-message .hint {
  margin-top: 8px;
  font-size: 12px;
  color: #666;
}
</style>
