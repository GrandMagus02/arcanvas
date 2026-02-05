# Getting Started

## Installation

```bash
# Install core packages
bun add @arcanvas/gfx @arcanvas/webgpu @arcanvas/webgl2

# Optional packages
bun add @arcanvas/runtime @arcanvas/scene @arcanvas/math @arcanvas/color
```

## Basic Setup

### 1. Request a Graphics Adapter

```typescript
import { requestAdapter, isWebGPUSupported } from "@arcanvas/webgpu";
import { requestAdapter as requestGL2Adapter } from "@arcanvas/webgl2";

async function initGraphics(canvas: HTMLCanvasElement) {
  // Try WebGPU first
  if (isWebGPUSupported()) {
    const adapter = await requestAdapter();
    if (adapter) {
      return adapter.requestDevice();
    }
  }

  // Fallback to WebGL2
  const adapter = await requestGL2Adapter({ canvas });
  if (!adapter) {
    throw new Error("No graphics adapter available");
  }
  return adapter.requestDevice();
}
```

### 2. Create Resources

```typescript
import { BufferUsage, TextureUsage, TextureFormat } from "@arcanvas/gfx";

// Create a vertex buffer
const vertexBuffer = device.createBuffer({
  label: "Vertex Buffer",
  size: vertices.byteLength,
  usage: BufferUsage.VERTEX | BufferUsage.COPY_DST,
});

// Write data
device.queue.writeBuffer(vertexBuffer, 0, vertices);

// Create a texture
const texture = device.createTexture({
  label: "Render Target",
  size: { width: 1024, height: 1024 },
  format: "rgba8unorm" as TextureFormat,
  usage: TextureUsage.RENDER_ATTACHMENT | TextureUsage.TEXTURE_BINDING,
});
```

### 3. Create a Render Pipeline

```typescript
const shaderModule = device.createShaderModule({
  label: "Triangle Shader",
  sources: [
    {
      kind: "wgsl",
      code: `
        @vertex fn vs(@builtin(vertex_index) i: u32) -> @builtin(position) vec4f {
          var pos = array<vec2f, 3>(
            vec2f(0.0, 0.5),
            vec2f(-0.5, -0.5),
            vec2f(0.5, -0.5)
          );
          return vec4f(pos[i], 0.0, 1.0);
        }

        @fragment fn fs() -> @location(0) vec4f {
          return vec4f(1.0, 0.0, 0.0, 1.0);
        }
      `,
    },
  ],
});

const pipeline = device.createRenderPipeline({
  label: "Triangle Pipeline",
  layout: "auto",
  vertex: {
    module: shaderModule,
    entryPoint: "vs",
  },
  fragment: {
    module: shaderModule,
    entryPoint: "fs",
    targets: [{ format: "bgra8unorm" }],
  },
});
```

### 4. Render a Frame

```typescript
function render() {
  const encoder = device.createCommandEncoder();

  const pass = encoder.beginRenderPass({
    colorAttachments: [
      {
        view: context.getCurrentTexture().createView(),
        loadOp: "clear",
        storeOp: "store",
        clearValue: { r: 0.1, g: 0.1, b: 0.1, a: 1.0 },
      },
    ],
  });

  pass.setPipeline(pipeline);
  pass.draw(3);
  pass.end();

  device.queue.submit([encoder.finish()]);
  requestAnimationFrame(render);
}

render();
```

## Using the Runtime

The `@arcanvas/runtime` package provides app infrastructure:

```typescript
import { CanvasHost, FrameLoop, EventBus } from "@arcanvas/runtime";

// Canvas management with DPR handling
const host = new CanvasHost(canvas);

// Event bus for typed pub/sub
interface AppEvents {
  resize: { width: number; height: number };
  frame: { deltaTime: number; time: number };
}

const events = new EventBus<AppEvents>();

// Frame loop
const loop = new FrameLoop();
loop.onFrame(({ deltaTime, time }) => {
  events.emit("frame", { deltaTime, time });
  render();
});
loop.start();

// Handle resize
host.events.on("resize", ({ width, height }) => {
  events.emit("resize", { width, height });
});
```

## TypeScript Configuration

Ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true
  }
}
```
