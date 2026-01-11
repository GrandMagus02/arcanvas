import { Arcanvas, AutoResizePlugin, GridMesh, Plane } from "@arcanvas/core";
import { Vector3 } from "@arcanvas/vector";

const canvas = document.getElementById("c") as HTMLCanvasElement | null;
if (!canvas) {
  throw new Error("Canvas element not found");
}

const arc = new Arcanvas(canvas, {
  width: 800,
  height: 600,
  focusable: true,
});

arc.use(AutoResizePlugin);
arc.start();

// Add a simple plane mesh (rectangle)
// Plane takes an array of numbers representing x, y, z coordinates
// Creating a rectangle: two triangles forming a quad
const planeVertices = new Float32Array([
  // First triangle
  -1,
  -1,
  0, // bottom-left
  1,
  -1,
  0, // bottom-right
  1,
  1,
  0, // top-right
  // Second triangle
  -1,
  -1,
  0, // bottom-left
  1,
  1,
  0, // top-right
  -1,
  1,
  0, // top-left
]);
const plane = new Plane(Array.from(planeVertices));
if (!plane) {
  console.error("Failed to create plane mesh");
} else {
  console.log("Plane mesh created successfully with", planeVertices.length / 3, "vertices");
}
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
arc.stage.add(plane);

// Add grid with major/minor lines and colored axes
const grid = new GridMesh(new Float32Array([0, 0]));

grid.setPlane("XY");
grid.setAdaptiveSpacing(true);
grid.setCellSize(1.0); // Smaller cell size for better visibility at close range
grid.setMajorDivisions(5); // 5 minor lines per major line for clearer primary lines
grid.setAxisLineWidth(3); // Thicker axis lines for better visibility
grid.setMajorLineWidth(2); // Thicker major lines
grid.setMinorLineWidth(1.5); // Thicker minor lines
grid.setAxisDashScale(1.5);
// Improved color contrast
grid.setBaseColor(0.15, 0.15, 0.15, 1); // Slightly darker base for better contrast
grid.setMinorColor(0.4, 0.4, 0.4, 0.5); // Brighter minor lines with better alpha
grid.setMajorColor(0.7, 0.7, 0.7, 0.8); // Brighter major lines that stand out
grid.setXAxisColor(1, 0, 0, 1); // Red X axis
grid.setXAxisDashColor(0.6, 0, 0, 1);
grid.setYAxisColor(0, 1, 0, 1); // Green Y axis
grid.setYAxisDashColor(0, 0.6, 0, 1);
grid.setZAxisColor(0, 0, 1, 1); // Blue Z axis
grid.setZAxisDashColor(0, 0, 0.6, 1);
grid.setCenterColor(1, 1, 1, 1); // White center
grid.setFixedPixelSize(false); // Scale with zoom for better grid appearance
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
arc.stage.add(grid);
console.log("GridMesh added to stage");

