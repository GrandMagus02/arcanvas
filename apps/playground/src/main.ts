import { Arcanvas, AutoResizePlugin, Camera, Camera2DController, Plane } from "@arcanvas/core";

const canvas = document.getElementById("c") as HTMLCanvasElement | null;
if (!canvas) {
  throw new Error("Canvas element not found");
}

const arc = new Arcanvas(canvas, {
  width: 800,
  height: 600,
});
arc.use(AutoResizePlugin);

// Test type-safe events
arc.on("resize", (width: number, height: number) => {
  console.log(`Canvas resized to ${width}x${height}`);
});

arc.on("focus", () => {
  console.log("Canvas focused");
});

arc.on("blur", () => {
  console.log("Canvas blurred");
});

arc.start();

// Create a simple colored rectangle using Plane (3D coordinates)
// Rectangle: 2x1.5 units, centered at origin (smaller to fit in camera view)
const rectangle = new Plane([
  // First triangle
  -1,
  -0.75,
  0, // bottom-left
  1,
  -0.75,
  0, // bottom-right
  1,
  0.75,
  0, // top-right
  // Second triangle
  -1,
  -0.75,
  0, // bottom-left
  1,
  0.75,
  0, // top-right
  -1,
  0.75,
  0, // top-left
]);
rectangle.name = "TestRectangle";
arc.stage.add(rectangle);

// Create and set camera first (this ensures arcanvas is properly set)
const camera = new Camera(arc);
arc.setCamera(camera);

// Create and attach 2D camera controller for pan and zoom
// Note: camera.arcanvas should be set by setCamera() call above
const cameraController = new Camera2DController();

console.log("[Playground] Setting up camera controller...");
console.log("[Playground] Camera:", camera);
console.log("[Playground] Camera arcanvas:", camera.arcanvas);
console.log("[Playground] Canvas:", camera.arcanvas?.canvas);

cameraController.attach(camera);
console.log("[Playground] Controller attached");

cameraController.enable();
console.log("[Playground] Controller enabled:", cameraController.isEnabled());
console.log("[Playground] Controller zoom:", cameraController.zoom);

// Verify canvas can receive events
const testCanvas = camera.arcanvas?.canvas;
if (testCanvas) {
  testCanvas.addEventListener(
    "mousedown",
    (e) => {
      console.log("[Playground] Canvas mousedown detected at:", e.clientX, e.clientY);
    },
    { once: true }
  );
  testCanvas.addEventListener(
    "wheel",
    (e) => {
      console.log("[Playground] Canvas wheel detected, deltaY:", e.deltaY);
    },
    { once: true, passive: false }
  );
  console.log("[Playground] Canvas event listeners test attached");
}

// Debug info display system
/**
 * Manages debug information display including FPS, cursor position, camera state, etc.
 */
class DebugInfo {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private fps: number = 0;
  private frameCount: number = 0;
  private lastTime: number = performance.now();
  private cursorX: number = 0;
  private cursorY: number = 0;
  private cameraPos: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 };
  private cameraZoom: number = 1;
  private canvasSize: { width: number; height: number } = { width: 0, height: 0 };
  private infoProviders: Map<string, () => string> = new Map();
  private camera: Camera | null = null;
  private cameraController: Camera2DController | null = null;

  constructor(containerId: string, canvasElement: HTMLCanvasElement) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Debug info container not found: ${containerId}`);
    }
    this.container = container;
    this.canvas = canvasElement;

    // Register default info providers
    this.registerInfo("FPS", () => this.fps.toFixed(1));
    this.registerInfo("Cursor", () => `${this.cursorX.toFixed(0)}, ${this.cursorY.toFixed(0)}`);
    this.registerInfo("Camera Position", () => `(${this.cameraPos.x.toFixed(2)}, ${this.cameraPos.y.toFixed(2)}, ${this.cameraPos.z.toFixed(2)})`);
    this.registerInfo("Camera Zoom", () => this.cameraZoom.toFixed(3));
    this.registerInfo("Canvas Size", () => `${this.canvasSize.width}x${this.canvasSize.height}`);

    // Track cursor position (use capture phase to not interfere with controller)
    this.canvas.addEventListener(
      "mousemove",
      (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this.cursorX = e.clientX - rect.left;
        this.cursorY = e.clientY - rect.top;
      },
      { capture: false, passive: true }
    );

    // Track canvas size
    this.updateCanvasSize();

    // Start update loop
    this.update();
  }

  setCamera(camera: Camera, controller: Camera2DController): void {
    this.camera = camera;
    this.cameraController = controller;
  }

  /**
   * Register a new info provider that will be displayed in the debug panel.
   * @param label - The label for this info item
   * @param provider - Function that returns the string value to display
   */
  registerInfo(label: string, provider: () => string): void {
    this.infoProviders.set(label, provider);
  }

  private updateCanvasSize(): void {
    this.canvasSize.width = this.canvas.width;
    this.canvasSize.height = this.canvas.height;
  }

  private update(): void {
    // Calculate FPS
    this.frameCount++;
    const now = performance.now();
    const delta = now - this.lastTime;

    if (delta >= 1000) {
      this.fps = (this.frameCount * 1000) / delta;
      this.frameCount = 0;
      this.lastTime = now;
    }

    // Update camera info
    if (this.camera) {
      try {
        const pos = this.camera.position;
        this.cameraPos = { x: pos.x, y: pos.y, z: pos.z };
      } catch (error) {
        console.error("[DebugInfo] Error reading camera position:", error);
        this.cameraPos = { x: 0, y: 0, z: 0 };
      }
    }

    if (this.cameraController) {
      this.cameraZoom = this.cameraController.zoom;
    }

    // Update canvas size
    this.updateCanvasSize();

    // Render debug info
    this.render();

    requestAnimationFrame(() => this.update());
  }

  private render(): void {
    let html = "";
    this.infoProviders.forEach((provider, label) => {
      try {
        const value = provider();
        html += `<div class="debug-section"><span class="debug-label">${label}:</span><span class="debug-value">${value}</span></div>`;
      } catch {
        html += `<div class="debug-section"><span class="debug-label">${label}:</span><span class="debug-value">Error</span></div>`;
      }
    });
    this.container.innerHTML = html;
  }
}

// Initialize debug info
const debugInfo = new DebugInfo("debug-info", canvas);
debugInfo.setCamera(camera, cameraController);

// Add keyboard controls
document.addEventListener("keydown", (e) => {
  if (e.key === "r" || e.key === "R") {
    // Test resize event
    const newWidth = Math.floor(Math.random() * 400) + 400;
    const newHeight = Math.floor(Math.random() * 300) + 300;
    arc.resize(newWidth, newHeight);
    console.log(`Manual resize to ${newWidth}x${newHeight}`);
  }
});

console.log("Playground ready! Press 'R' to test resize events.");
console.log("Drag mouse to pan, scroll wheel to zoom.");
