import type { Meta, StoryObj } from "@storybook/html";
import { Arcanvas, Camera, Camera2DController, EngineRenderSystem, GridObject, Scene } from "@arcanvas/core";

interface PanZoomArgs {
  canvasWidth: number;
  canvasHeight: number;
  showGrid: boolean;
  initialZoom: number;
  minZoom: number;
  maxZoom: number;
  zoomSensitivity: number;
}

const cleanupMap = new Map<string, () => void>();

const meta: Meta<PanZoomArgs> = {
  title: "Camera/Camera2D/PanZoom",
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
    showGrid: {
      control: "boolean",
      description: "Show grid for visual reference",
      defaultValue: true,
    },
    initialZoom: {
      control: { type: "range", min: 0.01, max: 2, step: 0.01 },
      description: "Initial zoom level",
      defaultValue: 0.1,
    },
    minZoom: {
      control: { type: "range", min: 0.001, max: 1, step: 0.001 },
      description: "Minimum zoom level",
      defaultValue: 0.001,
    },
    maxZoom: {
      control: { type: "range", min: 1, max: 10, step: 0.1 },
      description: "Maximum zoom level",
      defaultValue: 10,
    },
    zoomSensitivity: {
      control: { type: "range", min: 0.001, max: 0.1, step: 0.001 },
      description: "Zoom sensitivity",
      defaultValue: 0.01,
    },
  },
};

export default meta;
type Story = StoryObj<PanZoomArgs>;

/**
 * Renders the pan/zoom camera story.
 */
function render(args: PanZoomArgs, id: string): HTMLElement {
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
  });

  // Create scene
  const scene = new Scene({ width: args.canvasWidth, height: args.canvasHeight });

  // Create grid if enabled
  if (args.showGrid) {
    const grid = new GridObject({
      plane: "XY",
      cellSize: 1,
      majorDivisions: 4,
      adaptiveSpacing: true,
      fixedPixelSize: true,
      axisLineWidth: 2,
      majorLineWidth: 1,
      minorLineWidth: 1,
      minCellPixelSize: 20,
      baseColor: [0.1, 0.1, 0.1, 1],
      minorColor: [0.3, 0.3, 0.3, 0.5],
      majorColor: [0.5, 0.5, 0.5, 0.8],
      xAxisColor: [0.8, 0.2, 0.2, 1],
      yAxisColor: [0.2, 0.8, 0.2, 1],
    });
    scene.addObject(grid);
  }

  // Setup camera
  const camera = new Camera(arc);
  camera.pixelsPerUnit = 100;
  arc.setCamera(camera);

  const controller = new Camera2DController({
    minZoom: args.minZoom,
    maxZoom: args.maxZoom,
    zoomSensitivity: args.zoomSensitivity,
  });
  controller.zoom = args.initialZoom;
  controller.attach(camera);
  controller.enable();

  // Create render system
  const renderSystem = new EngineRenderSystem(canvas, scene, camera, { backend: "webgl" });

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
    controller.disable();
  };

  cleanupMap.set(id, cleanup);

  return container;
}

export const Default: Story = {
  render: (args) => render(args, "default"),
  args: {
    canvasWidth: 800,
    canvasHeight: 600,
    showGrid: true,
    initialZoom: 0.1,
    minZoom: 0.001,
    maxZoom: 10,
    zoomSensitivity: 0.01,
  },
};

export const ZoomedIn: Story = {
  render: (args) => render(args, "zoomed-in"),
  args: {
    canvasWidth: 800,
    canvasHeight: 600,
    showGrid: true,
    initialZoom: 0.5,
    minZoom: 0.001,
    maxZoom: 10,
    zoomSensitivity: 0.01,
  },
};

export const ZoomedOut: Story = {
  render: (args) => render(args, "zoomed-out"),
  args: {
    canvasWidth: 800,
    canvasHeight: 600,
    showGrid: true,
    initialZoom: 0.01,
    minZoom: 0.001,
    maxZoom: 10,
    zoomSensitivity: 0.01,
  },
};
