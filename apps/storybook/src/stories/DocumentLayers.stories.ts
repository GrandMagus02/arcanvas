import type { Meta, StoryObj } from "@storybook/html";
import { Arcanvas, Camera, Camera2DController, EngineRenderSystem, Scene, WebGLRenderContext } from "@arcanvas/core";
import { createDocument, createRasterLayer, BlendMode } from "@arcanvas/document";
import { DocumentView } from "@arcanvas/feature-document-2d";

interface DocumentLayersArgs {
  canvasWidth: number;
  canvasHeight: number;
  layer1Opacity: number;
  layer2Opacity: number;
  layer1BlendMode: string;
  layer2BlendMode: string;
  showLayer1: boolean;
  showLayer2: boolean;
  cameraZoom: number;
}

// Store cleanup functions for each story instance
const cleanupMap = new Map<string, () => void>();

const meta: Meta<DocumentLayersArgs> = {
  title: "Arcanvas/Document Layers",
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
    layer1Opacity: {
      control: { type: "range", min: 0, max: 1, step: 0.01 },
      description: "Layer 1 opacity",
      defaultValue: 1,
    },
    layer2Opacity: {
      control: { type: "range", min: 0, max: 1, step: 0.01 },
      description: "Layer 2 opacity",
      defaultValue: 0.8,
    },
    layer1BlendMode: {
      control: { type: "select" },
      options: ["normal", "multiply", "screen", "overlay"],
      description: "Layer 1 blend mode",
      defaultValue: "normal",
    },
    layer2BlendMode: {
      control: { type: "select" },
      options: ["normal", "multiply", "screen", "overlay"],
      description: "Layer 2 blend mode",
      defaultValue: "normal",
    },
    showLayer1: {
      control: "boolean",
      description: "Show layer 1",
      defaultValue: true,
    },
    showLayer2: {
      control: "boolean",
      description: "Show layer 2",
      defaultValue: true,
    },
    cameraZoom: {
      control: { type: "range", min: 0.01, max: 2, step: 0.01 },
      description: "Camera zoom level",
      defaultValue: 1,
    },
  },
};

export default meta;
type Story = StoryObj<DocumentLayersArgs>;

