import { Arcanvas, Camera, Camera2DController, EngineRenderSystem, TransformationMatrix } from "@arcanvas/core";
import { Mesh, RenderObject, createPositionNormalUVLayout, UnlitColorMaterial } from "@arcanvas/graphics";
import { Scene, Transform } from "@arcanvas/scene";
import type { Meta, StoryObj } from "@storybook/html";

interface Transform2DArgs {
  canvasWidth: number;
  canvasHeight: number;
  object1X: number;
  object1Y: number;
  object1Rotation: number;
  object1ScaleX: number;
  object1ScaleY: number;
  object2X: number;
  object2Y: number;
  object2Rotation: number;
  object2ScaleX: number;
  object2ScaleY: number;
  cameraZoom: number;
}

const cleanupMap = new Map<string, () => void>();

const meta: Meta<Transform2DArgs> = {
  title: "Scene/Transform2D/TranslationRotationScale",
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
    canvasWidth: {
      control: { type: "number", min: 200, max: 1920, step: 10 },
      description: "Canvas width",
      defaultValue: 800,
    },
    canvasHeight: {
      control: { type: "number", min: 200, max: 1080, step: 10 },
      description: "Canvas height",
      defaultValue: 600,
    },
    object1X: {
      control: { type: "range", min: 0, max: 800, step: 1 },
      description: "Object 1 X position",
      defaultValue: 200,
    },
    object1Y: {
      control: { type: "range", min: 0, max: 600, step: 1 },
      description: "Object 1 Y position",
      defaultValue: 200,
    },
    object1Rotation: {
      control: { type: "range", min: 0, max: 360, step: 1 },
      description: "Object 1 rotation (degrees)",
      defaultValue: 0,
    },
    object1ScaleX: {
      control: { type: "range", min: 0.1, max: 3, step: 0.1 },
      description: "Object 1 scale X",
      defaultValue: 1,
    },
    object1ScaleY: {
      control: { type: "range", min: 0.1, max: 3, step: 0.1 },
      description: "Object 1 scale Y",
      defaultValue: 1,
    },
    object2X: {
      control: { type: "range", min: 0, max: 800, step: 1 },
      description: "Object 2 X position",
      defaultValue: 500,
    },
    object2Y: {
      control: { type: "range", min: 0, max: 600, step: 1 },
      description: "Object 2 Y position",
      defaultValue: 300,
    },
    object2Rotation: {
      control: { type: "range", min: 0, max: 360, step: 1 },
      description: "Object 2 rotation (degrees)",
      defaultValue: 45,
    },
    object2ScaleX: {
      control: { type: "range", min: 0.1, max: 3, step: 0.1 },
      description: "Object 2 scale X",
      defaultValue: 1.5,
    },
    object2ScaleY: {
      control: { type: "range", min: 0.1, max: 3, step: 0.1 },
      description: "Object 2 scale Y",
      defaultValue: 0.8,
    },
    cameraZoom: {
      control: { type: "range", min: 0.01, max: 2, step: 0.01 },
      description: "Camera zoom level",
      defaultValue: 1,
    },
  },
};

export default meta;
type Story = StoryObj<Transform2DArgs>;

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
 * Renders the transform 2D story.
 */
