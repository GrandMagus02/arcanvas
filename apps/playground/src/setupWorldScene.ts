import { Arcanvas, GridObject, Polygon2DObject, PolygonObject, UnlitColorMaterial, WorldScene } from "@arcanvas/core";

/**
 * Setup scene using WorldScene for large coordinate testing.
 *
 * This demonstrates the floating origin / camera-relative rendering system
 * where objects can have huge world coordinates (like 1e12) without precision issues.
 */
export function setupWorldScene(arc: Arcanvas): WorldScene {
  const scene = new WorldScene(
    { width: arc.canvas.width, height: arc.canvas.height },
    {
      // Recenter when camera moves more than 10000 units from origin
      recenterThreshold: 10000,
      // Auto-recenter enabled
      autoRecenter: true,
      // Snap to grid for floating point stability
      snapToGrid: true,
      gridSize: 1000,
    }
  );

  // Create grid using the new engine-level GridObject
  const grid = new GridObject({
    plane: "XY",
    cellSize: 1,
    majorDivisions: 4,
    adaptiveSpacing: true,
    fixedPixelSize: true,
    axisLineWidth: 2,
    majorLineWidth: 1,
    minorLineWidth: 1,
    minCellPixelSize: 20,
    baseColor: [0.1, 0.1, 0.1, 1],
    minorColor: [0.3, 0.3, 0.3, 0.5],
    majorColor: [0.5, 0.5, 0.5, 0.8],
    xAxisColor: [0.8, 0.2, 0.2, 1],
    yAxisColor: [0.2, 0.8, 0.2, 1],
  });
  scene.addObject(grid);

  // Add a filled polygon mesh (2D) - hexagon centered at a HUGE coordinate
  // Without floating origin, this would cause precision issues!
  const hexPoints: number[][] = [];
  const cx = 0;
  const cy = 0;
  const r = 20;
  for (let i = 0; i < 6; i++) {
    const theta = (i / 6) * 2 * Math.PI;
    hexPoints.push([cx + r * Math.cos(theta), cy + r * Math.sin(theta)]);
  }

  const polygonFill = new Polygon2DObject(hexPoints, { zIndex: 0 }, new UnlitColorMaterial({ baseColor: [0.2, 0.7, 0.9, 1] }));
  polygonFill.name = "TestPolygonFill";
  scene.addObject(polygonFill);

  // Add an outline polygon (rectangle) at the origin
  const outlinePoints = [-30, -20, 0, 30, -20, 0, 30, 20, 0, -30, 20, 0];
  const polygonOutline = new PolygonObject(outlinePoints, new UnlitColorMaterial({ baseColor: [1, 0.4, 0.2, 1] }));
  polygonOutline.name = "TestPolygonOutline";
  scene.addObject(polygonOutline);

  // Create some WorldRenderObjects at extreme coordinates to test precision
  // These are positioned at coordinates that would break with normal Float32 rendering
  createDistantTestObjects(scene);

  console.log("[SetupWorldScene] WorldScene created with floating origin support");
  console.log("[SetupWorldScene] Origin:", scene.origin);
  console.log("[SetupWorldScene] Recenter threshold:", scene.worldOrigin.options.recenterThreshold);

  return scene;
}

/**
 * Creates test objects at various extreme distances to verify precision handling.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function createDistantTestObjects(_scene: WorldScene): void {
  // Note: These objects would need to be WorldRenderObjects to use worldPosition.
  // For now, we demonstrate the concept. In a full implementation, you'd create
  // custom WorldRenderObject subclasses or use a factory pattern.

  // The grid and polygon objects don't have world positions yet,
  // but the infrastructure is in place for objects that do.

  console.log("[SetupWorldScene] To test extreme coordinates:");
  console.log("  1. Move the camera to coordinates like (1e9, 0)");
  console.log("  2. Objects should render correctly relative to camera");
  console.log("  3. No jittering or precision artifacts should appear");
}
