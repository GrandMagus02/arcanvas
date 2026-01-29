import { Arcanvas, AutoResizePlugin, Camera, Camera2DController, EngineRenderSystem } from "@arcanvas/core";
import { Polygon2DObject } from "@arcanvas/feature-2d";
import { Curve, Line, Path, UnlitColorMaterial } from "@arcanvas/graphics";
import { Entity, Scene } from "@arcanvas/scene";
import type { Meta, StoryObj } from "@storybook/html";

interface Shape2DArgs {
  shapeType: "rect" | "ellipse" | "polygon" | "svg" | "line" | "curve";
  width: number;
  height: number;
  radiusX: number;
  radiusY: number;
  sides: number;
  svgPath: string;
  lineWidth: number;
  baseColorR: number;
  baseColorG: number;
  baseColorB: number;
  baseColorA: number;
  cameraZoom: number;
  debugTriangles: boolean;
}

const cleanupMap = new Map<string, () => void>();
const storyStateMap = new Map<string, { prevArgs: Shape2DArgs; renderObject: any; entity: Entity }>();

const meta: Meta<Shape2DArgs> = {
  title: "2D/Shape2D",
  tags: ["autodocs"],
  parameters: {
    docs: {
      source: {
        type: "code",
        language: "typescript",
      },
    },
  },
  argTypes: {
    shapeType: {
      control: "select",
      options: ["rect", "ellipse", "polygon", "svg", "line", "curve"],
      description: "Type of shape to render",
      defaultValue: "rect",
    },
    width: {
      control: { type: "range", min: 10, max: 500, step: 10 },
      description: "Width (for rectangle/line)",
      defaultValue: 200,
    },
    height: {
      control: { type: "range", min: 10, max: 500, step: 10 },
      description: "Height (for rectangle)",
      defaultValue: 150,
    },
    radiusX: {
      control: { type: "range", min: 10, max: 200, step: 10 },
      description: "Horizontal radius (for ellipse)",
      defaultValue: 100,
    },
    radiusY: {
      control: { type: "range", min: 10, max: 200, step: 10 },
      description: "Vertical radius (for ellipse)",
      defaultValue: 75,
    },
    sides: {
      control: { type: "range", min: 3, max: 12, step: 1 },
      description: "Number of sides (for polygon)",
      defaultValue: 6,
    },
    svgPath: {
      control: "text",
      description: "SVG Path Data (e.g., 'M 0 0 L 100 0 L 50 100 Z')",
      defaultValue: "M 0 0 L 100 0 L 100 100 L 0 100 Z",
    },
    lineWidth: {
      control: { type: "range", min: 1, max: 50, step: 1 },
      description: "Line Width (for line)",
      defaultValue: 10,
    },
    baseColorR: {
      control: { type: "range", min: 0, max: 1, step: 0.01 },
      description: "Base color red component",
      defaultValue: 0.2,
    },
    baseColorG: {
      control: { type: "range", min: 0, max: 1, step: 0.01 },
      description: "Base color green component",
      defaultValue: 0.7,
    },
    baseColorB: {
      control: { type: "range", min: 0, max: 1, step: 0.01 },
      description: "Base color blue component",
      defaultValue: 0.9,
    },
    baseColorA: {
      control: { type: "range", min: 0, max: 1, step: 0.01 },
      description: "Base color alpha component",
      defaultValue: 1,
    },
    cameraZoom: {
      control: { type: "range", min: 0.1, max: 2, step: 0.1 },
      description: "Camera zoom level",
      defaultValue: 1,
    },
    debugTriangles: {
      control: "boolean",
      description: "Show triangle structure with random colors",
      defaultValue: false,
    },
  },
};

export default meta;
type Story = StoryObj<Shape2DArgs>;

/**
 * Creates points for a rectangle.
 */
function createRectanglePoints(x: number, y: number, width: number, height: number): number[][] {
  return [
    [x, y],
    [x + width, y],
    [x + width, y + height],
    [x, y + height],
  ];
}

/**
 * Creates points for an ellipse (approximated as a polygon).
 */
