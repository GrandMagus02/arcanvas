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
} from "@arcanvas/webgl2";
import { onBeforeUnmount, onMounted, ref } from 'vue';

const canvasRef = ref<HTMLCanvasElement | null>(null);

let canvasHost: CanvasHost | null = null;
let frameLoop: FrameLoop | null = null;
let device: GfxDevice | null = null;
let pipeline: GfxRenderPipeline | null = null;
let vertexBuffer: GfxBuffer | null = null;
let vertexCount = 0;

// Shader with vertex colors (coordinates are pre-transformed to NDC)
const vertexShaderCode = `#version 300 es
layout(location = 0) in vec2 a_position;
layout(location = 1) in vec4 a_color;

out vec4 v_color;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
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

/**
 * Convert pixel coordinates to NDC.
 */
function toNDC(x: number, y: number, width: number, height: number): [number, number] {
  return [
    (x / width) * 2 - 1,
    -((y / height) * 2 - 1), // Flip Y for canvas coordinates
  ];
}

/**
 * Create a polygon as triangle fan vertices (in NDC).
 */
function createPolygonVertices(
  cx: number,
  cy: number,
  radius: number,
  sides: number,
  color: [number, number, number, number],
  width: number,
  height: number
): Float32Array {
  const vertices: number[] = [];
  const [r, g, b, a] = color;

  const [ncx, ncy] = toNDC(cx, cy, width, height);
  const nrx = (radius / width) * 2;
  const nry = (radius / height) * 2;

  for (let i = 0; i < sides; i++) {
    const angle1 = (i / sides) * Math.PI * 2 - Math.PI / 2;
    const angle2 = ((i + 1) / sides) * Math.PI * 2 - Math.PI / 2;

    // Center
    vertices.push(ncx, ncy, r, g, b, a);
    // First perimeter
    vertices.push(ncx + nrx * Math.cos(angle1), ncy - nry * Math.sin(angle1), r, g, b, a);
    // Second perimeter
    vertices.push(ncx + nrx * Math.cos(angle2), ncy - nry * Math.sin(angle2), r, g, b, a);
  }

  return new Float32Array(vertices);
}

/**
 * Create a rectangle as two triangles (in NDC).
 */
function createRectVertices(
  x: number,
  y: number,
  w: number,
  h: number,
  color: [number, number, number, number],
  width: number,
  height: number
): Float32Array {
  const [r, g, b, a] = color;
  const [x1, y1] = toNDC(x, y, width, height);
  const [x2, y2] = toNDC(x + w, y + h, width, height);

  // prettier-ignore
  return new Float32Array([
    // Triangle 1
    x1, y1, r, g, b, a,
    x2, y1, r, g, b, a,
    x2, y2, r, g, b, a,
    // Triangle 2
    x1, y1, r, g, b, a,
    x2, y2, r, g, b, a,
    x1, y2, r, g, b, a,
  ]);
}

function buildShapeVertices(width: number, height: number): Float32Array {
  const allVertices: Float32Array[] = [];

  // Rectangle (cyan)
  allVertices.push(createRectVertices(100, 100, 200, 150, [0.2, 0.7, 0.9, 1.0], width, height));

  // Hexagon (orange)
  allVertices.push(createPolygonVertices(200, 350, 60, 6, [0.9, 0.5, 0.2, 1.0], width, height));

  // Circle (green) - 64 sides
  allVertices.push(createPolygonVertices(400, 200, 70, 64, [0.2, 0.9, 0.4, 1.0], width, height));

  // Pentagon (purple)
  allVertices.push(createPolygonVertices(550, 350, 55, 5, [0.6, 0.2, 0.9, 1.0], width, height));

  // Decagon (yellow)
  allVertices.push(createPolygonVertices(500, 120, 50, 10, [0.9, 0.8, 0.2, 1.0], width, height));

  // Combine all vertices
  const totalFloats = allVertices.reduce((sum, arr) => sum + arr.length, 0);
  const combined = new Float32Array(totalFloats);
  let offset = 0;
  for (const arr of allVertices) {
    combined.set(arr, offset);
    offset += arr.length;
  }

  return combined;
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

  device = await adapter.requestDevice({ label: "BasicShapes Device" });

  // Create shaders
  const vertexShader = device.createShaderModule({
    label: "Shapes Vertex Shader",
    sources: [glslVertex(vertexShaderCode)],
  });

  const fragmentShader = device.createShaderModule({
    label: "Shapes Fragment Shader",
    sources: [glslFragment(fragmentShaderCode)],
  });

  // Build vertices with reference dimensions
  const refWidth = 700;
  const refHeight = 500;
  const combinedVertices = buildShapeVertices(refWidth, refHeight);
  vertexCount = combinedVertices.length / 6; // 6 floats per vertex

  // Create vertex buffer
  vertexBuffer = device.createBuffer({
    label: "Shapes Vertex Buffer",
    size: combinedVertices.byteLength,
    usage: BufferUsage.VERTEX | BufferUsage.COPY_DST,
    mappedAtCreation: true,
  });

  new Float32Array(vertexBuffer.getMappedRange()).set(combinedVertices);
  vertexBuffer.unmap();

  // Create render pipeline
  pipeline = device.createRenderPipeline({
    label: "Shapes Pipeline",
    layout: "auto",
    vertex: {
      module: vertexShader,
      entryPoint: "main",
      buffers: [{
        arrayStride: 6 * 4, // 6 floats * 4 bytes (pos2 + color4)
        attributes: [
          { format: "float32x2", offset: 0, shaderLocation: 0 },     // position
          { format: "float32x4", offset: 2 * 4, shaderLocation: 1 }, // color
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
    if (!device || !pipeline || !vertexBuffer || !canvasHost) return;

    // Update viewport
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
    renderPass.draw(vertexCount);
    renderPass.end();

    device.queue.submit([encoder.finish()]);
  });

  frameLoop.start();
});

onBeforeUnmount(() => {
  frameLoop?.dispose();
  vertexBuffer?.destroy();
  device?.destroy();
  canvasHost?.dispose();
});
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
