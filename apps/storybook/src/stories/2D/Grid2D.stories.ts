import { Arcanvas, AutoResizePlugin, Camera, Camera2DController, EngineRenderSystem } from "@arcanvas/core";
import { GridObject } from "@arcanvas/feature-2d";
import { Scene } from "@arcanvas/scene";
import type { Meta, StoryObj } from "@storybook/html";

interface Grid2DArgs {
  cellSize: number;
  majorDivisions: number;
  adaptiveSpacing: boolean;
  fixedPixelSize: boolean;
  minCellPixelSize: number;
  cameraZoom: number;
}

const cleanupMap = new Map<string, () => void>();

const meta: Meta<Grid2DArgs> = {
  title: "2D/Grid2D",
  argTypes: {
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
type Story = StoryObj<Grid2DArgs>;

/**
 * Renders the grid story.
 */
function render(args: Grid2DArgs, id: string): HTMLElement {
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
  const arc = new Arcanvas(canvas);
  arc.use(AutoResizePlugin);

  // Create scene - will be updated on resize
  const scene = new Scene({ width: canvas.width || 800, height: canvas.height || 600 });

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

  scene.viewport = { width: canvas.width || 800, height: canvas.height || 600 };

  arc.on("resize", () => {
    scene.viewport = { width: canvas.width, height: canvas.height };
  });

  // Render loop
  let animationFrameId: number;
  const frame = () => {
    updateGrid();
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

export const Default: Story = {
  render: (args) => render(args, "default"),
  args: {
    cellSize: 1,
    majorDivisions: 4,
    adaptiveSpacing: true,
    fixedPixelSize: true,
    minCellPixelSize: 20,
    cameraZoom: 0.1,
  },
};
