import type { Meta, StoryObj } from "@storybook/html";
import { Arcanvas, Camera, Camera2DController, EngineRenderSystem } from "@arcanvas/core";
import { GridObject } from "@arcanvas/feature-2d";
import { Scene } from "@arcanvas/scene";

interface StatsArgs {
  canvasWidth: number;
  canvasHeight: number;
  showGrid: boolean;
  showStats: boolean;
  cameraZoom: number;
}

const cleanupMap = new Map<string, () => void>();

const meta: Meta<StatsArgs> = {
  title: "Debug/Stats/FrameStats",
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
      description: "Show grid",
      defaultValue: true,
    },
    showStats: {
      control: "boolean",
      description: "Show frame statistics",
      defaultValue: true,
    },
    cameraZoom: {
      control: { type: "range", min: 0.01, max: 2, step: 0.01 },
      description: "Camera zoom level",
      defaultValue: 0.1,
    },
  },
};

export default meta;
type Story = StoryObj<StatsArgs>;

/**
 * Renders the stats debug story.
 */
function render(args: StatsArgs, id: string): HTMLElement {
  const existingCleanup = cleanupMap.get(id);
  if (existingCleanup) {
    existingCleanup();
    cleanupMap.delete(id);
  }

  const container = document.createElement("div");
  container.style.width = "100%";
  container.style.height = "100vh";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.justifyContent = "center";
  container.style.alignItems = "center";
  container.style.overflow = "hidden";
  container.style.gap = "10px";
  container.style.padding = "10px";

  const canvas = document.createElement("canvas");
  canvas.width = args.canvasWidth;
  canvas.height = args.canvasHeight;
  canvas.style.border = "1px solid #ccc";
  canvas.style.display = "block";
  container.appendChild(canvas);

  // Create stats display
  const statsContainer = document.createElement("div");
  statsContainer.style.width = `${args.canvasWidth}px`;
  statsContainer.style.minHeight = "60px";
  statsContainer.style.backgroundColor = "#1a1a1a";
  statsContainer.style.color = "#0f0";
  statsContainer.style.fontFamily = "monospace";
  statsContainer.style.fontSize = "12px";
  statsContainer.style.padding = "10px";
  statsContainer.style.border = "1px solid #333";
  statsContainer.style.display = args.showStats ? "block" : "none";
  container.appendChild(statsContainer);

  const updateCanvasSize = () => {
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight - (args.showStats ? 80 : 0);
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

  // Frame statistics
  let frameCount = 0;
  let fps = 0;
  let lastFpsUpdate = performance.now();

  // Update stats display
  const updateStats = () => {
    if (!args.showStats) return;

    const now = performance.now();
    frameCount++;

    // Update FPS every second
    if (now - lastFpsUpdate >= 1000) {
      fps = Math.round((frameCount * 1000) / (now - lastFpsUpdate));
      frameCount = 0;
      lastFpsUpdate = now;
    }

    const objectCount = scene.entities.length;
    const drawCalls = objectCount; // Simplified - in real implementation, this would come from renderer

    statsContainer.innerHTML = `
      <div>FPS: ${fps}</div>
      <div>Objects: ${objectCount}</div>
      <div>Draw Calls: ${drawCalls}</div>
      <div>Canvas: ${canvas.width}x${canvas.height}</div>
      <div>Zoom: ${controller.zoom.toFixed(3)}</div>
    `;
  };

  // Render loop
  let animationFrameId: number;
  const frame = () => {
    renderSystem.renderOnce();
    updateStats();
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
    showGrid: true,
    showStats: true,
    cameraZoom: 0.1,
  },
};

export const NoStats: Story = {
  render: (args) => render(args, "no-stats"),
  args: {
    canvasWidth: 800,
    canvasHeight: 600,
    showGrid: true,
    showStats: false,
    cameraZoom: 0.1,
  },
};
