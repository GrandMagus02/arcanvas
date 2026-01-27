import { Arcanvas, AutoResizePlugin, Camera, Camera2DController, EngineRenderSystem } from "@arcanvas/core";
import { HandleRenderer2D, Polygon2DObject } from "@arcanvas/feature-2d";
import { UnlitColorMaterial } from "@arcanvas/graphics";
import { InputState, normalizeEvent } from "@arcanvas/interaction";
import { Entity, Scene } from "@arcanvas/scene";
import { SelectionManager } from "@arcanvas/selection";
import { SelectionTool, ToolManager } from "@arcanvas/tools";
import type { Meta, StoryObj } from "@storybook/html";

interface HandleTransformationsArgs {
  showTransformInfo: boolean;
  cameraZoom: number;
  enableRotation: boolean;
}

const cleanupMap = new Map<string, () => void>();

const meta: Meta<HandleTransformationsArgs> = {
  title: "Selection/HandleTransformations",
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
    showTransformInfo: true,
    cameraZoom: 1,
    enableRotation: true,
  },
  argTypes: {
    showTransformInfo: {
      control: "boolean",
      description: "Show transform information",
    },
    cameraZoom: {
      control: { type: "range", min: 0.1, max: 2, step: 0.1 },
      description: "Camera zoom level",
    },
    enableRotation: {
      control: "boolean",
      description: "Enable rotation handle (Konva style)",
    },
  },
};

export default meta;
type Story = StoryObj<HandleTransformationsArgs>;

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
 * Renders the handle transformations story.
 */
function render(args: HandleTransformationsArgs, id: string): HTMLElement {
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
    display: ${args.showTransformInfo ? "block" : "none"};
    padding: 10px;
    background: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 12px;
    flex-shrink: 0;
  `;
  infoPanel.innerHTML = `
    <div><strong>Handle Transformations:</strong></div>
    <div>• Select an object to see its handles</div>
    <div>• Drag corner handles to resize proportionally</div>
    <div>• Drag edge handles to resize in one direction</div>
    ${args.enableRotation ? "<div>• Drag rotation handle (top) to rotate</div>" : ""}
    <div id="transform-info" style="margin-top: 8px; color: #666;"></div>
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
    handleStyle: args.enableRotation ? "konva" : "photoshop",
  });
  const toolManager = new ToolManager();
  toolManager.register(selectionTool);
  toolManager.setActiveTool(selectionTool);

  // Create a test object
  const points = createRectanglePoints(300, 200, 150, 100);
  const polygon = new Polygon2DObject(points, {}, new UnlitColorMaterial({ baseColor: [0.2, 0.7, 0.9, 1] }));
  polygon.name = "TestObject";
  
  // Wrap Polygon2DObject in an Entity to add to scene
  const entity = new Entity(polygon.name, polygon.id);
  // Attach the render object properties to the entity
  (entity as unknown as { mesh: unknown; material: unknown; transform: unknown }).mesh = polygon.mesh;
  (entity as unknown as { mesh: unknown; material: unknown; transform: unknown }).material = polygon.material;
  (entity as unknown as { mesh: unknown; material: unknown; transform: unknown }).transform = polygon.transform;
  
  scene.addObject(entity);
  selectionTool.registerSelectable(polygon);

  // Track transform for display
  let currentTransform = {
    x: 0,
    y: 0,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
  };

  // Update transform info
  const updateTransformInfo = () => {
    const infoElement = infoPanel.querySelector("#transform-info");
    if (infoElement) {
      const selected = selectionManager.getSelected();
      if (selected.length === 0) {
        infoElement.textContent = "No object selected";
      } else {
        const bounds = selected[0]!.getBounds();
        if (bounds) {
          const center = bounds.getCenter();
          infoElement.innerHTML = `
            <div>Position: (${center.x.toFixed(1)}, ${center.y.toFixed(1)})</div>
            <div>Size: ${bounds.getWidth().toFixed(1)} × ${bounds.getHeight().toFixed(1)}</div>
            <div>Transform: X=${currentTransform.x.toFixed(1)}, Y=${currentTransform.y.toFixed(1)}, Rot=${currentTransform.rotation.toFixed(1)}°, Scale=${currentTransform.scaleX.toFixed(2)}, ${currentTransform.scaleY.toFixed(2)}</div>
          `;
        }
      }
    }
  };

  // Set up selection change callback
  selectionManager.setSelectionChangeCallback(() => {
    updateTransformInfo();
  });

  // Set up input handling
  const inputState = new InputState();
  const handleInputEvent = (e: Event) => {
    const normalized = normalizeEvent(e, canvas);
    if (normalized) {
      inputState.update(normalized);
      toolManager.handleInput(normalized, inputState);

      // Update transform info on interaction
      if (normalized.type === "mousemove" || normalized.type === "pointermove" || normalized.type === "touchmove") {
        updateTransformInfo();
      }
    }
  };

  // Add event listeners in capture phase so selection tool gets events before camera controller
  canvas.addEventListener("mousedown", handleInputEvent, true);
  canvas.addEventListener("mousemove", handleInputEvent, true);
  canvas.addEventListener("mouseup", handleInputEvent, true);
  canvas.addEventListener("pointerdown", handleInputEvent, true);
  canvas.addEventListener("pointermove", handleInputEvent, true);
  canvas.addEventListener("pointerup", handleInputEvent, true);
  canvas.addEventListener("touchstart", handleInputEvent, { passive: false, capture: true });
  canvas.addEventListener("touchmove", handleInputEvent, { passive: false, capture: true });
  canvas.addEventListener("touchend", handleInputEvent, { passive: false, capture: true });

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
  
  // Auto-select the object for demonstration
  setTimeout(() => {
    selectionManager.select(polygon.id);
    updateTransformInfo();
  }, 100);

  return container;
}

export const Default: Story = {
  render: (args) => render(args, "default"),
};

export const WithRotation: Story = {
  args: {
    enableRotation: true,
    showTransformInfo: true,
  },
  render: (args) => render(args, "rotation"),
};

export const NoRotation: Story = {
  args: {
    enableRotation: false,
    showTransformInfo: true,
  },
  render: (args) => render(args, "no-rotation"),
};