function render(args: Transform2DArgs, id: string): HTMLElement {
  const existingCleanup = cleanupMap.get(id);
  if (existingCleanup) {
    existingCleanup();
    cleanupMap.delete(id);
  }

  const container = document.createElement("div");
  container.style.width = "100%";
  container.style.height = "100vh";
  container.style.display = "flex";
  container.style.justifyContent = "center";
  container.style.alignItems = "center";
  container.style.overflow = "hidden";

  const canvas = document.createElement("canvas");
  canvas.width = args.canvasWidth;
  canvas.height = args.canvasHeight;
  canvas.style.border = "1px solid #ccc";
  canvas.style.display = "block";
  container.appendChild(canvas);

  const updateCanvasSize = () => {
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const docAspectRatio = args.canvasWidth / args.canvasHeight;
    const containerAspectRatio = containerWidth / containerHeight;

    let displayWidth: number;
    let displayHeight: number;

    if (containerAspectRatio > docAspectRatio) {
      displayHeight = containerHeight;
      displayWidth = displayHeight * docAspectRatio;
    } else {
      displayWidth = containerWidth;
      displayHeight = displayWidth / docAspectRatio;
    }

    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
    canvas.style.maxWidth = "100%";
    canvas.style.maxHeight = "100%";
  };

  updateCanvasSize();

  // Initialize Arcanvas
  const arc = new Arcanvas(canvas, {
    width: args.canvasWidth,
    height: args.canvasHeight,
  });

  // Create scene
  const scene = new Scene({ width: args.canvasWidth, height: args.canvasHeight });

  // Create objects with transforms
  const mesh1 = createQuadMesh(80);
  const material1 = new UnlitColorMaterial({ baseColor: [1, 0.2, 0.2, 1] });
  const matrix1 = new TransformationMatrix();
  const transform1 = new Transform(matrix1);
  const obj1 = new RenderObject(mesh1, material1, transform1);
  obj1.name = "Object1";

  const mesh2 = createQuadMesh(80);
  const material2 = new UnlitColorMaterial({ baseColor: [0.2, 0.8, 0.2, 1] });
  const matrix2 = new TransformationMatrix();
  const transform2 = new Transform(matrix2);
  const obj2 = new RenderObject(mesh2, material2, transform2);
  obj2.name = "Object2";

  scene.addObject(obj1);
  scene.addObject(obj2);

  // Update transforms - reset to identity and apply transformations
  const updateTransforms = () => {
    // Reset matrix1 to identity by directly modifying _data (readonly means we can't reassign the array, but can modify elements)
    // Reset to identity matrix (row-major): [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]
    const data1 = (matrix1 as unknown as { _data: Float32Array })._data;
    data1[0] = 1;
    data1[1] = 0;
    data1[2] = 0;
    data1[3] = 0;
    data1[4] = 0;
    data1[5] = 1;
    data1[6] = 0;
    data1[7] = 0;
    data1[8] = 0;
    data1[9] = 0;
    data1[10] = 1;
    data1[11] = 0;
    data1[12] = 0;
    data1[13] = 0;
    data1[14] = 0;
    data1[15] = 1;
    // Apply transformations
    matrix1.translate(args.object1X, args.object1Y, 0);
    matrix1.rotateZ((args.object1Rotation * Math.PI) / 180);
    matrix1.scale(args.object1ScaleX, args.object1ScaleY, 1);

    // Reset matrix2 to identity
    const data2 = (matrix2 as unknown as { _data: Float32Array })._data;
    data2[0] = 1;
    data2[1] = 0;
    data2[2] = 0;
    data2[3] = 0;
    data2[4] = 0;
    data2[5] = 1;
    data2[6] = 0;
    data2[7] = 0;
    data2[8] = 0;
    data2[9] = 0;
    data2[10] = 1;
    data2[11] = 0;
    data2[12] = 0;
    data2[13] = 0;
    data2[14] = 0;
    data2[15] = 1;
    // Apply transformations
    matrix2.translate(args.object2X, args.object2Y, 0);
    matrix2.rotateZ((args.object2Rotation * Math.PI) / 180);
    matrix2.scale(args.object2ScaleX, args.object2ScaleY, 1);
  };

  updateTransforms();

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

  scene.viewport = { width: args.canvasWidth, height: args.canvasHeight };

  arc.on("resize", () => {
    if (canvas.width !== args.canvasWidth) {
      canvas.width = args.canvasWidth;
    }
    if (canvas.height !== args.canvasHeight) {
      canvas.height = args.canvasHeight;
    }
    scene.viewport = { width: args.canvasWidth, height: args.canvasHeight };
  });

  // Render loop
  let animationFrameId: number;
  const frame = () => {
    updateTransforms();
    renderSystem.renderOnce();
    animationFrameId = requestAnimationFrame(frame);
  };
  frame();

  const resizeObserver = new ResizeObserver(() => {
    updateCanvasSize();
  });
  resizeObserver.observe(container);

  const cleanup = () => {
    if (animationFrameId !== undefined) {
      cancelAnimationFrame(animationFrameId);
    }
    resizeObserver.disconnect();
  };

  cleanupMap.set(id, cleanup);

  return container;
}

export const Default: Story = {
  render: (args) => render(args, "default"),
  args: {
    canvasWidth: 800,
    canvasHeight: 600,
    object1X: 200,
    object1Y: 200,
    object1Rotation: 0,
    object1ScaleX: 1,
    object1ScaleY: 1,
    object2X: 500,
    object2Y: 300,
    object2Rotation: 45,
    object2ScaleX: 1.5,
    object2ScaleY: 0.8,
    cameraZoom: 1,
  },
};
