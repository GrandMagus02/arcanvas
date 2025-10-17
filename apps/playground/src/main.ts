import {
  Arcanvas,
  Grid,
  Viewport,
  autoResizePlugin,
  camera2DPlugin,
  gridPlugin,
  viewportPlugin,
} from "@arcanvas/core";

const canvas = document.getElementById("c") as HTMLCanvasElement | null;

// Provide defaults; AutoResize will override when a parent exists
if (!canvas) {
  throw new Error("Canvas element not found");
}
// Initialize Arcanvas with plugins. Viewport/Grid/Camera will register into DI.

const arc = new Arcanvas(canvas, {
  width: 640,
  height: 480,
  plugins: [autoResizePlugin, viewportPlugin, camera2DPlugin, gridPlugin],
});

// Resolve instances from DI (provided by plugins)
const viewport = arc.inject<Viewport>(Viewport);
const grid = arc.inject<Grid>(Grid);
if (!viewport || !grid) {
  throw new Error("Required plugins not available in DI: Viewport and Grid");
}

// Wheel zoom at cursor
canvas.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
    viewport.zoomAtScreenPoint(factor, x, y);
  },
  { passive: false }
);

// WebGL render loop
const gl = (canvas.getContext("webgl") ||
  canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
if (!gl) {
  throw new Error("WebGL not supported");
}
gl.clearColor(1, 1, 1, 1);
const frame = () => {
  gl.clear(gl.COLOR_BUFFER_BIT);
  grid.draw(gl);
  requestAnimationFrame(frame);
};
requestAnimationFrame(frame);