function createEllipsePoints(centerX: number, centerY: number, radiusX: number, radiusY: number, segments: number = 64): number[][] {
  const points: number[][] = [];
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * 2 * Math.PI;
    points.push([centerX + radiusX * Math.cos(angle), centerY + radiusY * Math.sin(angle)]);
  }
  return points;
}

/**
 * Creates points for a regular polygon.
 */
function createPolygonPoints(centerX: number, centerY: number, radius: number, sides: number): number[][] {
  const points: number[][] = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * 2 * Math.PI - Math.PI / 2; // Start from top
    points.push([centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle)]);
  }
  return points;
}

/**
 * Renders the shape 2D story.
 */
function render(args: Shape2DArgs, id: string): HTMLElement {
  const existingCleanup = cleanupMap.get(id);
  if (existingCleanup) {
    existingCleanup();
    cleanupMap.delete(id);
  }

  const container = document.createElement("div");
  container.style.width = "100%";
  container.style.height = "100vh";
  container.style.display = "flex";
  container.style.overflow = "hidden";

  const canvas = document.createElement("canvas");
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.display = "block";
  container.appendChild(canvas);

  // Initialize Arcanvas
  const arc = new Arcanvas(canvas);
  arc.use(AutoResizePlugin);

  // Create scene
  const scene = new Scene({ width: canvas.width || 800, height: canvas.height || 600 });

  // Create shape based on type
  const baseColor: [number, number, number, number] = [args.baseColorR, args.baseColorG, args.baseColorB, args.baseColorA];
  const material = new UnlitColorMaterial({ baseColor });

  const centerX = (canvas.width || 800) / 2;
  const centerY = (canvas.height || 600) / 2;

  let renderObject: any;

  if (args.shapeType === "svg") {
    // Center the path roughly by moving it
    // Note: SVG paths are absolute, so to center them we might need to apply a transform later
    // For this demo, we'll just create it as is and maybe let the user pan
    renderObject = new Path(args.svgPath, material);
    // Move to center roughly (assuming path starts near 0,0)
    // Set translation in matrix (column-major: translation is at indices 12, 13, 14)
    const matrixData = renderObject.transform.matrix.data;
    matrixData[12] = centerX - 100;
    matrixData[13] = centerY - 100;
    matrixData[14] = 0;
  } else if (args.shapeType === "line") {
    renderObject = new Line(centerX - 100, centerY, centerX + 100, centerY, material, args.lineWidth);
  } else if (args.shapeType === "curve") {
    // Create a simple sine wave curve
    const points: number[] = [];
    for (let i = 0; i <= 200; i += 10) {
      points.push(centerX - 100 + i);
      points.push(centerY + Math.sin(i * 0.05) * 50);
    }
    // Close it to make it fillable
    points.push(centerX + 100, centerY + 100);
    points.push(centerX - 100, centerY + 100);

    renderObject = new Curve(points, material, true);
  } else {
    // Standard Polygon2DObject shapes
    let points: number[][];
    if (args.shapeType === "rect") {
      points = createRectanglePoints(centerX - args.width / 2, centerY - args.height / 2, args.width, args.height);
    } else if (args.shapeType === "ellipse") {
      points = createEllipsePoints(centerX, centerY, args.radiusX, args.radiusY);
    } else {
      // polygon
      const radius = Math.min(args.radiusX, args.radiusY);
      points = createPolygonPoints(centerX, centerY, radius, args.sides);
    }
    renderObject = new Polygon2DObject(points, {}, material);
  }

  renderObject.name = "Shape2D";

  // Wrap in Entity
  const entity = new Entity(renderObject.name, renderObject.id || "shape");
  // Attach render object properties
  (entity as any).mesh = renderObject.mesh;
  (entity as any).material = renderObject.material;
  (entity as any).transform = renderObject.transform;

  scene.addObject(entity);

  // Get or create story state
  let storyState = storyStateMap.get(id);
  if (!storyState) {
    storyState = { prevArgs: { ...args }, renderObject, entity };
    storyStateMap.set(id, storyState);
  } else {
    // Update existing state
    storyState.renderObject = renderObject;
    storyState.entity = entity;
  }

  // Update shape properties
  const updateShape = () => {
    if (!storyState) return;

    const prevArgs = storyState.prevArgs;
    // Check if we need to recreate the object
    const shapeChanged =
      prevArgs.shapeType !== args.shapeType ||
      (args.shapeType === "rect" && (prevArgs.width !== args.width || prevArgs.height !== args.height)) ||
      (args.shapeType === "ellipse" && (prevArgs.radiusX !== args.radiusX || prevArgs.radiusY !== args.radiusY)) ||
      (args.shapeType === "polygon" && (prevArgs.sides !== args.sides || prevArgs.radiusX !== args.radiusX)) ||
      (args.shapeType === "svg" && prevArgs.svgPath !== args.svgPath) ||
      (args.shapeType === "line" && prevArgs.lineWidth !== args.lineWidth) ||
      prevArgs.debugTriangles !== args.debugTriangles;

    if (!shapeChanged && storyState.renderObject) {
      return;
    }

    // Recreate object
    const width = canvas.width || 800;
    const height = canvas.height || 600;
    const newCenterX = width / 2;
    const newCenterY = height / 2;

    const baseColor: [number, number, number, number] = [args.baseColorR, args.baseColorG, args.baseColorB, args.baseColorA];

    const newMaterial = new UnlitColorMaterial({ baseColor });

    let newRenderObject: any;

    if (args.shapeType === "svg") {
      newRenderObject = new Path(args.svgPath, newMaterial);
      // Set translation in matrix (column-major: translation is at indices 12, 13, 14)
      const matrixData = newRenderObject.transform.matrix.data;
      matrixData[12] = newCenterX - 100;
      matrixData[13] = newCenterY - 100;
      matrixData[14] = 0;
    } else if (args.shapeType === "line") {
      newRenderObject = new Line(newCenterX - 100, newCenterY, newCenterX + 100, newCenterY, newMaterial, args.lineWidth);
    } else if (args.shapeType === "curve") {
      const points: number[] = [];
      for (let i = 0; i <= 200; i += 10) {
        points.push(newCenterX - 100 + i);
        points.push(newCenterY + Math.sin(i * 0.05) * 50);
      }
      points.push(newCenterX + 100, newCenterY + 100);
      points.push(newCenterX - 100, newCenterY + 100);
      newRenderObject = new Curve(points, newMaterial, true);
    } else {
      let newPoints: number[][];
      if (args.shapeType === "rect") {
        newPoints = createRectanglePoints(newCenterX - args.width / 2, newCenterY - args.height / 2, args.width, args.height);
      } else if (args.shapeType === "ellipse") {
        newPoints = createEllipsePoints(newCenterX, newCenterY, args.radiusX, args.radiusY);
      } else {
        const radius = Math.min(args.radiusX, args.radiusY);
        newPoints = createPolygonPoints(newCenterX, newCenterY, radius, args.sides);
      }
      newRenderObject = new Polygon2DObject(newPoints, {}, newMaterial);
    }

    // Debug mesh is now handled at the renderer level via renderSystem.setDebugTriangles()

    // Update entity
    (entity as any).mesh = newRenderObject.mesh;
    (entity as any).material = newRenderObject.material;
    (entity as any).transform = newRenderObject.transform;

    storyState.renderObject = newRenderObject;
    storyState.prevArgs = { ...args };
  };

  // Update material (cheap operation)
  const updateMaterial = () => {
    const newBaseColor: [number, number, number, number] = [args.baseColorR, args.baseColorG, args.baseColorB, args.baseColorA];

    // Update the CURRENT material on the entity
    if (storyState && storyState.entity) {
      const currentMat = (storyState.entity as any).material as UnlitColorMaterial;
      if (currentMat) {
        currentMat.baseColor = newBaseColor;
      }
    } else {
      material.baseColor = newBaseColor;
    }
  };

  updateShape();
  updateMaterial();

  // Setup camera
  const camera = new Camera(arc);
  camera.pixelsPerUnit = 1;
  arc.setCamera(camera);

  const controller = new Camera2DController();
  controller.zoom = args.cameraZoom;
  controller.attach(camera);
  controller.enable();

  // Create render system
  const renderSystem = new EngineRenderSystem(canvas, scene, camera, { backend: "webgl" });

  // Set debug mode based on args
  renderSystem.setDebugTriangles(args.debugTriangles);

  scene.viewport = { width: canvas.width || 800, height: canvas.height || 600 };

  arc.on("resize", () => {
    scene.viewport = { width: canvas.width, height: canvas.height };
    updateShape();
  });

  // Render loop
  let animationFrameId: number;
  const frame = () => {
    // Check if args changed
    const currentState = storyStateMap.get(id);
    if (currentState) {
      // Just call updateShape, it checks if args changed internally
      // But wait, storyState.prevArgs is only updated inside updateShape
      // We need to pass the new args to check against
      // Actually render() is called when args change in Storybook,
      // but we want to handle partial updates or frame updates?
      // In Storybook 7+, render is called again on args change.
      // The frame loop is for continuous rendering (e.g. camera movement)
      // We can just rely on render() being called again for args changes,
      // but we need to stop the old loop.
      // However, this structure seems to try to reuse the canvas.
      // Actually, the standard Storybook way is that render() is called with new args.
      // But here we are returning a DOM element that might stay alive.
      // If Storybook destroys the container, cleanup is called.
      // If we want to support hot-swapping args without full re-mount, we need to detect changes.
      // Let's assume render() is called on every change.
      // The problem is we create a NEW loop and NEW scene every time render is called?
      // No, we check cleanupMap. If render is called, we cleanup previous.
      // So we don't need to check args in the loop! The loop just renders.
      // The logic inside frame() checking args in the previous implementation was weird.
      // Ah, I see "args" in frame() closure is the *initial* args passed to render().
      // If render() is called again, a NEW frame loop is started with NEW args.
      // Wait, the previous code had logic to check args in frame().
      // That implies args might change without render() being called?
      // No, Storybook args are passed to render().
      // Maybe the author intended to handle updates efficiently.
      // But standard Storybook destroys and recreates the story on args change usually, unless using ArgsTable with some specific config.
      // Let's stick to the previous pattern just in case, but `args` in the closure is fixed.
      // So `args` won't change inside the frame loop.
      // The previous code's check `prevArgs.shapeType !== args.shapeType` compared the SAME object if args didn't change reference?
      // No, `args` comes from `render` params.
      // If `render` is called again, `cleanup` is called, stopping the old loop.
      // So we don't need to check args inside loop.
    }

    updateMaterial();
    renderSystem.renderOnce();
    animationFrameId = requestAnimationFrame(frame);
  };
  frame();

  const cleanup = () => {
    if (animationFrameId !== undefined) {
      cancelAnimationFrame(animationFrameId);
    }
    storyStateMap.delete(id);
  };

  cleanupMap.set(id, cleanup);

  return container;
}

