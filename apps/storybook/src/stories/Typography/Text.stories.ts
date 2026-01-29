import { Arcanvas, AutoResizePlugin, Camera, Camera2DController, EngineRenderSystem } from "@arcanvas/core";
import { RenderObject, UnlitColorMaterial } from "@arcanvas/graphics";
import { Entity, Scene } from "@arcanvas/scene";
import { FontLoader, TextGeometry } from "@arcanvas/typography";
import type { Meta, StoryObj } from "@storybook/html";

interface TextArgs {
  text: string;
  fontSize: number;
  width: number;
  align: "left" | "center" | "right";
  overflow: "visible" | "hidden" | "ellipsis";
  wordWrap: "normal" | "break-word" | "break-all" | "nowrap";
  colorR: number;
  colorG: number;
  colorB: number;
  colorA: number;
  cameraZoom: number;
  debugTriangles: boolean;
  resolutionScale: number;
}

const cleanupMap = new Map<string, () => void>();
let cachedFont: Awaited<ReturnType<typeof FontLoader.load>> | null = null;

const meta: Meta<TextArgs> = {
  title: "Typography/Text",
  tags: ["autodocs"],
  argTypes: {
    text: {
      control: "text",
      description: "Text to render",
      defaultValue: "Hello Arcanvas Typography!\nThis is a multiline text sample.\nTesting wrapping and alignment.",
    },
    fontSize: {
      control: { type: "range", min: 8, max: 200, step: 1 },
      description: "Font Size in pixels",
      defaultValue: 48,
    },
    width: {
      control: { type: "range", min: 100, max: 1000, step: 10 },
      description: "Wrapping Width",
      defaultValue: 400,
    },
    align: {
      control: "select",
      options: ["left", "center", "right"],
      defaultValue: "left",
    },
    overflow: {
      control: "select",
      options: ["visible", "hidden", "ellipsis"],
      defaultValue: "visible",
    },
    wordWrap: {
      control: "select",
      options: ["normal", "break-word", "break-all", "nowrap"],
      defaultValue: "normal",
    },
    colorR: { control: { type: "range", min: 0, max: 1, step: 0.01 }, defaultValue: 1 },
    colorG: { control: { type: "range", min: 0, max: 1, step: 0.01 }, defaultValue: 1 },
    colorB: { control: { type: "range", min: 0, max: 1, step: 0.01 }, defaultValue: 1 },
    colorA: { control: { type: "range", min: 0, max: 1, step: 0.01 }, defaultValue: 1 },
    cameraZoom: { control: { type: "range", min: 0.1, max: 2, step: 0.1 }, defaultValue: 1 },
    debugTriangles: {
      control: "boolean",
      description: "Show triangle structure with unique colors (UE4/UE5 style)",
      defaultValue: false,
    },
    resolutionScale: {
      control: { type: "range", min: 0.01, max: 5, step: 0.01 },
      description: "Canvas resolution scale (1 = native, <1 = pixelated, >1 = sharper)",
      defaultValue: 1,
    },
  },
};

export default meta;
type Story = StoryObj<TextArgs>;

// We need a font URL. Using a Google Font via CDN (OpenType support needed).
// Roboto is a safe bet.
// Using Cloudflare CDN which serves TTF files directly
const TTF_URL = "https://cdnjs.cloudflare.com/ajax/libs/materialize/0.98.1/fonts/roboto/Roboto-Regular.ttf";

/**
 *
 */