// Get the default camera (created automatically)
// The camera is already set up with a default perspective projection
const defaultCamera = arc.camera;
if (!defaultCamera) {
  console.error("CRITICAL: Default camera is null! Rendering will fail.");
} else {
  console.log("Camera found, initializing...");

  // Get current eye/center to see what they are
  const initialEye = defaultCamera.view.eye;
  const initialCenter = defaultCamera.view.center;
  console.log("Camera initial eye:", initialEye.data[0], initialEye.data[1], initialEye.data[2]);
  console.log("Camera initial center:", initialCenter.data[0], initialCenter.data[1], initialCenter.data[2]);

  // The ViewMatrix needs eye and center to be different
  // Set center to origin (where our meshes are) and eye back on Z
  // This fixes the view matrix which breaks when eye == center
  const center = new Vector3(new Float32Array([0, 0, 0]));
  // Set eye to at least 5.0 distance to prevent singular matrices (required for grid rendering)
  // Use 5.0 to ensure we're well above the minimum of 2.0
  const eye = new Vector3(new Float32Array([0, 0, 5.0]));

  // Set eye and center BEFORE any rotation calculations
  // This ensures the view matrix is set up correctly
  defaultCamera.view.center = center;
  defaultCamera.view.eye = eye;
  // Force update to ensure the view matrix is computed
  defaultCamera.view.update();

  // Verify the eye was set correctly
  const verifyEye = defaultCamera.view.eye;
  console.log("Camera eye after setting:", verifyEye.data[0], verifyEye.data[1], verifyEye.data[2]);

  // Force view matrix update to ensure it's valid
  // The ViewMatrix.update() is called automatically when eye/center are set
  // But we verify it's valid
  const viewData = defaultCamera.view.data;
  const viewMatrixArray = Array.from(viewData);
  const hasNaN = viewMatrixArray.some((v) => isNaN(v) || !isFinite(v));
  if (hasNaN) {
    console.error("View matrix contains NaN or Infinity after setting eye/center!", viewMatrixArray);
    // Try to fix by ensuring eye and center are different
    const fixedEye = new Vector3(new Float32Array([0, 0, 5]));
    const fixedCenter = new Vector3(new Float32Array([0, 0, 0]));
    defaultCamera.view.eye = fixedEye;
    defaultCamera.view.center = fixedCenter;
    // Check again
    const fixedViewData = defaultCamera.view.data;
    const fixedViewArray = Array.from(fixedViewData);
    const stillHasNaN = fixedViewArray.some((v) => isNaN(v) || !isFinite(v));
    if (stillHasNaN) {
      console.error("View matrix STILL invalid after fix attempt!");
    } else {
      console.log("View matrix fixed successfully");
    }
  }

  // Update camera projection with good defaults (only once)
  defaultCamera.projection.update({
    fovY: (60 * Math.PI) / 180,
    aspect: canvas.width / canvas.height,
    near: 0.1,
    far: 1000,
  });

  // Ensure minimum distance between eye and center to prevent singular matrices
  // This is critical for grid rendering which needs to invert the view-projection matrix
  // Need at least 2.0 distance for stable matrix inversion
  const MIN_DISTANCE = 2.0; // Minimum distance to prevent singular matrix

  // Get fresh eye/center after the update above
  const currentEye = defaultCamera.view.eye;
  const currentCenter = defaultCamera.view.center;
  const eyeData = currentEye.data;
  const centerData = currentCenter.data;
  const dx = eyeData[0]! - centerData[0]!;
  const dy = eyeData[1]! - centerData[1]!;
  const dz = eyeData[2]! - centerData[2]!;
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

  console.log("Camera distance check - eye:", eyeData[0], eyeData[1], eyeData[2], "distance:", distance.toFixed(3));

  if (distance < MIN_DISTANCE) {
    console.warn(`Camera eye too close to center (${distance.toFixed(3)}), adjusting to minimum distance ${MIN_DISTANCE}`);
    // Move eye away from center along the current direction (or default Z direction if too close)
    const direction = distance > 1e-6 ? new Vector3(new Float32Array([dx / distance, dy / distance, dz / distance])) : new Vector3(new Float32Array([0, 0, 1])); // Default to looking along +Z
    const newEye = new Vector3(
      new Float32Array([centerData[0]! + direction.data[0]! * MIN_DISTANCE, centerData[1]! + direction.data[1]! * MIN_DISTANCE, centerData[2]! + direction.data[2]! * MIN_DISTANCE])
    );
    defaultCamera.view.eye = newEye;
    defaultCamera.view.update();

    // Verify the eye was actually set
    const verifyEye2 = defaultCamera.view.eye;
    console.log("Camera eye after adjustment - set to:", newEye.data[0], newEye.data[1], newEye.data[2], "read back:", verifyEye2.data[0], verifyEye2.data[1], verifyEye2.data[2]);
  }

  // Final validation
  const finalViewData = defaultCamera.view.data;
  const finalViewArray = Array.from(finalViewData);
  const finalHasNaN = finalViewArray.some((v) => isNaN(v) || !isFinite(v));
  if (finalHasNaN) {
    console.error("View matrix STILL contains NaN or Infinity after all fixes!");
  } else {
    console.log("Camera initialized successfully");
    const finalEye = defaultCamera.view.eye;
    const finalCenter = defaultCamera.view.center;
    const finalEyeData = finalEye.data;
    const finalCenterData = finalCenter.data;
    console.log("Camera eye at:", finalEyeData[0] ?? 0, finalEyeData[1] ?? 0, finalEyeData[2] ?? 0);
    console.log("Camera center at:", finalCenterData[0] ?? 0, finalCenterData[1] ?? 0, finalCenterData[2] ?? 0);
    const finalDistance = Math.sqrt(Math.pow(finalEyeData[0]! - finalCenterData[0]!, 2) + Math.pow(finalEyeData[1]! - finalCenterData[1]!, 2) + Math.pow(finalEyeData[2]! - finalCenterData[2]!, 2));
    console.log("Camera eye-center distance:", finalDistance.toFixed(3));
    console.log("Camera is ready for rendering");
  }
}

