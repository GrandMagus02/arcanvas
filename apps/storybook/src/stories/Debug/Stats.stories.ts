import { Arcanvas, AutoResizePlugin, Camera, Camera2DController, EngineRenderSystem } from "@arcanvas/core";
import { GridObject } from "@arcanvas/feature-2d";
import { Scene } from "@arcanvas/scene";
import type { Meta, StoryObj } from "@storybook/html";

interface StatsArgs {
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
  container.style.overflow = "hidden";
  container.style.gap = "10px";
  container.style.padding = "10px";

  const canvasWrapper = document.createElement("div");
  canvasWrapper.style.flex = "1 1 auto";
  canvasWrapper.style.minHeight = "0";
  canvasWrapper.style.display = "flex";
  container.appendChild(canvasWrapper);

  const canvas = document.createElement("canvas");
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.display = "block";
  canvasWrapper.appendChild(canvas);

  // Create stats display
  const statsContainer = document.createElement("div");
  statsContainer.style.width = "100%";
  statsContainer.style.minHeight = "60px";
  statsContainer.style.backgroundColor = "#1a1a1a";
  statsContainer.style.color = "#0f0";
  statsContainer.style.fontFamily = "monospace";
  statsContainer.style.fontSize = "12px";
  statsContainer.style.padding = "10px";
  statsContainer.style.border = "1px solid #333";
  statsContainer.style.display = args.showStats ? "block" : "none";
  statsContainer.style.flexShrink = "0";
  container.appendChild(statsContainer);

  // Initialize Arcanvas
  const arc = new Arcanvas(canvas);
  arc.use(AutoResizePlugin);

  // Create scene - will be updated on resize
  const scene = new Scene({ width: canvas.width || 800, height: canvas.height || 600 });

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

  scene.viewport = { width: canvas.width || 800, height: canvas.height || 600 };

  arc.on("resize", () => {
    scene.viewport = { width: canvas.width, height: canvas.height };
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
    showGrid: true,
    showStats: true,
    cameraZoom: 0.1,
  },
};

export const NoStats: Story = {
  render: (args) => render(args, "no-stats"),
  args: {
    showGrid: true,
    showStats: false,
    cameraZoom: 0.1,
  },
};
