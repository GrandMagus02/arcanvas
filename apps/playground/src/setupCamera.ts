import { Arcanvas, Camera, Camera2DController } from "@arcanvas/core";

/**
 * Camera setup result interface.
 */
export interface CameraSetup {
  camera: Camera;
  controller: Camera2DController;
}

/**
 * Setup camera and controller.
 */
export function setupCamera(arc: Arcanvas): CameraSetup {
  // Create and set camera first (this ensures arcanvas is properly set)
  const camera = new Camera(arc);
  camera.pixelsPerUnit = 100; // 1 unit = 100 pixels at zoom 1
  arc.setCamera(camera);

  // Create and attach 2D camera controller for pan and zoom
  const controller = new Camera2DController();
  controller.zoom = 0.1;

  console.log("[Playground] Setting up camera controller...");
  console.log("[Playground] Camera:", camera);
  console.log("[Playground] Camera arcanvas:", camera.arcanvas);
  console.log("[Playground] Canvas:", camera.arcanvas?.canvas);

  controller.attach(camera);
  console.log("[Playground] Controller attached");

  controller.enable();
  console.log("[Playground] Controller enabled:", controller.isEnabled());
  console.log("[Playground] Controller zoom:", controller.zoom);

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

  return { camera, controller };
}
