import { Arcanvas, Camera, Camera2DController, EngineRenderSystem, Scene, TransformationMatrix } from "@arcanvas/core";
import { createPositionNormalUVLayout, Mesh, PBRMaterial, RenderObject, UnlitColorMaterial } from "@arcanvas/graphics";
import { Transform } from "@arcanvas/scene";
import type { Meta, StoryObj } from "@storybook/html";

interface MaterialsArgs {
  canvasWidth: number;
  canvasHeight: number;
  materialType: "unlit" | "pbr";
  baseColorR: number;
  baseColorG: number;
  baseColorB: number;
  baseColorA: number;
  metallic: number;
  roughness: number;
  wireframe: boolean;
  cameraZoom: number;
}

const cleanupMap = new Map<string, () => void>();

const meta: Meta<MaterialsArgs> = {
  title: "Graphics/Material/MaterialShowcase",
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
    materialType: {
      control: "select",
      options: ["unlit", "pbr"],
      description: "Material type",
      defaultValue: "unlit",
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
    metallic: {
      control: { type: "range", min: 0, max: 1, step: 0.01 },
      description: "Metallic value (PBR only)",
      defaultValue: 0.5,
    },
    roughness: {
      control: { type: "range", min: 0, max: 1, step: 0.01 },
      description: "Roughness value (PBR only)",
      defaultValue: 0.5,
    },
    wireframe: {
      control: "boolean",
      description: "Show wireframe",
      defaultValue: false,
    },
    cameraZoom: {
      control: { type: "range", min: 0.01, max: 2, step: 0.01 },
      description: "Camera zoom level",
      defaultValue: 1,
    },
  },
};

export default meta;
type Story = StoryObj<MaterialsArgs>;

/**
 * Creates a centered quad mesh.
 */
function createQuadMesh(size: number): Mesh {
  const halfSize = size / 2;
  const vertices = new Float32Array([-halfSize, -halfSize, 0, 0, 0, 1, 0, 0, halfSize, -halfSize, 0, 0, 0, 1, 1, 0, halfSize, halfSize, 0, 0, 0, 1, 1, 1, -halfSize, halfSize, 0, 0, 0, 1, 0, 1]);

  const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);
  const layout = createPositionNormalUVLayout();

  return new Mesh(vertices, indices, layout, "triangles");
}

/**
 * Renders the materials story.
 */
function render(args: MaterialsArgs, id: string): HTMLElement {
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

  // Create mesh
  const mesh = createQuadMesh(150);
  const baseColor: [number, number, number, number] = [args.baseColorR, args.baseColorG, args.baseColorB, args.baseColorA];

  // Create material based on type
  let material: UnlitColorMaterial | PBRMaterial;
  if (args.materialType === "pbr") {
    material = new PBRMaterial({
      baseColor,
      metallic: args.metallic,
      roughness: args.roughness,
      wireframe: args.wireframe,
    });
  } else {
    material = new UnlitColorMaterial({
      baseColor,
      wireframe: args.wireframe,
    });
  }

  const matrix = new TransformationMatrix();
  matrix.translate(args.canvasWidth / 2, args.canvasHeight / 2, 0);
  const transform = new Transform(matrix);

  const obj = new RenderObject(mesh, material, transform);
  obj.name = "MaterialTest";
  scene.addObject(obj);

  // Update material properties
  const updateMaterial = () => {
    const baseColor: [number, number, number, number] = [args.baseColorR, args.baseColorG, args.baseColorB, args.baseColorA];

    if (args.materialType === "pbr") {
      if (material instanceof PBRMaterial) {
        material.baseColor = baseColor;
        material.metallic = args.metallic;
        material.roughness = args.roughness;
        material.wireframe = args.wireframe;
      } else {
        // Replace material
        const newMaterial = new PBRMaterial({
          baseColor,
          metallic: args.metallic,
          roughness: args.roughness,
          wireframe: args.wireframe,
        });
        obj.material = newMaterial;
        material = newMaterial;
      }
    } else {
      if (material instanceof UnlitColorMaterial) {
        material.baseColor = baseColor;
        material.wireframe = args.wireframe;
      } else {
        // Replace material
        const newMaterial = new UnlitColorMaterial({
          baseColor,
          wireframe: args.wireframe,
        });
        obj.material = newMaterial;
        material = newMaterial;
      }
    }
  };

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
    updateMaterial();
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

export const UnlitColor: Story = {
  render: (args) => render(args, "unlit"),
  args: {
    canvasWidth: 800,
    canvasHeight: 600,
    materialType: "unlit",
    baseColorR: 0.2,
    baseColorG: 0.7,
    baseColorB: 0.9,
    baseColorA: 1,
    metallic: 0.5,
    roughness: 0.5,
    wireframe: false,
    cameraZoom: 1,
  },
};

export const PBR: Story = {
  render: (args) => render(args, "pbr"),
  args: {
    canvasWidth: 800,
    canvasHeight: 600,
    materialType: "pbr",
    baseColorR: 0.8,
    baseColorG: 0.6,
    baseColorB: 0.2,
    baseColorA: 1,
    metallic: 0.8,
    roughness: 0.2,
    wireframe: false,
    cameraZoom: 1,
  },
};

export const Wireframe: Story = {
  render: (args) => render(args, "wireframe"),
  args: {
    canvasWidth: 800,
    canvasHeight: 600,
    materialType: "unlit",
    baseColorR: 0.2,
    baseColorG: 0.7,
    baseColorB: 0.9,
    baseColorA: 1,
    metallic: 0.5,
    roughness: 0.5,
    wireframe: true,
    cameraZoom: 1,
  },
};
