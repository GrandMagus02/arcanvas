import {
  Arcanvas,
  autoResizePlugin,
  Viewport3D,
  Camera3D,
  Grid3D,
  viewport3DPlugin,
  camera3DPlugin,
  grid3DPlugin,
} from "@arcanvas/core";

const canvas = document.getElementById("c") as HTMLCanvasElement | null;

// Provide defaults; AutoResize will override when a parent exists
if (!canvas) {
  throw new Error("Canvas element not found");
}
// Initialize Arcanvas with plugins. Viewport3D/Grid3D/Camera3D will register into DI.

const arc = new Arcanvas(canvas, {
  width: 640,
  height: 480,
  plugins: [autoResizePlugin, viewport3DPlugin, camera3DPlugin, grid3DPlugin],
});

// Resolve instances from DI (provided by plugins)
const viewport3D = arc.inject<Viewport3D>(Viewport3D);
const grid3D = arc.inject<Grid3D>(Grid3D);
if (!viewport3D || !grid3D) {
  throw new Error("Required plugins not available in DI: Viewport3D and Grid3D");
}

// WebGL render loop
const gl = (canvas.getContext("webgl") ||
  canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
if (!gl) {
  throw new Error("WebGL not supported");
}
gl.clearColor(0.02, 0.02, 0.02, 1);
gl.enable(gl.DEPTH_TEST);
const frame = () => {
  viewport3D.updateMatrices();
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  grid3D.draw(gl);
  requestAnimationFrame(frame);
};
requestAnimationFrame(frame);
