import { Arcanvas, AutoResizePlugin, Camera, Camera2DController, EngineRenderSystem, TransformationMatrix } from "@arcanvas/core";
import { createPositionNormalUVLayout, Mesh, RenderObject, UnlitColorMaterial } from "@arcanvas/graphics";
import { Scene, Transform } from "@arcanvas/scene";
import type { Meta, StoryObj } from "@storybook/html";

interface BackendSwitchArgs {
  backend: "webgl" | "canvas2d" | "webgpu";
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
  container.style.overflow = "hidden";

  const canvas = document.createElement("canvas");
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.display = "block";
  container.appendChild(canvas);

  // Initialize Arcanvas
  const arc = new Arcanvas(canvas, {
    backend: args.backend,
  });
  arc.use(AutoResizePlugin);

  // Create scene - will be updated on resize
  const scene = new Scene({ width: canvas.width || 800, height: canvas.height || 600 });

  // Create a simple quad
  const mesh = createQuadMesh();
  const material = new UnlitColorMaterial({
    baseColor: [0.2, 0.7, 0.9, 1],
  });
  const matrix = new TransformationMatrix();
  const updateQuadPosition = () => {
    const width = canvas.width || 800;
    const height = canvas.height || 600;
    // Reset matrix to identity by directly modifying _data
    const data = (matrix as unknown as { _data: Float32Array })._data;
    data[0] = 1;
    data[1] = 0;
    data[2] = 0;
    data[3] = 0;
    data[4] = 0;
    data[5] = 1;
    data[6] = 0;
    data[7] = 0;
    data[8] = 0;
    data[9] = 0;
    data[10] = 1;
    data[11] = 0;
    data[12] = 0;
    data[13] = 0;
    data[14] = 0;
    data[15] = 1;
    matrix.translate(width / 2 - 50, height / 2 - 50, 0);
  };
  updateQuadPosition();
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

  scene.viewport = { width: canvas.width || 800, height: canvas.height || 600 };

  arc.on("resize", () => {
    updateQuadPosition();
    scene.viewport = { width: canvas.width, height: canvas.height };
  });

  // Render loop
  let animationFrameId: number;
  const frame = () => {
    renderSystem.renderOnce();
    animationFrameId = requestAnimationFrame(frame);
  };
  frame();

  const cleanup = () => {
    if (animationFrameId !== undefined) {
      cancelAnimationFrame(animationFrameId);
    }
  };

  cleanupMap.set(id, cleanup);

  return container;
}

export const WebGL: Story = {
  render: (args) => render({ ...args, backend: "webgl" }, "webgl"),
  args: {
    backend: "webgl",
  },
};

// Note: Canvas2D and WebGPU backends are not yet implemented
// These stories will show an error when selected
export const Canvas2D: Story = {
  render: (args) => render({ ...args, backend: "canvas2d" }, "canvas2d"),
  args: {
    backend: "canvas2d",
  },
};

export const WebGPU: Story = {
  render: (args) => render({ ...args, backend: "webgpu" }, "webgpu"),
  args: {
    backend: "webgpu",
  },
};
