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

// Simple colored triangle shader
const vertexShaderCode = `#version 300 es
layout(location = 0) in vec2 a_position;
layout(location = 1) in vec3 a_color;

out vec3 v_color;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_color = a_color;
}
`;

const fragmentShaderCode = `#version 300 es
precision highp float;

in vec3 v_color;
out vec4 fragColor;

void main() {
  fragColor = vec4(v_color, 1.0);
}
`;

onMounted(async () => {
  if (!canvasRef.value) return;

  // Initialize canvas host (handles resize, DPR)
  canvasHost = createCanvasHost({
    canvas: canvasRef.value,
    autoResize: true,
    handleDpr: true,
    maxDpr: 2,
  });

  // Request WebGL2 adapter and device
  const adapter = await requestAdapter({ canvas: canvasHost.canvas });
  if (!adapter) {
    console.error("WebGL2 not supported");
    return;
  }

  device = await adapter.requestDevice({ label: "GettingStarted Device" });

  // Create shaders
  const vertexShader = device.createShaderModule({
    label: "Vertex Shader",
    sources: [glslVertex(vertexShaderCode)],
  });

  const fragmentShader = device.createShaderModule({
    label: "Fragment Shader",
    sources: [glslFragment(fragmentShaderCode)],
  });

  // Triangle vertices: position (vec2) + color (vec3)
  // prettier-ignore
  const vertices = new Float32Array([
    // x,    y,     r,    g,    b
     0.0,  0.5,   1.0,  0.2,  0.3,  // top (red-ish)
    -0.5, -0.5,   0.2,  1.0,  0.3,  // bottom-left (green-ish)
     0.5, -0.5,   0.2,  0.3,  1.0,  // bottom-right (blue-ish)
  ]);

  // Create vertex buffer
  vertexBuffer = device.createBuffer({
    label: "Triangle Vertex Buffer",
    size: vertices.byteLength,
    usage: BufferUsage.VERTEX | BufferUsage.COPY_DST,
    mappedAtCreation: true,
  });

  new Float32Array(vertexBuffer.getMappedRange()).set(vertices);
  vertexBuffer.unmap();

  // Create render pipeline
  pipeline = device.createRenderPipeline({
    label: "Triangle Pipeline",
    layout: "auto",
    vertex: {
      module: vertexShader,
      entryPoint: "main",
      buffers: [{
        arrayStride: 5 * 4, // 5 floats * 4 bytes
        attributes: [
          { format: "float32x2", offset: 0, shaderLocation: 0 },     // position
          { format: "float32x3", offset: 2 * 4, shaderLocation: 1 }, // color
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

  // Create frame loop
  frameLoop = createFrameLoop();

  frameLoop.onFrame(() => {
    if (!device || !pipeline || !vertexBuffer || !canvasHost) return;

    // Update viewport to match canvas size
    const gl = (device as unknown as { native: WebGL2RenderingContext }).native;
    gl.viewport(0, 0, canvasHost.width, canvasHost.height);

    const encoder = device.createCommandEncoder({ label: "Frame Encoder" });

    // WebGL2 renders to the default framebuffer (canvas)
    // The view is not used for default framebuffer rendering
    const renderPass = encoder.beginRenderPass({
      colorAttachments: [{
        view: null as unknown as Parameters<typeof encoder.beginRenderPass>[0]["colorAttachments"][0]["view"],
        clearValue: { r: 0.1, g: 0.1, b: 0.15, a: 1.0 },
        loadOp: "clear",
        storeOp: "store",
      }],
    });

    renderPass.setPipeline(pipeline);
    renderPass.setVertexBuffer(0, vertexBuffer);
    renderPass.draw(3);
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
    <div class="overlay">WebGL2 Triangle with @arcanvas/gfx API</div>
  </div>
</template>

<style scoped>
.example-container {
  width: 100%;
  height: 400px;
  position: relative;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}
canvas {
  width: 100%;
  height: 100%;
  display: block;
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
