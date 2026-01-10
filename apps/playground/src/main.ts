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
const plane = new Plane([
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
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
arc.stage.add(plane);

// Add grid with major/minor lines and colored axes
const grid = new GridMesh(new Float32Array([0, 0]));

grid.setPlane("XY");
grid.setAdaptiveSpacing(true);
grid.setCellSize(50);
grid.setMajorDivisions(10);
grid.setAxisLineWidth(2);
grid.setMajorLineWidth(1.5);
grid.setMinorLineWidth(1);
grid.setAxisDashScale(1.33);
grid.setBaseColor(0.2, 0.2, 0.2, 1); // Dark gray instead of black for visibility
grid.setMinorColor(1, 1, 1, 0.3);
grid.setMajorColor(1, 1, 1, 0.6);
grid.setXAxisColor(1, 0, 0, 1);
grid.setXAxisDashColor(0.5, 0, 0, 1);
grid.setYAxisColor(0, 1, 0, 1);
grid.setYAxisDashColor(0, 0.5, 0, 1);
grid.setZAxisColor(0, 0, 1, 1);
grid.setZAxisDashColor(0, 0, 0.5, 1);
grid.setCenterColor(1, 1, 1, 1);
grid.setFixedPixelSize(true);
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
arc.stage.add(grid);

// Get the default camera (created automatically)
// The camera is already set up with a default perspective projection
const defaultCamera = arc.camera;
if (defaultCamera) {
  // The ViewMatrix needs eye and center to be different
  // Set center to origin (where our meshes are) and eye back on Z
  // This fixes the view matrix which breaks when eye == center
  const center = new Vector3(new Float32Array([0, 0, 0]));
  const eye = new Vector3(new Float32Array([0, 0, 5]));
  defaultCamera.view.center = center;
  defaultCamera.view.eye = eye;

  // Update camera projection with good defaults
  defaultCamera.projection.update({
    fovY: (60 * Math.PI) / 180,
    aspect: canvas.width / canvas.height,
    near: 0.1,
    far: 1000,
  });

  // Update camera projection with good defaults
  defaultCamera.projection.update({
    fovY: (60 * Math.PI) / 180,
    aspect: canvas.width / canvas.height,
    near: 0.1,
    far: 1000,
  });

  const eyeData = eye.data;
  const centerData = center.data;
  console.log("Camera eye at:", eyeData[0] ?? 0, eyeData[1] ?? 0, eyeData[2] ?? 0);
  console.log("Camera center at:", centerData[0] ?? 0, centerData[1] ?? 0, centerData[2] ?? 0);

  // Debug: Check view matrix for NaN/invalid values
  const viewData = defaultCamera.view.data;
  const viewMatrixArray = Array.from(viewData);
  const hasNaN = viewMatrixArray.some((v) => isNaN(v) || !isFinite(v));
  if (hasNaN) {
    console.error("View matrix contains NaN or Infinity!", viewMatrixArray);
  } else {
    console.log("View matrix is valid");
  }

  console.log("Camera projection updated");
  console.log("Plane should render as RED");
  console.log("Grid should render with colored axes");
}

console.log("Using default Camera with RenderGraph system");
console.log("Canvas size:", canvas.width, "x", canvas.height);
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
console.log("Stage children count:", arc.stage.children.length);

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
  setInterval(() => {
    checkGLError();
    frameCount++;
    if (frameCount - lastLogFrame >= 60) {
      lastLogFrame = frameCount;
      console.log(`Rendered ${frameCount} frames`);
      // Check if meshes have programs loaded
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      arc.stage.traverse((node) => {
        if (node instanceof Plane || node instanceof GridMesh) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
          const hasProgram = (node as any)._program !== null && (node as any)._program !== undefined;
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
          const hasViewProj = (node as any)._viewProjectionMatrix !== null && (node as any)._viewProjectionMatrix !== undefined;
          console.log(`${node.constructor.name}: program=${hasProgram}, viewProj=${hasViewProj}`);
        }
      });
    }
  }, 16); // Check every ~16ms (60fps)
}

// Add keyboard controls
document.addEventListener("keydown", (e) => {
  const currentCamera = arc.camera;
  if (!currentCamera) return;

  switch (e.key) {
    case "ArrowUp":
      currentCamera.move(0, 0.1, 0);
      console.log("Camera moved up");
      break;
    case "ArrowDown":
      currentCamera.move(0, -0.1, 0);
      console.log("Camera moved down");
      break;
    case "ArrowLeft":
      currentCamera.move(-0.1, 0, 0);
      console.log("Camera moved left");
      break;
    case "ArrowRight":
      currentCamera.move(0.1, 0, 0);
      console.log("Camera moved right");
      break;
    case "w":
    case "W":
      currentCamera.move(0, 0, -0.1);
      console.log("Camera moved forward");
      break;
    case "s":
    case "S":
      currentCamera.move(0, 0, 0.1);
      console.log("Camera moved backward");
      break;
    case "r":
    case "R":
      currentCamera.rotateZ(0.1);
      console.log("Camera rotated");
      break;
  }
});

// Display instructions
console.log(`
Arcanvas Playground - Testing RenderGraph and Camera Integration

Controls:
  Arrow Keys - Move camera (up/down/left/right)
  W/S - Move camera forward/backward
  R - Rotate camera

Features being tested:
  ✓ RenderGraph system (ClearPass + DrawStagePass)
  ✓ Camera view/projection matrix integration
  ✓ GridMesh with camera position and view-projection matrices
  ✓ PlaneMesh with view-projection matrix
  ✓ Automatic camera matrix updates on mesh render
`);
