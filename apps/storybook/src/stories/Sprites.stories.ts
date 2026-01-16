import { Arcanvas, Camera, Camera2DController, EngineRenderSystem, Scene, TransformationMatrix } from "@arcanvas/core";
import { createPositionNormalUVLayout, Mesh, RenderObject, UnlitColorMaterial } from "@arcanvas/graphics";
import { Transform } from "@arcanvas/scene";
import type { Meta, StoryObj } from "@storybook/html";

interface SpritesArgs {
  canvasWidth: number;
  canvasHeight: number;
  spriteCount: number;
  spriteSize: number;
  cameraZoom: number;
}

// Store cleanup functions for each story instance
const cleanupMap = new Map<string, () => void>();

const meta: Meta<SpritesArgs> = {
  title: "Arcanvas/Sprites",
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
    spriteCount: {
      control: { type: "number", min: 1, max: 50, step: 1 },
      description: "Number of sprites",
      defaultValue: 10,
    },
    spriteSize: {
      control: { type: "number", min: 10, max: 200, step: 5 },
      description: "Sprite size in pixels",
      defaultValue: 50,
    },
    cameraZoom: {
      control: { type: "range", min: 0.01, max: 2, step: 0.01 },
      description: "Camera zoom level",
      defaultValue: 1,
    },
  },
};

export default meta;
type Story = StoryObj<SpritesArgs>;

/**
 * Creates a simple quad mesh for a sprite.
 */
function createSpriteMesh(width: number, height: number): Mesh {
  const vertices = new Float32Array([
    // Bottom-left: position (x, y, z), normal (0, 0, 1), uv (u, v)
    0,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    // Bottom-right
    width,
    0,
    0,
    0,
    0,
    1,
    1,
    0,
    // Top-right
    width,
    height,
    0,
    0,
    0,
    1,
    1,
    1,
    // Top-left
    0,
    height,
    0,
    0,
    0,
    1,
    0,
    1,
  ]);

  const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);

  const layout = createPositionNormalUVLayout();

  return new Mesh(vertices, indices, layout, "triangles");
}

/**
 * Creates a colored sprite using RenderObject.
 * For MVP, this uses a solid color material. In a full implementation,
 * this would use a texture material.
 */
function createSprite(x: number, y: number, size: number, color: [number, number, number, number]): RenderObject {
  const mesh = createSpriteMesh(size, size);
  const material = new UnlitColorMaterial({ baseColor: color });
  const matrix = new TransformationMatrix();
  matrix.translate(x, y, 0);
  const transform = new Transform(matrix);

  return new RenderObject(mesh, material, transform);
}