async function render(args: TextArgs, id: string): Promise<HTMLElement> {
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
  container.style.position = "relative";

  const canvas = document.createElement("canvas");
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.display = "block";
  container.appendChild(canvas);

  const loading = document.createElement("div");
  loading.innerText = "Loading Font...";
  loading.style.position = "absolute";
  loading.style.top = "20px";
  loading.style.left = "20px";
  loading.style.color = "black";
  loading.style.background = "white";
  loading.style.padding = "5px";
  loading.style.zIndex = "10";
  container.appendChild(loading);

  try {
    // Cache font to avoid repeated loading
    if (!cachedFont) {
      cachedFont = await FontLoader.load(TTF_URL);
    }
    const font = cachedFont;
    loading.remove();

    // Initialize Arcanvas with resolution scale for pixelation debug
    const arc = new Arcanvas(canvas, { resolutionScale: args.resolutionScale });
    arc.use(AutoResizePlugin);

    // Create scene
    const scene = new Scene({ width: canvas.width || 800, height: canvas.height || 600 });

    // Create text mesh
    const mesh = TextGeometry.create(args.text, font, {
      fontSize: args.fontSize,
      width: args.width,
      align: args.align,
      overflow: args.overflow,
      wordWrap: args.wordWrap,
    });

    console.log("[Text.stories] Mesh created:", {
      vertexCount: mesh.vertexCount,
      verticesLength: mesh.vertices.length,
      indexCount: mesh.indices.length,
      hasVertices: mesh.vertices.length > 0,
      hasIndices: mesh.indices.length > 0,
      layout: mesh.layout,
    });

    if (mesh.vertices.length === 0) {
      console.warn("[Text.stories] WARNING: Mesh has no vertices! Text will not render.");
    }

    const material = new UnlitColorMaterial({
      baseColor: [args.colorR, args.colorG, args.colorB, args.colorA],
    });

    const renderObject = new RenderObject(mesh, material);
    renderObject.name = "Text";

    // Position text: Center it in world space (0, 0 is screen center with orthographic camera)
    // TextGeometry creates text with baseline at y=0 and ascending upward (negative Y in screen coords)
    // We need to offset to center the text block
    const tx = -args.width / 2; // Center horizontally
    const ty = args.fontSize / 2; // Offset to roughly center vertically

    // Set translation in transform matrix (column-major: column 3 is translation)
    renderObject.transform.matrix.set(3, 0, tx);
    renderObject.transform.matrix.set(3, 1, ty);
    renderObject.transform.matrix.set(3, 2, 0);

    // Wrap in Entity (same pattern as Shape2D story)
    const entity = new Entity("Text", "text-entity");
    (entity as any).mesh = renderObject.mesh;
    (entity as any).material = renderObject.material;
    (entity as any).transform = renderObject.transform;

    scene.addObject(entity);

    console.log("[Text.stories] Entity added to scene:", {
      entityName: entity.name,
      hasMesh: !!(entity as any).mesh,
      hasMaterial: !!(entity as any).material,
      hasTransform: !!(entity as any).transform,
      sceneEntities: scene.entities.length,
      sceneRenderObjects: scene.renderObjects.length,
    });

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

    // Set debug mode based on args (UE4/UE5 style triangle visualization)
    renderSystem.setDebugTriangles(args.debugTriangles);

    // Update scene viewport (important!)
    scene.viewport = { width: canvas.width || 800, height: canvas.height || 600 };

    // Handle resize
    arc.on("resize", () => {
      scene.viewport = { width: canvas.width, height: canvas.height };
    });

    // Render loop
    let animationFrameId: number;
    const frame = () => {
      renderSystem.renderOnce();
      animationFrameId = requestAnimationFrame(frame);
    };
    frame();

    const cleanup = () => {
      cancelAnimationFrame(animationFrameId);
      cleanupMap.delete(id);
    };
    cleanupMap.set(id, cleanup);
  } catch (err) {
    loading.innerText = "Error loading font: " + err;
    console.error("[Text.stories] Error:", err);
  }

  return container;
}

export const Basic: Story = {
  render: (args) => {
    const el = document.createElement("div");
    render(args, "basic").then((dom) => {
      el.appendChild(dom);
    });
    return el;
  },
  args: {
    text: "Hello Arcanvas!\nTypography System",
    fontSize: 64,
    width: 600,
    align: "left",
    overflow: "visible",
    wordWrap: "normal",
    colorR: 1.0,
    colorG: 1.0,
    colorB: 1.0,
    colorA: 1,
    cameraZoom: 1,
    debugTriangles: false,
    resolutionScale: 1,
  },
};

export const Paragraph: Story = {
  render: (args) => {
    const el = document.createElement("div");
    render(args, "paragraph").then((dom) => {
      el.appendChild(dom);
    });
    return el;
  },
  args: {
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    fontSize: 24,
    width: 400,
    align: "left",
    overflow: "visible",
    wordWrap: "normal",
    colorR: 0.9,
    colorG: 0.9,
    colorB: 0.9,
    colorA: 1,
    cameraZoom: 1,
    debugTriangles: false,
    resolutionScale: 1,
  },
};
