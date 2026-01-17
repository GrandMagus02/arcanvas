import { Arcanvas, AutoResizePlugin, Camera, Camera2DController, EngineRenderSystem, TransformationMatrix } from "@arcanvas/core";
import { createPositionNormalUVLayout, Mesh, PBRMaterial, RenderObject, UnlitColorMaterial } from "@arcanvas/graphics";
import { Scene, Transform } from "@arcanvas/scene";
import type { Meta, StoryObj } from "@storybook/html";

interface MaterialsArgs {
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
  const updateQuadPosition = () => {
    const width = canvas.width || 800;
    const height = canvas.height || 600;
    // Reset matrix to identity by directly modifying _data
    const data = (matrix as unknown as { _data: Float32Array })._data;
    data[0] = 1;
    data[1] = 0;
    data[2] = 0;
    data[3] = 0;
    data[4] = 0;
    data[5] = 1;
    data[6] = 0;
    data[7] = 0;
    data[8] = 0;
    data[9] = 0;
    data[10] = 1;
    data[11] = 0;
    data[12] = 0;
    data[13] = 0;
    data[14] = 0;
    data[15] = 1;
    matrix.translate(width / 2, height / 2, 0);
  };
  updateQuadPosition();
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

  scene.viewport = { width: canvas.width || 800, height: canvas.height || 600 };

  arc.on("resize", () => {
    updateQuadPosition();
    scene.viewport = { width: canvas.width, height: canvas.height };
  });

  // Render loop
  let animationFrameId: number;
  const frame = () => {
    updateMaterial();
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

export const UnlitColor: Story = {
  render: (args) => render(args, "unlit"),
  args: {
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
