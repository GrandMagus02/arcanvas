import { Arcanvas, AutoResize, Grid, Viewport } from "@arcanvas/core";

const canvas = document.getElementById("c") as HTMLCanvasElement | null;

// Provide defaults; AutoResize will override when a parent exists
if (!canvas) {
  throw new Error("Canvas element not found");
}
// Initialize Arcanvas with plugins. Viewport3D/Grid3D/Camera3D will register into DI.

const arc = new Arcanvas(canvas, {
  width: 640,
  height: 480,
  renderer: { clearColor: [0.02, 0.02, 0.02, 1], depthTest: true },
});
arc.use(AutoResize);
arc.use(Viewport, { fovDegrees: 60 });
arc.use(Grid, { size: 1000, spacing: 1, color: "#404040", axes: true });
arc.start();

// Resolve instances are the returned values above

// Hook grid draw into Arcanvas' renderer (if created)
arc.renderer?.onDraw((gl) => {
  const gridApi = (arc as unknown as { grid: { draw(gl: WebGLRenderingContext): void } }).grid;
  gridApi.draw(gl);
});