function renderDocument(args: DocumentLayersArgs, id: string): HTMLElement {
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

  // Create document
  const doc = createDocument(args.canvasWidth, args.canvasHeight);

  // Create background layer (gradient)
  const bgLayer = createRasterLayer(doc, { name: "Background", width: args.canvasWidth, height: args.canvasHeight });
  const ctx = bgLayer.getContext2D();
  if (ctx) {
    const gradient = ctx.createLinearGradient(0, 0, args.canvasWidth, args.canvasHeight);
    gradient.addColorStop(0, "#1a1a2e");
    gradient.addColorStop(1, "#16213e");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, args.canvasWidth, args.canvasHeight);
  }
  bgLayer.opacity = args.layer1Opacity;
  bgLayer.blendMode = args.layer1BlendMode as BlendMode;
  bgLayer.visible = args.showLayer1;
  doc.addLayer(bgLayer);

  // Create foreground layer (circle)
  const fgLayer = createRasterLayer(doc, { name: "Foreground", width: args.canvasWidth, height: args.canvasHeight });
  const fgCtx = fgLayer.getContext2D();
  if (fgCtx) {
    fgCtx.fillStyle = "rgba(255, 100, 100, 0.9)";
    fgCtx.beginPath();
    fgCtx.arc(args.canvasWidth / 2, args.canvasHeight / 2, 100, 0, Math.PI * 2);
    fgCtx.fill();

    fgCtx.fillStyle = "rgba(100, 200, 255, 0.9)";
    fgCtx.beginPath();
    fgCtx.arc(args.canvasWidth / 2 + 150, args.canvasHeight / 2, 80, 0, Math.PI * 2);
    fgCtx.fill();
  }
  fgLayer.opacity = args.layer2Opacity;
  fgLayer.blendMode = args.layer2BlendMode as BlendMode;
  fgLayer.visible = args.showLayer2;
  doc.addLayer(fgLayer);

  // Create scene
  const scene = new Scene({ width: args.canvasWidth, height: args.canvasHeight });

  // Create document view and add to scene
  const documentView = new DocumentView(doc);
  scene.addObject(documentView);

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

  // Update document when args change
  const updateDocument = () => {
    bgLayer.opacity = args.layer1Opacity;
    bgLayer.blendMode = args.layer1BlendMode as BlendMode;
    bgLayer.visible = args.showLayer1;
    bgLayer.markDirty();

    fgLayer.opacity = args.layer2Opacity;
    fgLayer.blendMode = args.layer2BlendMode as BlendMode;
    fgLayer.visible = args.showLayer2;
    fgLayer.markDirty();

    doc.markDirty();
  };

  // Get WebGL context for texture updates
  const gl = canvas.getContext("webgl") || canvas.getContext("webgl2");
  const renderContext = gl ? new WebGLRenderContext(gl as WebGLRenderingContext, null, null, null) : null;

  // Render loop
  let animationFrameId: number;
  const frame = () => {
    updateDocument();
    // Update textures before rendering
    if (renderContext) {
      documentView.updateTextures(renderContext);
    }
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

export const BasicLayers: Story = {
  render: (args) => renderDocument(args, "basic-layers"),
  args: {
    canvasWidth: 800,
    canvasHeight: 600,
    layer1Opacity: 1,
    layer2Opacity: 0.8,
    layer1BlendMode: "normal",
    layer2BlendMode: "normal",
    showLayer1: true,
    showLayer2: true,
    cameraZoom: 1,
  },
};

export const BlendModes: Story = {
  render: (args) => renderDocument(args, "blend-modes"),
  args: {
    ...BasicLayers.args!,
    layer1BlendMode: "normal",
    layer2BlendMode: "multiply",
  },
};

export const OpacityTest: Story = {
  render: (args) => renderDocument(args, "opacity-test"),
  args: {
    ...BasicLayers.args!,
    layer1Opacity: 0.5,
    layer2Opacity: 0.7,
  },
};

export const MultipleLayers: Story = {
  render: (args) => {
    // Cleanup previous instance if it exists
    const existingCleanup = cleanupMap.get("multiple-layers");
    if (existingCleanup) {
      existingCleanup();
      cleanupMap.delete("multiple-layers");
    }

    // Create container
    const container = document.createElement("div");
    container.style.width = "100%";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.justifyContent = "center";
    container.style.alignItems = "center";
    container.style.overflow = "hidden";

    // Calculate responsive canvas size - fill 100% width and height
    const updateCanvasSize = () => {
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      // Fill 100% of container width and height
      canvas.style.width = `${containerWidth}px`;
      canvas.style.height = `${containerHeight}px`;
      canvas.style.maxWidth = "100%";
      canvas.style.maxHeight = "100%";
    };

    // Create canvas
    const canvas = document.createElement("canvas");
    canvas.width = args.canvasWidth;
    canvas.height = args.canvasHeight;
    canvas.style.border = "1px solid #ccc";
    canvas.style.display = "block";
    container.appendChild(canvas);

    // Initial size calculation
    updateCanvasSize();

    // Initialize Arcanvas
    const arc = new Arcanvas(canvas, {
      width: args.canvasWidth,
      height: args.canvasHeight,
    });

    // Create document with multiple layers
    const doc = createDocument(args.canvasWidth, args.canvasHeight);

    // Layer 1: Background gradient
    const layer1 = createRasterLayer(doc, { name: "Background", width: args.canvasWidth, height: args.canvasHeight });
    const ctx1 = layer1.getContext2D();
    if (ctx1) {
      const gradient = ctx1.createLinearGradient(0, 0, args.canvasWidth, args.canvasHeight);
      gradient.addColorStop(0, "#2c3e50");
      gradient.addColorStop(1, "#34495e");
      ctx1.fillStyle = gradient;
      ctx1.fillRect(0, 0, args.canvasWidth, args.canvasHeight);
    }
    doc.addLayer(layer1);

    // Layer 2: Red circle
    const layer2 = createRasterLayer(doc, { name: "Red Circle", width: args.canvasWidth, height: args.canvasHeight });
    const ctx2 = layer2.getContext2D();
    if (ctx2) {
      ctx2.fillStyle = "rgba(255, 0, 0, 0.8)";
      ctx2.beginPath();
      ctx2.arc(args.canvasWidth / 2 - 100, args.canvasHeight / 2, 80, 0, Math.PI * 2);
      ctx2.fill();
    }
    layer2.opacity = 0.8;
    doc.addLayer(layer2);

    // Layer 3: Blue circle
    const layer3 = createRasterLayer(doc, { name: "Blue Circle", width: args.canvasWidth, height: args.canvasHeight });
    const ctx3 = layer3.getContext2D();
    if (ctx3) {
      ctx3.fillStyle = "rgba(0, 0, 255, 0.8)";
      ctx3.beginPath();
      ctx3.arc(args.canvasWidth / 2 + 100, args.canvasHeight / 2, 80, 0, Math.PI * 2);
      ctx3.fill();
    }
    layer3.opacity = 0.8;
    layer3.blendMode = BlendMode.Screen;
    doc.addLayer(layer3);

    // Create scene
    const scene = new Scene({ width: args.canvasWidth, height: args.canvasHeight });

    // Create document view and add to scene
    const documentView = new DocumentView(doc);
    scene.addObject(documentView);

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

    // Keep scene viewport in sync
    arc.on("resize", (width, height) => {
      const w = typeof width === "number" ? width : canvas.width;
      const h = typeof height === "number" ? height : canvas.height;
      scene.viewport = { width: w, height: h };
    });

    // Get WebGL context for texture updates
    const gl = canvas.getContext("webgl") || canvas.getContext("webgl2");
    const renderContext = gl ? new WebGLRenderContext(gl as WebGLRenderingContext, null, null, null) : null;

    // Render loop
    let animationFrameId: number;
    const frame = () => {
      // Update textures before rendering
      if (renderContext) {
        documentView.updateTextures(renderContext);
      }
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

    cleanupMap.set("multiple-layers", cleanup);

    return container;
  },
  args: {
    ...BasicLayers.args!,
  },
};