function renderSprites(args: SpritesArgs, id: string): HTMLElement {
  // Cleanup previous instance if it exists
  const existingCleanup = cleanupMap.get(id);
  if (existingCleanup) {
    existingCleanup();
    cleanupMap.delete(id);
  }

  // Create container
  const container = document.createElement("div");
  container.style.width = "100%";
  container.style.height = "100vh";
  container.style.display = "flex";
  container.style.justifyContent = "center";
  container.style.alignItems = "center";
  container.style.overflow = "hidden";

  // Create canvas with fixed internal resolution (document size)
  const canvas = document.createElement("canvas");
  canvas.width = args.canvasWidth; // Internal resolution stays at document size
  canvas.height = args.canvasHeight; // Internal resolution stays at document size
  canvas.style.border = "1px solid #ccc";
  canvas.style.display = "block";
  container.appendChild(canvas);

  // Calculate responsive canvas CSS size - fill container while maintaining aspect ratio
  // This prevents content distortion while maximizing canvas size
  const updateCanvasSize = () => {
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const docAspectRatio = args.canvasWidth / args.canvasHeight;
    const containerAspectRatio = containerWidth / containerHeight;

    let displayWidth: number;
    let displayHeight: number;

    if (containerAspectRatio > docAspectRatio) {
      // Container is wider - fit to height
      displayHeight = containerHeight;
      displayWidth = displayHeight * docAspectRatio;
    } else {
      // Container is taller - fit to width
      displayWidth = containerWidth;
      displayHeight = displayWidth / docAspectRatio;
    }

    // Set CSS size to maintain aspect ratio (prevents stretching)
    // Internal resolution (canvas.width/height) stays at document size
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
    canvas.style.maxWidth = "100%";
    canvas.style.maxHeight = "100%";
  };

  // Initial size calculation
  updateCanvasSize();

  // Initialize Arcanvas
  const arc = new Arcanvas(canvas, {
    width: args.canvasWidth,
    height: args.canvasHeight,
  });

  // Create scene
  const scene = new Scene({ width: args.canvasWidth, height: args.canvasHeight });

  // Create sprites in a grid pattern
  const cols = Math.ceil(Math.sqrt(args.spriteCount));
  const rows = Math.ceil(args.spriteCount / cols);
  const spacing = args.spriteSize * 1.5;
  const startX = (args.canvasWidth - (cols - 1) * spacing) / 2;
  const startY = (args.canvasHeight - (rows - 1) * spacing) / 2;

  const colors: Array<[number, number, number, number]> = [
    [1, 0, 0, 1], // Red
    [0, 1, 0, 1], // Green
    [0, 0, 1, 1], // Blue
    [1, 1, 0, 1], // Yellow
    [1, 0, 1, 1], // Magenta
    [0, 1, 1, 1], // Cyan
  ];

  for (let i = 0; i < args.spriteCount; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = startX + col * spacing;
    const y = startY + row * spacing;
    const color = colors[i % colors.length];

    const sprite = createSprite(x, y, args.spriteSize, color);
    sprite.name = `Sprite-${i}`;
    scene.addObject(sprite);
  }

  // Setup camera
  const camera = new Camera(arc);
  camera.pixelsPerUnit = 1;
  arc.setCamera(camera);

  const controller = new Camera2DController();
  controller.zoom = args.cameraZoom;
  controller.attach(camera);
  controller.enable();

  // Create render system
  const renderSystem = new EngineRenderSystem(canvas, scene, camera, { backend: "webgl" });

  // Keep scene viewport at document size (not CSS size) to prevent content stretching
  // The canvas CSS size will stretch, but the viewport stays at document resolution
  // This ensures WebGL renders at the document size, and the browser scales it to fill CSS size
  scene.viewport = { width: args.canvasWidth, height: args.canvasHeight };

  // Prevent Arcanvas from resizing the internal canvas resolution
  // We only want CSS size to change, not the internal resolution
  arc.on("resize", () => {
    // Reset canvas internal resolution to document size if it was changed
    if (canvas.width !== args.canvasWidth) {
      canvas.width = args.canvasWidth;
    }
    if (canvas.height !== args.canvasHeight) {
      canvas.height = args.canvasHeight;
    }
    // Keep viewport at document size - this ensures WebGL viewport matches canvas internal resolution
    scene.viewport = { width: args.canvasWidth, height: args.canvasHeight };
    // Camera controller will automatically recalculate projection using canvas.width/height (internal resolution)
  });

  // Render loop
  let animationFrameId: number;
  const frame = () => {
    renderSystem.renderOnce();
    animationFrameId = requestAnimationFrame(frame);
  };
  frame();

  // Handle window resize
  const resizeObserver = new ResizeObserver(() => {
    updateCanvasSize();
  });
  resizeObserver.observe(container);

  // Cleanup function
  const cleanup = () => {
    if (animationFrameId !== undefined) {
      cancelAnimationFrame(animationFrameId);
    }
    resizeObserver.disconnect();
  };

  cleanupMap.set(id, cleanup);

  return container;
}

export const BasicSprites: Story = {
  render: (args) => renderSprites(args, "basic-sprites"),
  args: {
    canvasWidth: 800,
    canvasHeight: 600,
    spriteCount: 10,
    spriteSize: 50,
    cameraZoom: 1,
  },
};

export const ManySprites: Story = {
  render: (args) => renderSprites(args, "many-sprites"),
  args: {
    ...BasicSprites.args!,
    spriteCount: 25,
  },
};

export const LargeSprites: Story = {
  render: (args) => renderSprites(args, "large-sprites"),
  args: {
    ...BasicSprites.args!,
    spriteSize: 100,
    spriteCount: 6,
  },
};

export const ZoomedSprites: Story = {
  render: (args) => renderSprites(args, "zoomed-sprites"),
  args: {
    ...BasicSprites.args!,
    cameraZoom: 0.5,
  },
};
