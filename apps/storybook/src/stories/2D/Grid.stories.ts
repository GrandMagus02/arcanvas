import type { Meta, StoryObj } from "@storybook/html";
import { Arcanvas, Camera, Camera2DController, EngineRenderSystem } from "@arcanvas/core";
import { GridObject } from "@arcanvas/feature-2d";
import { Scene } from "@arcanvas/scene";

interface GridArgs {
  canvasWidth: number;
  canvasHeight: number;
  cellSize: number;
  majorDivisions: number;
  adaptiveSpacing: boolean;
  fixedPixelSize: boolean;
  minCellPixelSize: number;
  cameraZoom: number;
}

const cleanupMap = new Map<string, () => void>();

const meta: Meta<GridArgs> = {
  title: "2D/Grid/Basic",
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
    cellSize: {
      control: { type: "range", min: 0.1, max: 5, step: 0.1 },
      description: "Grid cell size",
      defaultValue: 1,
    },
    majorDivisions: {
      control: { type: "number", min: 1, max: 10, step: 1 },
      description: "Major divisions",
      defaultValue: 4,
    },
    adaptiveSpacing: {
      control: "boolean",
      description: "Adaptive spacing",
      defaultValue: true,
    },
    fixedPixelSize: {
      control: "boolean",
      description: "Fixed pixel size",
      defaultValue: true,
    },
    minCellPixelSize: {
      control: { type: "number", min: 5, max: 100, step: 5 },
      description: "Minimum cell pixel size",
      defaultValue: 20,
    },
    cameraZoom: {
      control: { type: "range", min: 0.01, max: 2, step: 0.01 },
      description: "Camera zoom level",
      defaultValue: 0.1,
    },
  },
};

export default meta;
type Story = StoryObj<GridArgs>;

/**
 * Renders the grid story.
 */
function render(args: GridArgs, id: string): HTMLElement {
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

  // Create grid
  const grid = new GridObject({
    plane: "XY",
    cellSize: args.cellSize,
    majorDivisions: args.majorDivisions,
    adaptiveSpacing: args.adaptiveSpacing,
    fixedPixelSize: args.fixedPixelSize,
    axisLineWidth: 2,
    majorLineWidth: 1,
    minorLineWidth: 1,
    minCellPixelSize: args.minCellPixelSize,
    baseColor: [0.1, 0.1, 0.1, 1],
    minorColor: [0.3, 0.3, 0.3, 0.5],
    majorColor: [0.5, 0.5, 0.5, 0.8],
    xAxisColor: [0.8, 0.2, 0.2, 1],
    yAxisColor: [0.2, 0.8, 0.2, 1],
  });
  scene.addObject(grid);

  // Update grid properties
  const updateGrid = () => {
    grid.setCellSize(args.cellSize);
    grid.setMajorDivisions(args.majorDivisions);
    grid.setAdaptiveSpacing(args.adaptiveSpacing);
    grid.setFixedPixelSize(args.fixedPixelSize);
    grid.setMinCellPixelSize(args.minCellPixelSize);
  };

  updateGrid();

  // Setup camera
  const camera = new Camera(arc);
  camera.pixelsPerUnit = 100;
  arc.setCamera(camera);

  const controller = new Camera2DController();
  controller.zoom = args.cameraZoom;
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
    updateGrid();
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

export const Default: Story = {
  render: (args) => render(args, "default"),
  args: {
    canvasWidth: 800,
    canvasHeight: 600,
    cellSize: 1,
    majorDivisions: 4,
    adaptiveSpacing: true,
    fixedPixelSize: true,
    minCellPixelSize: 20,
    cameraZoom: 0.1,
  },
};

export const SmallCells: Story = {
  render: (args) => render(args, "small-cells"),
  args: {
    canvasWidth: 800,
    canvasHeight: 600,
    cellSize: 0.5,
    majorDivisions: 4,
    adaptiveSpacing: true,
    fixedPixelSize: true,
    minCellPixelSize: 20,
    cameraZoom: 0.1,
  },
};

export const LargeCells: Story = {
  render: (args) => render(args, "large-cells"),
  args: {
    canvasWidth: 800,
    canvasHeight: 600,
    cellSize: 2,
    majorDivisions: 4,
    adaptiveSpacing: true,
    fixedPixelSize: true,
    minCellPixelSize: 20,
    cameraZoom: 0.1,
  },
};
