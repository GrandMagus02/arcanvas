import { Arcanvas, Camera2DController, WorldCamera, Camera } from "@arcanvas/core";

/**
 * WorldCamera setup result interface.
 */
export interface WorldCameraSetup {
  camera: WorldCamera;
  controller: Camera2DController;
}

/**
 * Setup world camera and controller.
 *
 * The WorldCamera stores its position in double-precision (JS number),
 * allowing the camera to be positioned at extremely large coordinates
 * without precision issues.
 */
export function setupWorldCamera(arc: Arcanvas): WorldCameraSetup {
  // Create WorldCamera which stores position in double precision
  const camera = new WorldCamera(arc);
  camera.pixelsPerUnit = 100; // 1 unit = 100 pixels at zoom 1

  // Set camera on arcanvas (for resize events etc)
  // Note: setCamera expects Camera, but WorldCamera has compatible interface
  // WorldCamera has the same methods as Camera (view, projection, position, etc.)
  arc.setCamera(camera as unknown as Camera);

  // Create and attach 2D camera controller for pan and zoom
  // The controller works with WorldCamera the same way it works with Camera
  const controller = new Camera2DController();
  controller.zoom = 0.1;

  console.log("[WorldCamera] Setting up camera controller...");
  console.log("[WorldCamera] Camera world position:", camera.worldPosition);

  // WorldCamera has compatible interface with Camera for the controller
  controller.attach(camera as unknown as Camera);
  console.log("[WorldCamera] Controller attached");

  controller.enable();
  console.log("[WorldCamera] Controller enabled:", controller.isEnabled());
  console.log("[WorldCamera] Controller zoom:", controller.zoom);

  // Test: Log camera position after some moves would happen at large coordinates
  const testMoveLog = () => {
    console.log("[WorldCamera] Current world position:", camera.worldPosition);
    console.log("[WorldCamera] Position ref (raw):", camera.worldPositionRef);
  };

  // Add debug logging for moves
  camera.on("move", () => {
    // Only log occasionally to avoid spam
    if (Math.random() < 0.01) {
      testMoveLog();
    }
  });

  return { camera, controller };
}
