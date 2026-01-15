import { Arcanvas, AutoResizePlugin } from "@arcanvas/core";
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

arc.start();

// Setup scene
const rectangle = setupScene(arc);
console.log("[Main] Rectangle:", rectangle);
console.log("[Main] Stage children:", arc.stage.children);

// Setup camera
const { camera, controller } = setupCamera(arc);

// Initialize debug info
const debugInfo = new DebugInfo("debug-info", canvas);
debugInfo.setCamera(camera, controller);

// Setup keyboard controls
setupKeyboardControls(arc);

console.log("Playground ready! Press 'R' to test resize events.");
console.log("Drag mouse to pan, scroll wheel to zoom.");
