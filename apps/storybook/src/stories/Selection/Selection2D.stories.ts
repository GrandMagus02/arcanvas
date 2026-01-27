import { Arcanvas, AutoResizePlugin, Camera, Camera2DController, EngineRenderSystem } from "@arcanvas/core";
import { HandleRenderer2D, Polygon2DObject } from "@arcanvas/feature-2d";
import { UnlitColorMaterial } from "@arcanvas/graphics";
import { normalizeEvent } from "@arcanvas/interaction";
import { InputState } from "@arcanvas/interaction";
import { Entity, Scene } from "@arcanvas/scene";
import type { Meta, StoryObj } from "@storybook/html";
import { SelectionTool, ToolManager } from "@arcanvas/tools";
import { SelectionManager } from "@arcanvas/selection";

interface Selection2DArgs {
  handleStyle: "photoshop" | "konva";
  showInfo: boolean;
  cameraZoom: number;
  objectCount: number;
}

const cleanupMap = new Map<string, () => void>();

const meta: Meta<Selection2DArgs> = {
  title: "Selection/Selection2D",
  tags: ["autodocs"],
  parameters: {
    docs: {
      source: {
        type: "code",
        language: "typescript",
      },
    },
  },
  args: {
    handleStyle: "photoshop",
    showInfo: true,
    cameraZoom: 1,
    objectCount: 3,
  },
  argTypes: {
    handleStyle: {
      control: "select",
      options: ["photoshop", "konva"],
      description: "Handle style",
    },
    showInfo: {
      control: "boolean",
      description: "Show selection info panel",
    },
    cameraZoom: {
      control: { type: "range", min: 0.1, max: 2, step: 0.1 },
      description: "Camera zoom level",
    },
    objectCount: {
      control: { type: "range", min: 1, max: 5, step: 1 },
      description: "Number of objects to create",
    },
  },
};

export default meta;
type Story = StoryObj<Selection2DArgs>;

/**
 * Creates a polygon shape (hexagon).
 */
function createHexagonPoints(centerX: number, centerY: number, radius: number): number[][] {
  const points: number[][] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * 2 * Math.PI;
    points.push([centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle)]);
  }
  return points;
}

/**
 * Creates a rectangle polygon.
 */
function createRectanglePoints(x: number, y: number, width: number, height: number): number[][] {
  return [
    [x, y],
    [x + width, y],
    [x + width, y + height],
    [x, y + height],
  ];
}

/**
 * Renders the selection 2D story.
 */