console.log("Using default Camera with RenderGraph system");
console.log("Canvas size:", canvas.width, "x", canvas.height);
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
console.log("Stage children count:", arc.stage.children.length);
console.log("Renderer started, render loop should be running");

// Log initial render graph state
const renderGraph = (arc as any)._renderer?.getRenderGraph();
if (renderGraph) {
  console.log("RenderGraph is configured");
} else {
  console.warn("RenderGraph is not configured!");
}

// Add comprehensive debugging
const gl = arc.canvas.getContext("webgl");
if (gl) {
  gl.getError(); // Clear any initial errors

  // Monitor render loop
  let frameCount = 0;
  const checkGLError = () => {
    const error = gl.getError();
    if (error !== gl.NO_ERROR) {
      const errorNames: Record<number, string> = {
        0x0500: "INVALID_ENUM",
        0x0501: "INVALID_VALUE",
        0x0502: "INVALID_OPERATION",
        0x0503: "INVALID_FRAMEBUFFER_OPERATION",
        0x0505: "OUT_OF_MEMORY",
      };
      console.error("WebGL Error:", errorNames[error] || error, `(0x${error.toString(16)})`);
    }
  };

  // Check for errors and shader status periodically
  let lastLogFrame = 0;
  let lastErrorCheck = 0;
  setInterval(() => {
    checkGLError();
    frameCount++;
    if (frameCount - lastLogFrame >= 60) {
      lastLogFrame = frameCount;
      console.log(`[DEBUG] Rendered ${frameCount} frames`);

      // Check camera state
      if (defaultCamera) {
        const eye = defaultCamera.view.eye;
        const center = defaultCamera.view.center;
        const eyeData = eye.data;
        const centerData = center.data;
        const distance = Math.sqrt(Math.pow(eyeData[0]! - centerData[0]!, 2) + Math.pow(eyeData[1]! - centerData[1]!, 2) + Math.pow(eyeData[2]! - centerData[2]!, 2));
        console.log(
          `[DEBUG] Camera: eye=(${eyeData[0]?.toFixed(2)}, ${eyeData[1]?.toFixed(2)}, ${eyeData[2]?.toFixed(2)}), center=(${centerData[0]?.toFixed(2)}, ${centerData[1]?.toFixed(2)}, ${centerData[2]?.toFixed(2)}), distance=${distance.toFixed(2)}`
        );
      }

      // Check if meshes have programs loaded and are rendering
      const meshStatus: string[] = [];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      arc.stage.traverse((node) => {
        if (node instanceof Plane || node instanceof GridMesh) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
          const hasProgram = (node as any)._program !== null && (node as any)._program !== undefined;
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
          const hasViewProj = (node as any)._viewProjectionMatrix !== null && (node as any)._viewProjectionMatrix !== undefined;
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
          const shaderInitPromise = (node as any)._shaderInitPromise;
          const isInitializing = shaderInitPromise !== null && shaderInitPromise !== undefined;
          meshStatus.push(`${node.constructor.name}: program=${hasProgram}, viewProj=${hasViewProj}, init=${isInitializing}`);
        }
      });
      if (meshStatus.length > 0) {
        console.log(`[DEBUG] Mesh status:`, meshStatus.join("; "));
      }
    }

    // Check for WebGL errors more frequently (every 10 frames)
    if (frameCount - lastErrorCheck >= 10) {
      lastErrorCheck = frameCount;
      const error = gl.getError();
      if (error !== gl.NO_ERROR) {
        const errorNames: Record<number, string> = {
          0x0500: "INVALID_ENUM",
          0x0501: "INVALID_VALUE",
          0x0502: "INVALID_OPERATION",
          0x0503: "INVALID_FRAMEBUFFER_OPERATION",
          0x0505: "OUT_OF_MEMORY",
        };
        console.error(`[DEBUG] WebGL Error detected:`, errorNames[error] || `0x${error.toString(16)}`);
      }
    }
  }, 16); // Check every ~16ms (60fps)
}

// Camera control state
let isMouseDown = false;
let mouseButton = 0; // 0 = left, 1 = middle, 2 = right
let lastMouseX = 0;
let lastMouseY = 0;
const movementSpeed = 1.0;
const rotationSpeed = 0.01;
const zoomSpeed = 0.1;