export const Default: Story = {
  render: (args) => render(args, "default"),
  args: {
    shapeType: "rect",
    width: 200,
    height: 150,
    radiusX: 100,
    radiusY: 75,
    sides: 6,
    svgPath: "M 0 0 L 100 0 L 100 100 L 0 100 Z",
    lineWidth: 10,
    baseColorR: 0.2,
    baseColorG: 0.7,
    baseColorB: 0.9,
    baseColorA: 1,
    cameraZoom: 1,
    debugTriangles: false,
  },
};

export const SVGPath: Story = {
  render: (args) => render(args, "svg"),
  args: {
    shapeType: "svg",
    width: 200,
    height: 150,
    radiusX: 100,
    radiusY: 75,
    sides: 6,
    svgPath: "M 0 0 C 50 100 150 100 200 0 L 200 200 L 0 200 Z",
    lineWidth: 10,
    baseColorR: 0.9,
    baseColorG: 0.5,
    baseColorB: 0.2,
    baseColorA: 1,
    cameraZoom: 1,
    debugTriangles: false,
  },
};

export const LineShape: Story = {
  render: (args) => render(args, "line"),
  args: {
    shapeType: "line",
    width: 200, // Used for length essentially
    height: 150,
    radiusX: 100,
    radiusY: 75,
    sides: 6,
    svgPath: "",
    lineWidth: 20,
    baseColorR: 0.2,
    baseColorG: 0.9,
    baseColorB: 0.5,
    baseColorA: 1,
    cameraZoom: 1,
    debugTriangles: false,
  },
};