function render(args: Selection2DArgs, id: string): HTMLElement {
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
  container.style.fontFamily = "system-ui, -apple-system, sans-serif";

  // Info panel
  const infoPanel = document.createElement("div");
  infoPanel.style.cssText = `
    display: ${args.showInfo ? "block" : "none"};
    padding: 10px;
    background: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 12px;
    flex-shrink: 0;
  `;
  infoPanel.innerHTML = `
    <div><strong>Selection Controls:</strong></div>
    <div>• Click on objects to select them</div>
    <div>• Hold Shift/Cmd to multi-select</div>
    <div>• Click and drag handles to resize</div>
    <div>• Click and drag selected objects to move</div>
    <div>• Click empty space to deselect</div>
    <div id="selection-info" style="margin-top: 8px; color: #666;"></div>
  `;
  container.appendChild(infoPanel);

  const canvasWrapper = document.createElement("div");
  canvasWrapper.style.flex = "1 1 auto";
  canvasWrapper.style.minHeight = "0";
  canvasWrapper.style.display = "flex";
  canvasWrapper.style.border = "1px solid #ddd";
  canvasWrapper.style.borderRadius = "4px";
  container.appendChild(canvasWrapper);

  const canvas = document.createElement("canvas");
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.display = "block";
  canvasWrapper.appendChild(canvas);

  // Create overlay canvas for handles and selection outline
  const overlayCanvas = document.createElement("canvas");
  overlayCanvas.style.position = "absolute";
  overlayCanvas.style.top = "0";
  overlayCanvas.style.left = "0";
  overlayCanvas.style.width = "100%";
  overlayCanvas.style.height = "100%";
  overlayCanvas.style.pointerEvents = "none";
  overlayCanvas.width = canvas.width || 800;
  overlayCanvas.height = canvas.height || 600;
  canvasWrapper.style.position = "relative";
  canvasWrapper.appendChild(overlayCanvas);

  // Initialize Arcanvas
  const arc = new Arcanvas(canvas);
  arc.use(AutoResizePlugin);

  // Create scene
  const scene = new Scene({ width: canvas.width || 800, height: canvas.height || 600 });

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

  // Create selection system
  const selectionManager = new SelectionManager();
  const handleRenderer = new HandleRenderer2D();
  // Set up Canvas2D context for handle rendering
  const overlayCtx = overlayCanvas.getContext("2d");
  if (overlayCtx) {
    handleRenderer.canvasContext = overlayCtx;
  }
  
  const selectionTool = new SelectionTool({
    camera,
    selectionManager,
    handleRenderer,
  });
  const toolManager = new ToolManager();
  toolManager.register(selectionTool);
  toolManager.setActiveTool(selectionTool);

  // Create objects
  const objects: Polygon2DObject[] = [];
  const colors = [
    [0.2, 0.7, 0.9, 1], // Blue
    [0.9, 0.2, 0.5, 1], // Pink
    [0.2, 0.9, 0.4, 1], // Green
    [0.9, 0.7, 0.2, 1], // Yellow
    [0.6, 0.2, 0.9, 1], // Purple
  ];

  for (let i = 0; i < args.objectCount; i++) {
    const x = 100 + (i % 3) * 200;
    const y = 100 + Math.floor(i / 3) * 200;
    const color = colors[i % colors.length] as [number, number, number, number];

    let polygon: Polygon2DObject;
    if (i % 2 === 0) {
      // Hexagon
      const points = createHexagonPoints(x, y, 50);
      polygon = new Polygon2DObject(points, {}, new UnlitColorMaterial({ baseColor: color }));
    } else {
      // Rectangle
      const points = createRectanglePoints(x - 40, y - 30, 80, 60);
      polygon = new Polygon2DObject(points, {}, new UnlitColorMaterial({ baseColor: color }));
    }

    polygon.name = `Object${i + 1}`;
    objects.push(polygon);

    // Wrap Polygon2DObject in an Entity to add to scene
    const entity = new Entity(polygon.name, polygon.id);
    // Attach the render object properties to the entity
    (entity as unknown as { mesh: unknown; material: unknown; transform: unknown }).mesh = polygon.mesh;
    (entity as unknown as { mesh: unknown; material: unknown; transform: unknown }).material = polygon.material;
    (entity as unknown as { mesh: unknown; material: unknown; transform: unknown }).transform = polygon.transform;
    
    scene.addObject(entity);

    // Register with selection tool
    selectionTool.registerSelectable(polygon);
  }

  // Update selection info
  const updateSelectionInfo = () => {
    const infoElement = infoPanel.querySelector("#selection-info");
    if (infoElement) {
      const selected = selectionManager.getSelected();
      if (selected.length === 0) {
        infoElement.textContent = "No selection";
      } else {
        const names = selected.map((obj) => obj.name || obj.id).join(", ");
        infoElement.textContent = `Selected: ${names} (${selected.length} object${selected.length > 1 ? "s" : ""})`;
      }
    }
  };

  // Set up selection change callback
  selectionManager.setSelectionChangeCallback(() => {
    updateSelectionInfo();
  });

  // Set up input handling
  const inputState = new InputState();
  const handleInputEvent = (e: Event) => {
    // Only handle mouse/pointer events for selection tool
    // Let the camera controller handle its own events directly
    if (e.type.startsWith("mouse") || e.type.startsWith("pointer") || e.type.startsWith("touch")) {
      const normalized = normalizeEvent(e, canvas);
      if (normalized) {
        inputState.update(normalized);
        toolManager.handleInput(normalized, inputState);
      }
    }
  };

  // Add event listeners - selection tool handles events, but only stops propagation
  // when it actually selects something, allowing camera to pan on empty space
  // Note: Camera controller attaches its own listeners when enabled, so both will receive events
  canvas.addEventListener("mousedown", handleInputEvent);
  canvas.addEventListener("mousemove", handleInputEvent);
  canvas.addEventListener("mouseup", handleInputEvent);
  canvas.addEventListener("pointerdown", handleInputEvent);
  canvas.addEventListener("pointermove", handleInputEvent);
  canvas.addEventListener("pointerup", handleInputEvent);
  canvas.addEventListener("touchstart", handleInputEvent, { passive: false });
  canvas.addEventListener("touchmove", handleInputEvent, { passive: false });
  canvas.addEventListener("touchend", handleInputEvent, { passive: false });

  // Handle resize
  arc.on("resize", () => {
    scene.viewport = { width: canvas.width, height: canvas.height };
    overlayCanvas.width = canvas.width;
    overlayCanvas.height = canvas.height;
  });

  // Render loop
  let animationFrameId: number;
  const frame = () => {
    renderSystem.renderOnce();
    
    // Clear overlay and render selection handles/outline
    if (overlayCtx) {
      overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
      selectionTool.renderHandles({
        camera,
        viewport: { width: canvas.width || 800, height: canvas.height || 600 },
      });
    }
    
    animationFrameId = requestAnimationFrame(frame);
  };
  frame();

  // Cleanup
  const cleanup = () => {
    if (animationFrameId !== undefined) {
      cancelAnimationFrame(animationFrameId);
    }
    canvas.removeEventListener("mousedown", handleInputEvent);
    canvas.removeEventListener("mousemove", handleInputEvent);
    canvas.removeEventListener("mouseup", handleInputEvent);
    canvas.removeEventListener("pointerdown", handleInputEvent);
    canvas.removeEventListener("pointermove", handleInputEvent);
    canvas.removeEventListener("pointerup", handleInputEvent);
    canvas.removeEventListener("touchstart", handleInputEvent);
    canvas.removeEventListener("touchmove", handleInputEvent);
    canvas.removeEventListener("touchend", handleInputEvent);
  };

  cleanupMap.set(id, cleanup);
  updateSelectionInfo();

  return container;
}

export const Default: Story = {
  render: (args) => render(args, "default"),
};

export const MultipleObjects: Story = {
  args: {
    objectCount: 5,
    showInfo: true,
  },
  render: (args) => render(args, "multiple"),
};

export const KonvaStyle: Story = {
  args: {
    handleStyle: "konva",
    showInfo: true,
  },
  render: (args) => render(args, "konva"),
};
