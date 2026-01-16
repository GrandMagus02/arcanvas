import { Arcanvas, AutoResizePlugin, EngineRenderSystem } from "@arcanvas/core";
import { DebugInfo } from "./DebugInfo";
import { setupCamera } from "./setupCamera";
import { setupArcanvasEvents, setupKeyboardControls } from "./setupEvents";
import { setupScene } from "./setupScene";

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

// Setup scene
const scene = setupScene(arc);
console.log("[Main] Engine Scene:", scene);

// Setup camera
const { camera, controller } = setupCamera(arc);

// Engine-level renderer (new pipeline)
// TODO: remove eslint disables once engine exports are fully typed in playground build.
const engineRenderSystem = new EngineRenderSystem(canvas, scene, camera, { backend: "webgl" });

// Keep scene viewport in sync with canvas size
arc.on("resize", (width, height) => {
  const w = typeof width === "number" ? width : canvas.width;
  const h = typeof height === "number" ? height : canvas.height;
  scene.viewport = { width: w, height: h };
});

// Render loop for engine renderer
const frame = () => {
  engineRenderSystem.renderOnce();
  requestAnimationFrame(frame);
};
requestAnimationFrame(frame);

// Initialize debug info
const debugInfo = new DebugInfo("debug-info", canvas);
debugInfo.setCamera(camera, controller);

// Setup keyboard controls
setupKeyboardControls(arc);

console.log("Playground ready! Press 'R' to test resize events.");
console.log("Drag mouse to pan, scroll wheel to zoom.");
