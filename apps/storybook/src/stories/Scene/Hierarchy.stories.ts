import { Arcanvas, AutoResizePlugin, Camera, Camera2DController, EngineRenderSystem, TransformationMatrix } from "@arcanvas/core";
import { createPositionNormalUVLayout, Mesh, RenderObject, UnlitColorMaterial } from "@arcanvas/graphics";
import { Entity, Scene, Transform } from "@arcanvas/scene";
import type { Meta, StoryObj } from "@storybook/html";

interface HierarchyArgs {
  showGroup1: boolean;
  showGroup2: boolean;
  showObject1: boolean;
  showObject2: boolean;
  showObject3: boolean;
  cameraZoom: number;
}

const cleanupMap = new Map<string, () => void>();

const meta: Meta<HierarchyArgs> = {
  title: "Scene/Node/HierarchyView",
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
    showGroup1: {
      control: "boolean",
      description: "Show Group 1",
      defaultValue: true,
    },
    showGroup2: {
      control: "boolean",
      description: "Show Group 2",
      defaultValue: true,
    },
    showObject1: {
      control: "boolean",
      description: "Show Object 1",
      defaultValue: true,
    },
    showObject2: {
      control: "boolean",
      description: "Show Object 2",
      defaultValue: true,
    },
    showObject3: {
      control: "boolean",
      description: "Show Object 3",
      defaultValue: true,
    },
    cameraZoom: {
      control: { type: "range", min: 0.01, max: 2, step: 0.01 },
      description: "Camera zoom level",
      defaultValue: 0.1,
    },
  },
};

export default meta;
type Story = StoryObj<HierarchyArgs>;

/**
 * Creates a quad mesh.
 */
function createQuadMesh(size: number): Mesh {
  const vertices = new Float32Array([0, 0, 0, 0, 0, 1, 0, 0, size, 0, 0, 0, 0, 1, 1, 0, size, size, 0, 0, 0, 1, 1, 1, 0, size, 0, 0, 0, 1, 0, 1]);

  const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);
  const layout = createPositionNormalUVLayout();

  return new Mesh(vertices, indices, layout, "triangles");
}

/**
 * Creates a render object with the specified position and color.
 */
function createRenderObject(x: number, y: number, color: [number, number, number, number], name: string): RenderObject {
  const mesh = createQuadMesh(50);
  const material = new UnlitColorMaterial({ baseColor: color });
  const matrix = new TransformationMatrix();
  matrix.translate(x, y, 0);
  const transform = new Transform(matrix);

  const obj = new RenderObject(mesh, material, transform);
  obj.name = name;
  return obj;
}

/**
 * Renders the hierarchy story.
 */
function render(args: HierarchyArgs, id: string): HTMLElement {
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

  // Create scene - will be updated on resize
  const scene = new Scene({ width: canvas.width || 800, height: canvas.height || 600 });

  // Create hierarchy: root → group1 → object1, object2 | group2 → object3
  const root = new Entity("Root");
  const group1 = new Entity("Group1");
  const group2 = new Entity("Group2");

  const obj1 = createRenderObject(100, 100, [1, 0, 0, 1], "Object1");
  const obj2 = createRenderObject(200, 100, [0, 1, 0, 1], "Object2");
  const obj3 = createRenderObject(150, 200, [0, 0, 1, 1], "Object3");

  // Build hierarchy
  group1.add(obj1);
  group1.add(obj2);
  group2.add(obj3);
  root.add(group1);
  root.add(group2);

  // Add to scene
  scene.addObject(root);

  // Update visibility based on args
  const updateVisibility = () => {
    group1.visible = args.showGroup1;
    group2.visible = args.showGroup2;
    obj1.visible = args.showObject1;
    obj2.visible = args.showObject2;
    obj3.visible = args.showObject3;
  };

  updateVisibility();

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
  });

  // Render loop
  let animationFrameId: number;
  const frame = () => {
    updateVisibility();
    renderSystem.renderOnce();
    animationFrameId = requestAnimationFrame(frame);
  };
  frame();

  const cleanup = () => {
    if (animationFrameId !== undefined) {
      cancelAnimationFrame(animationFrameId);
    }
  };

  cleanupMap.set(id, cleanup);

  return container;
}

export const Default: Story = {
  render: (args) => render(args, "default"),
  args: {
    showGroup1: true,
    showGroup2: true,
    showObject1: true,
    showObject2: true,
    showObject3: true,
    cameraZoom: 1,
  },
};
