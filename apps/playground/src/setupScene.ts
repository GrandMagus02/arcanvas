import { Arcanvas } from "@arcanvas/core";
import { GridObject, Polygon2DObject } from "@arcanvas/feature-2d";
import { MaterialBuilder } from "@arcanvas/graphics";
import { Scene } from "@arcanvas/scene";

/**
 * Setup scene.
 */
export function setupScene(arc: Arcanvas): Scene {
  // TODO: remove eslint disables once engine exports are fully typed in playground build.
  const scene = new Scene({ width: arc.canvas.width, height: arc.canvas.height });

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

  // Add a filled polygon mesh (2D) - hexagon centered at (0, 0) with radius 20
  const hexPoints: number[][] = [];
  const cx = 0;
  const cy = 0;
  const r = 20;
  for (let i = 0; i < 6; i++) {
    const theta = (i / 6) * 2 * Math.PI;
    hexPoints.push([cx + r * Math.cos(theta), cy + r * Math.sin(theta)]);
  }

  // const material = new UnlitColorMaterial({ baseColor: [0.2, 0.7, 0.9, 1] });
  const material = new MaterialBuilder().baseColor([0.2, 0.7, 0.9, 1]).outline([1, 0, 0, 1], 2).build();

  const polygon = new Polygon2DObject(hexPoints, { zIndex: 0 }, material);
  polygon.name = "TestPolygon";
  scene.addObject(polygon);

  console.log("[SetupScene] Engine scene created with GridObject");
  return scene;
}
