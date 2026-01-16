import { Arcanvas, GridMesh, Plane2D, Polygon2D } from "@arcanvas/core";

/**
 * Setup scene.
 */
export function setupScene(arc: Arcanvas): GridMesh {
  // Create a grid mesh
  const grid = new GridMesh();
  grid.name = "Grid";

  // Configure grid
  grid.setPlane("XY"); // Grid on ground
  grid.setCellSize(1); // Base cell size 1 unit
  grid.setMajorDivisions(4); // 4 minor cells per major cell
  grid.setAdaptiveSpacing(true); // Enable adaptive
  grid.setFixedPixelSize(true); // 1px lines
  grid.setAxisLineWidth(2);
  grid.setMajorLineWidth(1);
  grid.setMinorLineWidth(1);
  grid.setMinCellPixelSize(20); // Minimum 50px per cell before collapsing

  // Set colors (r, g, b, a)
  grid.setBaseColor(0.1, 0.1, 0.1, 1);
  grid.setMinorColor(0.3, 0.3, 0.3, 0.5);
  grid.setMajorColor(0.5, 0.5, 0.5, 0.8);
  grid.setXAxisColor(0.8, 0.2, 0.2, 1);
  grid.setYAxisColor(0.2, 0.8, 0.2, 1);

  arc.stage.add(grid);

  // Add a plane mesh
  const plane = new Plane2D(0, 0, 100, 150);
  plane.name = "TestRectangle";
  arc.stage.add(plane);

  // Add a polygon mesh
  // Hexagon points at 200, 50 with radius 50
  const hexPoints: number[][] = [];
  const cx = 200;
  const cy = 50;
  const r = 50;
  for (let i = 0; i < 6; i++) {
    const theta = (i / 6) * 2 * Math.PI;
    hexPoints.push([cx + r * Math.cos(theta), cy + r * Math.sin(theta)]);
  }

  const polygon = new Polygon2D(hexPoints);
  polygon.name = "TestPolygon";
  arc.stage.add(polygon);

  console.log("[SetupScene] Grid added to stage");

  return grid;
}