// Store initial camera state for reset
let initialCameraState: { eye: Vector3; center: Vector3; pitch: number; yaw: number; roll: number } | null = null;

// Initialize camera state storage
if (defaultCamera) {
  const eye = defaultCamera.view.eye;
  const center = defaultCamera.view.center;
  initialCameraState = {
    eye: new Vector3(new Float32Array([eye.data[0]!, eye.data[1]!, eye.data[2]!])),
    center: new Vector3(new Float32Array([center.data[0]!, center.data[1]!, center.data[2]!])),
    pitch: 0,
    yaw: 0,
    roll: 0,
  };
}

// Mouse controls for orbit (left button) and pan (right button)
canvas.addEventListener("mousedown", (e) => {
  isMouseDown = true;
  mouseButton = e.button;
  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
  canvas.style.cursor = mouseButton === 0 ? "grabbing" : "move";
});

canvas.addEventListener("mouseup", () => {
  isMouseDown = false;
  canvas.style.cursor = "default";
});

canvas.addEventListener("mouseleave", () => {
  isMouseDown = false;
  canvas.style.cursor = "default";
});

canvas.addEventListener("mousemove", (e) => {
  if (!isMouseDown || !defaultCamera) return;

  const dx = e.clientX - lastMouseX;
  const dy = e.clientY - lastMouseY;

  if (mouseButton === 0) {
    // Left button: Orbit around center
    defaultCamera.rotateY(-dx * rotationSpeed);
    defaultCamera.rotateX(-dy * rotationSpeed);
    // rotateX/rotateY should call updateView() internally, but ensure view is updated
    defaultCamera.view.update();
  } else if (mouseButton === 2) {
    // Right button: Pan
    const panSpeed = movementSpeed * 0.01;
    defaultCamera.move(-dx * panSpeed, dy * panSpeed, 0);
    // move() should call view.update() internally, but ensure it's updated
    defaultCamera.view.update();
  }

  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
});

// Prevent context menu on right click
canvas.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});

// Mouse wheel for zoom
canvas.addEventListener("wheel", (e) => {
  if (!defaultCamera) return;
  e.preventDefault();

  const zoomDelta = e.deltaY > 0 ? 1 + zoomSpeed : 1 - zoomSpeed;
  const eye = defaultCamera.view.eye;
  const center = defaultCamera.view.center;

  // Move eye closer or farther from center
  const dx = eye.data[0]! - center.data[0]!;
  const dy = eye.data[1]! - center.data[1]!;
  const dz = eye.data[2]! - center.data[2]!;

  const newEye = new Vector3(new Float32Array([center.data[0]! + dx * zoomDelta, center.data[1]! + dy * zoomDelta, center.data[2]! + dz * zoomDelta]));

  defaultCamera.view.eye = newEye;
  defaultCamera.view.update();
});

