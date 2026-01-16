import type { Meta, StoryObj } from "@storybook/html";
import { Arcanvas, Camera, Camera2DController, EngineRenderSystem, Scene, UnlitColorMaterial } from "@arcanvas/core";
import { RenderObject, Mesh, createPositionNormalUVLayout } from "@arcanvas/graphics";
import { Transform } from "@arcanvas/scene";
import { TransformationMatrix } from "@arcanvas/core";

interface BackendSwitchArgs {
  backend: "webgl" | "canvas2d" | "webgpu";
  canvasWidth: number;
  canvasHeight: number;
}

const cleanupMap = new Map<string, () => void>();

const meta: Meta<BackendSwitchArgs> = {
  title: "Core/Arcanvas/BackendSwitch",
  tags: ["autodocs"],
  parameters: {
    docs: {
      source: {
        type: "code",
        language: "typescript",
      },
    },
  },
  argTypes: {
    backend: {
      control: "select",
      options: ["webgl", "canvas2d", "webgpu"],
      description: "Rendering backend",
      defaultValue: "webgl",
    },
    canvasWidth: {
      control: { type: "number", min: 200, max: 1920, step: 10 },
      description: "Canvas width",
      defaultValue: 800,
    },
    canvasHeight: {
      control: { type: "number", min: 200, max: 1080, step: 10 },
      description: "Canvas height",
      defaultValue: 600,
    },
  },
};

export default meta;
type Story = StoryObj<BackendSwitchArgs>;

/**
 * Creates a quad mesh for testing.
 */
function createQuadMesh(): Mesh {
  const vertices = new Float32Array([
    // Bottom-left: position (x, y, z), normal (0, 0, 1), uv (u, v)
    0, 0, 0, 0, 0, 1, 0, 0,
    // Bottom-right
    100, 0, 0, 0, 0, 1, 1, 0,
    // Top-right
    100, 100, 0, 0, 0, 1, 1, 1,
    // Top-left
    0, 100, 0, 0, 0, 1, 0, 1,
  ]);

  const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);
  const layout = createPositionNormalUVLayout();

  return new Mesh(vertices, indices, layout, "triangles");
}

/**
 * Renders the backend switch story.
 */
function render(args: BackendSwitchArgs, id: string): HTMLElement {
  const existingCleanup = cleanupMap.get(id);
  if (existingCleanup) {
    existingCleanup();
    cleanupMap.delete(id);
  }

  const container = document.createElement("div");
  container.style.width = "100%";
  container.style.height = "100vh";
  container.style.display = "flex";
  container.style.justifyContent = "center";
  container.style.alignItems = "center";
  container.style.overflow = "hidden";

  const canvas = document.createElement("canvas");
  canvas.width = args.canvasWidth;
  canvas.height = args.canvasHeight;
  canvas.style.border = "1px solid #ccc";
  canvas.style.display = "block";
  container.appendChild(canvas);

  const updateCanvasSize = () => {
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const docAspectRatio = args.canvasWidth / args.canvasHeight;
    const containerAspectRatio = containerWidth / containerHeight;

    let displayWidth: number;
    let displayHeight: number;

    if (containerAspectRatio > docAspectRatio) {
      displayHeight = containerHeight;
      displayWidth = displayHeight * docAspectRatio;
    } else {
      displayWidth = containerWidth;
      displayHeight = displayWidth / docAspectRatio;
    }

    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
    canvas.style.maxWidth = "100%";
    canvas.style.maxHeight = "100%";
  };

  updateCanvasSize();

  // Initialize Arcanvas
  const arc = new Arcanvas(canvas, {
    width: args.canvasWidth,
    height: args.canvasHeight,
    backend: args.backend,
  });

  // Create scene
  const scene = new Scene({ width: args.canvasWidth, height: args.canvasHeight });

  // Create a simple quad
  const mesh = createQuadMesh();
  const material = new UnlitColorMaterial({
    baseColor: [0.2, 0.7, 0.9, 1],
  });
  const matrix = new TransformationMatrix();
  matrix.translate(args.canvasWidth / 2 - 50, args.canvasHeight / 2 - 50, 0);
  const transform = new Transform(matrix);

  const quad = new RenderObject(mesh, material, transform);
  quad.name = "TestQuad";
  scene.addObject(quad);

  // Setup camera
  const camera = new Camera(arc);
  camera.pixelsPerUnit = 1;
  arc.setCamera(camera);

  const controller = new Camera2DController();
  controller.zoom = 1;
  controller.attach(camera);
  controller.enable();

  // Create render system
  const renderSystem = new EngineRenderSystem(canvas, scene, camera, { backend: args.backend as "webgl" });

  scene.viewport = { width: args.canvasWidth, height: args.canvasHeight };

  arc.on("resize", () => {
    if (canvas.width !== args.canvasWidth) {
      canvas.width = args.canvasWidth;
    }
    if (canvas.height !== args.canvasHeight) {
      canvas.height = args.canvasHeight;
    }
    scene.viewport = { width: args.canvasWidth, height: args.canvasHeight };
  });

  // Render loop
  let animationFrameId: number;
  const frame = () => {
    renderSystem.renderOnce();
    animationFrameId = requestAnimationFrame(frame);
  };
  frame();

  const resizeObserver = new ResizeObserver(() => {
    updateCanvasSize();
  });
  resizeObserver.observe(container);

  const cleanup = () => {
    if (animationFrameId !== undefined) {
      cancelAnimationFrame(animationFrameId);
    }
    resizeObserver.disconnect();
  };

  cleanupMap.set(id, cleanup);

  return container;
}

export const WebGL: Story = {
  render: (args) => render({ ...args, backend: "webgl" }, "webgl"),
  args: {
    backend: "webgl",
    canvasWidth: 800,
    canvasHeight: 600,
  },
};

// Note: Canvas2D and WebGPU backends are not yet implemented
// These stories will show an error when selected
export const Canvas2D: Story = {
  render: (args) => render({ ...args, backend: "canvas2d" }, "canvas2d"),
  args: {
    backend: "canvas2d",
    canvasWidth: 800,
    canvasHeight: 600,
  },
};

export const WebGPU: Story = {
  render: (args) => render({ ...args, backend: "webgpu" }, "webgpu"),
  args: {
    backend: "webgpu",
    canvasWidth: 800,
    canvasHeight: 600,
  },
};
