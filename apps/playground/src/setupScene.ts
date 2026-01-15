import { Arcanvas, Plane } from "@arcanvas/core";

/**
 * Setup scene.
 */
export function setupScene(arc: Arcanvas): Plane {
  // Create a simple colored rectangle using Plane (3D coordinates)
  // Rectangle: 2x1.5 units, centered at origin (smaller to fit in camera view)
  const rectangle = new Plane([
    // First triangle
    -1,
    -0.75,
    0, // bottom-left
    1,
    -0.75,
    0, // bottom-right
    1,
    0.75,
    0, // top-right
    // Second triangle
    -1,
    -0.75,
    0, // bottom-left
    1,
    0.75,
    0, // top-right
    -1,
    0.75,
    0, // top-left
  ]);
  rectangle.name = "TestRectangle";
  arc.stage.add(rectangle);

  console.log("[SetupScene] Rectangle vertices:", rectangle.vertices);
  console.log("[SetupScene] Rectangle added to stage, children count:", arc.stage.children.length);

  return rectangle;
}