// Keyboard controls
document.addEventListener("keydown", (e) => {
  const currentCamera = arc.camera;
  if (!currentCamera) return;

  // Prevent default behavior for camera controls
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "W", "s", "S", "a", "A", "d", "D", "q", "Q", "e", "E", "r", "R", "+", "-", "="].includes(e.key)) {
    e.preventDefault();
  }

  switch (e.key) {
    case "ArrowUp":
      currentCamera.rotateX(-rotationSpeed * 10);
      currentCamera.view.update();
      break;
    case "ArrowDown":
      currentCamera.rotateX(rotationSpeed * 10);
      currentCamera.view.update();
      break;
    case "ArrowLeft":
      currentCamera.rotateY(rotationSpeed * 10);
      currentCamera.view.update();
      break;
    case "ArrowRight":
      currentCamera.rotateY(-rotationSpeed * 10);
      currentCamera.view.update();
      break;
    case "w":
    case "W": {
      // Move forward (toward center)
      const eye = currentCamera.view.eye;
      const center = currentCamera.view.center;
      const dirX = center.data[0]! - eye.data[0]!;
      const dirY = center.data[1]! - eye.data[1]!;
      const dirZ = center.data[2]! - eye.data[2]!;
      const len = Math.sqrt(dirX * dirX + dirY * dirY + dirZ * dirZ);
      if (len > 0.01) {
        const moveX = (dirX / len) * movementSpeed;
        const moveY = (dirY / len) * movementSpeed;
        const moveZ = (dirZ / len) * movementSpeed;
        currentCamera.move(moveX, moveY, moveZ);
        currentCamera.view.update();
      }
      break;
    }
    case "s":
    case "S": {
      // Move backward (away from center)
      const eye2 = currentCamera.view.eye;
      const center2 = currentCamera.view.center;
      const dirX2 = center2.data[0]! - eye2.data[0]!;
      const dirY2 = center2.data[1]! - eye2.data[1]!;
      const dirZ2 = center2.data[2]! - eye2.data[2]!;
      const len2 = Math.sqrt(dirX2 * dirX2 + dirY2 * dirY2 + dirZ2 * dirZ2);
      if (len2 > 0.01) {
        const moveX2 = (-dirX2 / len2) * movementSpeed;
        const moveY2 = (-dirY2 / len2) * movementSpeed;
        const moveZ2 = (-dirZ2 / len2) * movementSpeed;
        currentCamera.move(moveX2, moveY2, moveZ2);
        currentCamera.view.update();
      }
      break;
    }
    case "a":
    case "A":
      // Strafe left
      currentCamera.move(-movementSpeed, 0, 0);
      currentCamera.view.update();
      break;
    case "d":
    case "D":
      // Strafe right
      currentCamera.move(movementSpeed, 0, 0);
      currentCamera.view.update();
      break;
    case "q":
    case "Q":
      // Roll left
      currentCamera.rotateZ(rotationSpeed * 10);
      currentCamera.view.update();
      break;
    case "e":
    case "E":
      // Roll right
      currentCamera.rotateZ(-rotationSpeed * 10);
      currentCamera.view.update();
      break;
    case "r":
    case "R":
      // Reset camera
      if (initialCameraState) {
        currentCamera.view.eye = initialCameraState.eye.clone();
        currentCamera.view.center = initialCameraState.center.clone();
        currentCamera.view.update();
        // Reset rotation angles
        (currentCamera as any)._pitch = initialCameraState.pitch;
        (currentCamera as any)._yaw = initialCameraState.yaw;
        (currentCamera as any)._roll = initialCameraState.roll;
        (currentCamera as any).updateView();
        console.log("Camera reset");
      }
      break;
    case "+":
    case "=": {
      // Zoom in
      const eye3 = currentCamera.view.eye;
      const center3 = currentCamera.view.center;
      const dx3 = eye3.data[0]! - center3.data[0]!;
      const dy3 = eye3.data[1]! - center3.data[1]!;
      const dz3 = eye3.data[2]! - center3.data[2]!;
      const newEye3 = new Vector3(new Float32Array([center3.data[0]! + dx3 * (1 - zoomSpeed), center3.data[1]! + dy3 * (1 - zoomSpeed), center3.data[2]! + dz3 * (1 - zoomSpeed)]));
      currentCamera.view.eye = newEye3;
      currentCamera.view.update();
      break;
    }
    case "-": {
      // Zoom out
      const eye4 = currentCamera.view.eye;
      const center4 = currentCamera.view.center;
      const dx4 = eye4.data[0]! - center4.data[0]!;
      const dy4 = eye4.data[1]! - center4.data[1]!;
      const dz4 = eye4.data[2]! - center4.data[2]!;
      const newEye4 = new Vector3(new Float32Array([center4.data[0]! + dx4 * (1 + zoomSpeed), center4.data[1]! + dy4 * (1 + zoomSpeed), center4.data[2]! + dz4 * (1 + zoomSpeed)]));
      currentCamera.view.eye = newEye4;
      currentCamera.view.update();
      break;
    }
  }
});

// Display instructions
console.log(`
Arcanvas Playground - Testing RenderGraph and Camera Integration

Mouse Controls:
  Left Drag - Orbit around center
  Right Drag - Pan camera
  Wheel - Zoom in/out

Keyboard Controls:
  Arrow Keys - Rotate camera (pitch/yaw)
  W/S - Move forward/backward
  A/D - Strafe left/right
  Q/E - Roll left/right
  +/- - Zoom in/out
  R - Reset camera to initial position

Features being tested:
  ✓ RenderGraph system (ClearPass + DrawStagePass)
  ✓ Camera view/projection matrix integration
  ✓ GridMesh with camera position and view-projection matrices
  ✓ PlaneMesh with view-projection matrix
  ✓ Automatic camera matrix updates on mesh render
`);
