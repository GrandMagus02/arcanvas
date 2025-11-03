import { Arcanvas, AutoResizePlugin, Camera2D, GridMesh, Plane } from "@arcanvas/core";

const canvas = document.getElementById("c") as HTMLCanvasElement | null;
if (!canvas) {
  throw new Error("Canvas element not found");
}

const arc = new Arcanvas(canvas, {
  width: 640,
  height: 480,
  renderer: true,
});
arc.use(AutoResizePlugin);

arc.start();

// Draw a rectangle using two triangles (positions in pixel coordinates)
// Rectangle: 300px width, 200px height, centered on screen
// Center: (320, 240)
// Top-left: (170, 140), Top-right: (470, 140)
// Bottom-right: (470, 340), Bottom-left: (170, 340)
arc.stage.add(
  new Plane([
    // Four corners
    0, 0, 0.0, 100, 0, 0.0, 100, 0, 0.0, 0, 0, 0.0, 0, 100, 0.0, 100, 100, 0.0, 0, 0, 0.0, 0, 100, 0.0, 100, 0, 0.0, 0, 0, 0.0, 100, 0, 0.0, 100, 100, 0.0,
  ])
);

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
grid.setBaseColor(0, 0, 0, 1);
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
arc.stage.add(grid);

// Create cameras
const camera2D = new Camera2D(arc, {
  moveSpeed: 500,
  rotationSpeed: 1,
});

const camera3D = new Camera2D(arc, {
  moveSpeed: 200,
  rotationSpeed: 1.5,
});

// Start with Camera2D
arc.setCamera(camera2D);

// Add keyboard controls to switch cameras
document.addEventListener("keydown", (e) => {
  if (e.key === "1") {
    arc.setCamera(camera2D);
    console.log("Switched to Camera2D");
  } else if (e.key === "2") {
    arc.setCamera(camera3D);
    console.log("Switched to Camera3D");
  }
  // Note: Camera cannot be disabled - a default camera will be created if null is passed
});
