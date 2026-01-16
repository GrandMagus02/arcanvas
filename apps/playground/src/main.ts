import { Arcanvas, AutoResizePlugin, EngineRenderSystem, WorldEngineRenderSystem, type Camera, type WorldCamera, type Scene, type WorldScene } from "@arcanvas/core";
import { DebugInfo } from "./DebugInfo";
import { setupCamera } from "./setupCamera";
import { setupWorldCamera } from "./setupWorldCamera";
import { setupArcanvasEvents, setupKeyboardControls } from "./setupEvents";
import { setupScene } from "./setupScene";
import { setupWorldScene } from "./setupWorldScene";

// Check if we should use world coordinates mode
// Add ?world=true to the URL to enable
const urlParams = new URLSearchParams(window.location.search);
const useWorldCoords = urlParams.get("world") === "true";

const canvas = document.getElementById("c") as HTMLCanvasElement | null;
if (!canvas) {
  throw new Error("Canvas element not found");
}

const arc = new Arcanvas(canvas, {
  width: 800,
  height: 600,
});
arc.use(AutoResizePlugin);

// Setup events
setupArcanvasEvents(arc);

// Setup scene and camera based on mode
let scene: Scene | WorldScene;
let camera: Camera | WorldCamera;
let controller: ReturnType<typeof setupCamera>["controller"];
let renderSystem: EngineRenderSystem | WorldEngineRenderSystem;

if (useWorldCoords) {
  // World coordinates mode - uses floating origin / camera-relative rendering
  console.log("[Main] Using WORLD COORDINATES mode (floating origin)");
  scene = setupWorldScene(arc);
  const worldSetup = setupWorldCamera(arc);
  camera = worldSetup.camera;
  controller = worldSetup.controller;
  renderSystem = new WorldEngineRenderSystem(canvas, scene as WorldScene, camera, { backend: "webgl" });
} else {
  // Standard mode - uses regular coordinates
  console.log("[Main] Using STANDARD mode");
  scene = setupScene(arc);
  const standardSetup = setupCamera(arc);
  camera = standardSetup.camera;
  controller = standardSetup.controller;
  renderSystem = new EngineRenderSystem(canvas, scene, camera, { backend: "webgl" });
}

console.log("[Main] Scene:", scene);

// Keep scene viewport in sync with canvas size
arc.on("resize", (width, height) => {
  const w = typeof width === "number" ? width : canvas.width;
  const h = typeof height === "number" ? height : canvas.height;
  scene.viewport = { width: w, height: h };
});

// Render loop for engine renderer
const frame = () => {
  renderSystem.renderOnce();
  requestAnimationFrame(frame);
};
requestAnimationFrame(frame);

// Initialize debug info
const debugInfo = new DebugInfo("debug-info", canvas);
debugInfo.setCamera(camera as Camera, controller);

// Setup keyboard controls
setupKeyboardControls(arc);

console.log("Playground ready! Press 'R' to test resize events.");
console.log("Drag mouse to pan, scroll wheel to zoom.");
if (useWorldCoords) {
  console.log("WORLD COORDINATES mode enabled - camera can navigate to huge coordinates without precision loss!");
  console.log("Try pressing keys to move camera to extreme positions.");
} else {
  console.log("Add ?world=true to URL to enable world coordinates mode.");
}
