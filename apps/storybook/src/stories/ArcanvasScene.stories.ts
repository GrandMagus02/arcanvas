import { Arcanvas, Camera, Camera2DController, EngineRenderSystem, GridObject, Polygon2DObject, PolygonObject, Scene, UnlitColorMaterial } from "@arcanvas/core";
import type { Meta, StoryObj } from "@storybook/html";

interface ArcanvasSceneArgs {
  showGrid: boolean;
  gridCellSize: number;
  polygonRadius: number;
  polygonColorR: number;
  polygonColorG: number;
  polygonColorB: number;
  polygonColorA: number;
  outlineColorR: number;
  outlineColorG: number;
  outlineColorB: number;
  outlineColorA: number;
  cameraZoom: number;
  canvasWidth: number;
  canvasHeight: number;
}

// Store cleanup functions for each story instance
const cleanupMap = new Map<string, () => void>();

const meta: Meta<ArcanvasSceneArgs> = {
  title: "Arcanvas/Scene",
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
    showGrid: {
      control: "boolean",
      description: "Show or hide the grid",
      defaultValue: true,
    },
    gridCellSize: {
      control: { type: "range", min: 0.1, max: 5, step: 0.1 },
      description: "Grid cell size",
      defaultValue: 1,
    },
    polygonRadius: {
      control: { type: "range", min: 5, max: 50, step: 1 },
      description: "Radius of the hexagon polygon",
      defaultValue: 20,
    },
    polygonColorR: {
      control: { type: "range", min: 0, max: 1, step: 0.01 },
      description: "Polygon red color component",
      defaultValue: 0.2,
    },
    polygonColorG: {
      control: { type: "range", min: 0, max: 1, step: 0.01 },
      description: "Polygon green color component",
      defaultValue: 0.7,
    },
    polygonColorB: {
      control: { type: "range", min: 0, max: 1, step: 0.01 },
      description: "Polygon blue color component",
      defaultValue: 0.9,
    },
    polygonColorA: {
      control: { type: "range", min: 0, max: 1, step: 0.01 },
      description: "Polygon alpha component",
      defaultValue: 1,
    },
    outlineColorR: {
      control: { type: "range", min: 0, max: 1, step: 0.01 },
      description: "Outline red color component",
      defaultValue: 1,
    },
    outlineColorG: {
      control: { type: "range", min: 0, max: 1, step: 0.01 },
      description: "Outline green color component",
      defaultValue: 0.4,
    },
    outlineColorB: {
      control: { type: "range", min: 0, max: 1, step: 0.01 },
      description: "Outline blue color component",
      defaultValue: 0.2,
    },
    outlineColorA: {
      control: { type: "range", min: 0, max: 1, step: 0.01 },
      description: "Outline alpha component",
      defaultValue: 1,
    },
    cameraZoom: {
      control: { type: "range", min: 0.01, max: 2, step: 0.01 },
      description: "Camera zoom level",
      defaultValue: 0.1,
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
type Story = StoryObj<ArcanvasSceneArgs>;

function render(args: ArcanvasSceneArgs, id: string): HTMLElement {
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

  // Create grid if enabled
  if (args.showGrid) {
    const grid = new GridObject({
      plane: "XY",
      cellSize: args.gridCellSize,
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

  // Create hexagon polygon
  const hexPoints: number[][] = [];
  const cx = 0;
  const cy = 0;
  const r = args.polygonRadius;
  for (let i = 0; i < 6; i++) {
    const theta = (i / 6) * 2 * Math.PI;
    hexPoints.push([cx + r * Math.cos(theta), cy + r * Math.sin(theta)]);
  }

  const polygonFill = new Polygon2DObject(
    hexPoints,
    { zIndex: 0 },
    new UnlitColorMaterial({
      baseColor: [args.polygonColorR, args.polygonColorG, args.polygonColorB, args.polygonColorA],
    })
  );
  polygonFill.name = "TestPolygonFill";
  scene.addObject(polygonFill);

  // Create outline polygon (rectangle)
  const outlinePoints = [-30, -20, 0, 30, -20, 0, 30, 20, 0, -30, 20, 0];
  const polygonOutline = new PolygonObject(
    outlinePoints,
    new UnlitColorMaterial({
      baseColor: [args.outlineColorR, args.outlineColorG, args.outlineColorB, args.outlineColorA],
    })
  );
  polygonOutline.name = "TestPolygonOutline";
  scene.addObject(polygonOutline);

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

export const Default: Story = {
  render: (args) => render(args, "default"),
  args: {
    showGrid: true,
    gridCellSize: 1,
    polygonRadius: 20,
    polygonColorR: 0.2,
    polygonColorG: 0.7,
    polygonColorB: 0.9,
    polygonColorA: 1,
    outlineColorR: 1,
    outlineColorG: 0.4,
    outlineColorB: 0.2,
    outlineColorA: 1,
    cameraZoom: 0.1,
    canvasWidth: 800,
    canvasHeight: 600,
  },
};

export const NoGrid: Story = {
  render: (args) => render(args, "no-grid"),
  args: {
    ...Default.args!,
    showGrid: false,
  },
};

export const ZoomedIn: Story = {
  render: (args) => render(args, "zoomed-in"),
  args: {
    ...Default.args!,
    cameraZoom: 0.5,
  },
};
