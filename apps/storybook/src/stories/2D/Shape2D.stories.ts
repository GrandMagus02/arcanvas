import { Arcanvas, AutoResizePlugin, Camera, Camera2DController, EngineRenderSystem } from "@arcanvas/core";
import { Polygon2DObject } from "@arcanvas/feature-2d";
import { UnlitColorMaterial } from "@arcanvas/graphics";
import { Entity, Scene } from "@arcanvas/scene";
import type { Meta, StoryObj } from "@storybook/html";

interface Shape2DArgs {
  shapeType: "rect" | "ellipse" | "polygon";
  width: number;
  height: number;
  radiusX: number;
  radiusY: number;
  sides: number;
  baseColorR: number;
  baseColorG: number;
  baseColorB: number;
  baseColorA: number;
  cameraZoom: number;
}

const cleanupMap = new Map<string, () => void>();
const storyStateMap = new Map<string, { prevArgs: Shape2DArgs; polygon: Polygon2DObject; entity: Entity }>();

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
      options: ["rect", "ellipse", "polygon"],
      description: "Type of shape to render",
      defaultValue: "rect",
    },
    width: {
      control: { type: "range", min: 10, max: 500, step: 10 },
      description: "Width (for rectangle)",
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

  let points: number[][];
  const centerX = (canvas.width || 800) / 2;
  const centerY = (canvas.height || 600) / 2;

  if (args.shapeType === "rect") {
    points = createRectanglePoints(centerX - args.width / 2, centerY - args.height / 2, args.width, args.height);
  } else if (args.shapeType === "ellipse") {
    points = createEllipsePoints(centerX, centerY, args.radiusX, args.radiusY);
  } else {
    // polygon
    const radius = Math.min(args.radiusX, args.radiusY);
    points = createPolygonPoints(centerX, centerY, radius, args.sides);
  }

  const polygon = new Polygon2DObject(points, {}, material);
  polygon.name = "Shape2D";

  // Wrap Polygon2DObject in an Entity to add to scene
  const entity = new Entity(polygon.name, polygon.id);
  (entity as unknown as { mesh: unknown; material: unknown; transform: unknown }).mesh = polygon.mesh;
  (entity as unknown as { mesh: unknown; material: unknown; transform: unknown }).material = polygon.material;
  (entity as unknown as { mesh: unknown; material: unknown; transform: unknown }).transform = polygon.transform;

  scene.addObject(entity);

  // Get or create story state
  let storyState = storyStateMap.get(id);
  if (!storyState) {
    storyState = { prevArgs: { ...args }, polygon, entity };
    storyStateMap.set(id, storyState);
  } else {
    // Update existing state
    storyState.polygon = polygon;
    storyState.entity = entity;
  }

  // Update shape properties (only when shape-defining args change)
  const updateShape = () => {
    if (!storyState) return;

    const prevArgs = storyState.prevArgs;
    const shapeChanged =
      prevArgs.shapeType !== args.shapeType ||
      prevArgs.width !== args.width ||
      prevArgs.height !== args.height ||
      prevArgs.radiusX !== args.radiusX ||
      prevArgs.radiusY !== args.radiusY ||
      prevArgs.sides !== args.sides;

    if (!shapeChanged && storyState.polygon === polygon) {
      return;
    }

    let newPoints: number[][];
    const width = canvas.width || 800;
    const height = canvas.height || 600;
    const newCenterX = width / 2;
    const newCenterY = height / 2;

    if (args.shapeType === "rect") {
      newPoints = createRectanglePoints(newCenterX - args.width / 2, newCenterY - args.height / 2, args.width, args.height);
    } else if (args.shapeType === "ellipse") {
      newPoints = createEllipsePoints(newCenterX, newCenterY, args.radiusX, args.radiusY);
    } else {
      // polygon
      const radius = Math.min(args.radiusX, args.radiusY);
      newPoints = createPolygonPoints(newCenterX, newCenterY, radius, args.sides);
    }

    // Recreate polygon with new points
    const newBaseColor: [number, number, number, number] = [args.baseColorR, args.baseColorG, args.baseColorB, args.baseColorA];
    const newMaterial = new UnlitColorMaterial({ baseColor: newBaseColor });
    const newPolygon = new Polygon2DObject(newPoints, {}, newMaterial);
    newPolygon.name = polygon.name;

    // Update entity
    (entity as unknown as { mesh: unknown; material: unknown; transform: unknown }).mesh = newPolygon.mesh;
    (entity as unknown as { mesh: unknown; material: unknown; transform: unknown }).material = newPolygon.material;
    (entity as unknown as { mesh: unknown; material: unknown; transform: unknown }).transform = newPolygon.transform;

    storyState.polygon = newPolygon;
    storyState.prevArgs = { ...args };
  };

  // Update material (cheap operation, can be done every frame)
  const updateMaterial = () => {
    const newBaseColor: [number, number, number, number] = [args.baseColorR, args.baseColorG, args.baseColorB, args.baseColorA];
    material.baseColor = newBaseColor;
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

  scene.viewport = { width: canvas.width || 800, height: canvas.height || 600 };

  arc.on("resize", () => {
    scene.viewport = { width: canvas.width, height: canvas.height };
    // Recalculate shape position on resize
    updateShape();
  });

  // Render loop - only update material (cheap), shape updates happen when args change
  let animationFrameId: number;
  const frame = () => {
    // Check if args changed (Storybook may update args between frames)
    const currentState = storyStateMap.get(id);
    if (currentState) {
      const prevArgs = currentState.prevArgs;
      const argsChanged =
        prevArgs.shapeType !== args.shapeType ||
        prevArgs.width !== args.width ||
        prevArgs.height !== args.height ||
        prevArgs.radiusX !== args.radiusX ||
        prevArgs.radiusY !== args.radiusY ||
        prevArgs.sides !== args.sides;

      if (argsChanged) {
        updateShape();
      }
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
    baseColorR: 0.2,
    baseColorG: 0.7,
    baseColorB: 0.9,
    baseColorA: 1,
    cameraZoom: 1,
  },
};

export const Rectangle: Story = {
  render: (args) => render(args, "rectangle"),
  args: {
    shapeType: "rect",
    width: 200,
    height: 150,
    radiusX: 100,
    radiusY: 75,
    sides: 6,
    baseColorR: 0.2,
    baseColorG: 0.7,
    baseColorB: 0.9,
    baseColorA: 1,
    cameraZoom: 1,
  },
};

export const Ellipse: Story = {
  render: (args) => render(args, "ellipse"),
  args: {
    shapeType: "ellipse",
    width: 200,
    height: 150,
    radiusX: 100,
    radiusY: 75,
    sides: 6,
    baseColorR: 0.9,
    baseColorG: 0.2,
    baseColorB: 0.5,
    baseColorA: 1,
    cameraZoom: 1,
  },
};

export const Polygon: Story = {
  render: (args) => render(args, "polygon"),
  args: {
    shapeType: "polygon",
    width: 200,
    height: 150,
    radiusX: 100,
    radiusY: 100,
    sides: 6,
    baseColorR: 0.2,
    baseColorG: 0.9,
    baseColorB: 0.4,
    baseColorA: 1,
    cameraZoom: 1,
  },
};

export const Triangle: Story = {
  render: (args) => render(args, "triangle"),
  args: {
    shapeType: "polygon",
    width: 200,
    height: 150,
    radiusX: 100,
    radiusY: 100,
    sides: 3,
    baseColorR: 0.9,
    baseColorG: 0.7,
    baseColorB: 0.2,
    baseColorA: 1,
    cameraZoom: 1,
  },
};

export const Pentagon: Story = {
  render: (args) => render(args, "pentagon"),
  args: {
    shapeType: "polygon",
    width: 200,
    height: 150,
    radiusX: 100,
    radiusY: 100,
    sides: 5,
    baseColorR: 0.6,
    baseColorG: 0.2,
    baseColorB: 0.9,
    baseColorA: 1,
    cameraZoom: 1,
  },
};

export const Octagon: Story = {
  render: (args) => render(args, "octagon"),
  args: {
    shapeType: "polygon",
    width: 200,
    height: 150,
    radiusX: 100,
    radiusY: 100,
    sides: 8,
    baseColorR: 0.2,
    baseColorG: 0.5,
    baseColorB: 0.9,
    baseColorA: 1,
    cameraZoom: 1,
  },
};
