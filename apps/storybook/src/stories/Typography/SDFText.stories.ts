import { Arcanvas, AutoResizePlugin, Camera, Camera2DController, EngineRenderSystem } from "@arcanvas/core";
import { RenderObject, SDFTextMaterial } from "@arcanvas/graphics";
import { Entity, Scene } from "@arcanvas/scene";
import { loadSDFFont, SDFTextGeometry } from "@arcanvas/typography";
import type { Meta, StoryObj } from "@storybook/html";

interface SDFTextArgs {
  text: string;
  fontSize: number;
  letterSpacing: number;
  lineHeight: number;
  align: "left" | "center" | "right";
  maxWidth: number;
  colorR: number;
  colorG: number;
  colorB: number;
  colorA: number;
  cameraZoom: number;
  debugTriangles: boolean;
  resolutionScale: number;
}

const cleanupMap = new Map<string, () => void>();

// Cache for loaded fonts
let cachedFont: Awaited<ReturnType<typeof loadSDFFont>> | null = null;
let cachedAtlasImage: HTMLImageElement | null = null;

const meta: Meta<SDFTextArgs> = {
  title: "Typography/SDF Text",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
## SDF/MSDF Text Rendering

This story demonstrates **atlas-based text rendering** using Signed Distance Fields (SDF) or Multi-channel Signed Distance Fields (MSDF).

### How it works:
- Each glyph is rendered as a **quad (2 triangles)** instead of triangulated outlines
- Glyphs are sampled from a pre-generated **font atlas texture**
- The fragment shader uses **distance field thresholding** for crisp edges at any scale
- **fwidth/derivatives** enable proper antialiasing

### Benefits:
- **Constant geometry**: 2 triangles per glyph regardless of complexity
- **Scale-independent**: Sharp at any size without regenerating geometry
- **Memory efficient**: Single atlas texture for all text
- **Fast rendering**: Minimal vertex processing

### Comparison with Vector Text:
| Feature | Vector (Triangulated) | SDF/MSDF Atlas |
|---------|----------------------|----------------|
| Triangles per glyph | 10-100+ | 2 |
| Small text quality | Poor (too many triangles) | Excellent |
| Large text quality | Excellent | Good (limited by atlas resolution) |
| Scaling | Requires regeneration | Instant |
| Memory | Per-instance | Shared atlas |
        `,
      },
    },
  },
  argTypes: {
    text: {
      control: "text",
      description: "Text to render",
    },
    fontSize: {
      control: { type: "range", min: 8, max: 200, step: 1 },
      description: "Font size in pixels",
    },
    letterSpacing: {
      control: { type: "range", min: -10, max: 20, step: 0.5 },
      description: "Letter spacing in pixels",
    },
    lineHeight: {
      control: { type: "range", min: 0.5, max: 3, step: 0.1 },
      description: "Line height multiplier",
    },
    align: {
      control: "select",
      options: ["left", "center", "right"],
    },
    maxWidth: {
      control: { type: "range", min: 0, max: 1000, step: 10 },
      description: "Max width for word wrap (0 = no wrap)",
    },
    colorR: { control: { type: "range", min: 0, max: 1, step: 0.01 } },
    colorG: { control: { type: "range", min: 0, max: 1, step: 0.01 } },
    colorB: { control: { type: "range", min: 0, max: 1, step: 0.01 } },
    colorA: { control: { type: "range", min: 0, max: 1, step: 0.01 } },
    cameraZoom: { control: { type: "range", min: 0.1, max: 5, step: 0.1 } },
    debugTriangles: {
      control: "boolean",
      description: "Show triangle structure (should only be 2 per glyph!)",
    },
    resolutionScale: {
      control: { type: "range", min: 0.25, max: 2, step: 0.05 },
      description: "Canvas resolution scale",
    },
  },
};

export default meta;
type Story = StoryObj<SDFTextArgs>;

// Demo MSDF font - using a publicly available one
// In production, you'd generate your own with msdf-bmfont-xml or msdfgen
const DEMO_FONTS = [
  {
    name: "Roboto MSDF (A-Frame assets)",
    jsonUrl: "https://cdn.jsdelivr.net/gh/aframevr/assets@master/fonts/Roboto-msdf.json",
    atlasUrl: "https://cdn.jsdelivr.net/gh/aframevr/assets@master/fonts/Roboto-msdf.png",
  },
  {
    name: "Roboto MSDF (GitHub raw)",
    jsonUrl: "https://raw.githubusercontent.com/aframevr/assets/master/fonts/Roboto-msdf.json",
    atlasUrl: "https://raw.githubusercontent.com/aframevr/assets/master/fonts/Roboto-msdf.png",
  },
];

async function loadAtlasImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error(`Failed to load atlas image: ${e}`));
    img.src = url;
  });
}

async function loadFontWithFallbacks() {
  let lastError: unknown = null;
  for (const source of DEMO_FONTS) {
    try {
      const [font, atlasImage] = await Promise.all([loadSDFFont(source.jsonUrl), loadAtlasImage(source.atlasUrl)]);
      return { font, atlasImage, source };
    } catch (err) {
      lastError = err;
      console.warn(`[SDFText.stories] Failed to load ${source.name}`, err);
    }
  }
  throw lastError ?? new Error("Failed to load any SDF font source");
}

async function render(args: SDFTextArgs, id: string): Promise<HTMLElement> {
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
  loading.innerText = "Loading MSDF Font Atlas...";
  loading.style.position = "absolute";
  loading.style.top = "20px";
  loading.style.left = "20px";
  loading.style.color = "white";
  loading.style.background = "rgba(0,0,0,0.7)";
  loading.style.padding = "10px";
  loading.style.borderRadius = "4px";
  loading.style.zIndex = "10";
  container.appendChild(loading);

  // Info panel
  const info = document.createElement("div");
  info.style.position = "absolute";
  info.style.bottom = "20px";
  info.style.left = "20px";
  info.style.color = "white";
  info.style.background = "rgba(0,0,0,0.7)";
  info.style.padding = "10px";
  info.style.borderRadius = "4px";
  info.style.fontSize = "12px";
  info.style.fontFamily = "monospace";
  info.style.zIndex = "10";
  container.appendChild(info);

  try {
    // Load font and atlas with fallback sources
    const { font, atlasImage, source } = cachedFont && cachedAtlasImage ? { font: cachedFont, atlasImage: cachedAtlasImage, source: DEMO_FONTS[0] } : await loadFontWithFallbacks();

    // Cache for subsequent renders
    if (!cachedFont) cachedFont = font;
    if (!cachedAtlasImage) cachedAtlasImage = atlasImage;

    loading.remove();

    // Initialize Arcanvas
    const arc = new Arcanvas(canvas, { resolutionScale: args.resolutionScale });
    arc.use(AutoResizePlugin);

    // Create scene
    const scene = new Scene({ width: canvas.width || 800, height: canvas.height || 600 });

    // Create SDF text geometry
    const { mesh, metrics } = SDFTextGeometry.createWithMetrics(args.text, font, {
      fontSize: args.fontSize,
      letterSpacing: args.letterSpacing,
      lineHeight: args.lineHeight,
      align: args.align,
      maxWidth: args.maxWidth > 0 ? args.maxWidth : undefined,
    });

    // Update info panel
    info.innerHTML = `
      <strong>SDF Text Metrics:</strong><br>
      Glyphs: ${metrics.glyphCount}<br>
      Triangles: ${metrics.glyphCount * 2} (2 per glyph)<br>
      Lines: ${metrics.lineCount}<br>
      Size: ${metrics.width.toFixed(1)} × ${metrics.height.toFixed(1)} px<br>
      <br>
      <strong>Font:</strong><br>
      ${font.info.face} (${font.distanceField?.fieldType || "msdf"})<br>
      Atlas: ${font.common.scaleW}×${font.common.scaleH}<br>
      Distance Range: ${font.distanceField?.distanceRange || 4}<br>
      <br>
      <strong>Source:</strong> ${source?.name || "cached"}<br>
      <br>
      <strong>Compare with vector text:</strong><br>
      Vector would use ~${metrics.glyphCount * 30}-${metrics.glyphCount * 100} triangles
    `;

    console.log("[SDFText.stories] Mesh created:", {
      glyphCount: metrics.glyphCount,
      triangles: metrics.glyphCount * 2,
      vertices: mesh.vertices.length / 5,
      indices: mesh.indices.length,
      fontInfo: {
        face: font.info.face,
        size: font.info.size,
        distanceField: font.distanceField,
        atlasSize: `${font.common.scaleW}x${font.common.scaleH}`,
      },
    });

    // Create SDF material
    const material = new SDFTextMaterial({
      atlas: atlasImage,
      color: [args.colorR, args.colorG, args.colorB, args.colorA],
      sdfType: font.distanceField?.fieldType || "msdf",
      distanceRange: font.distanceField?.distanceRange || 4,
      atlasSize: [font.common.scaleW, font.common.scaleH],
    });

    const renderObject = new RenderObject(mesh, material);
    renderObject.name = "SDFText";

    // Position text at center
    const tx = -metrics.width / 2;
    const ty = metrics.height / 2;
    renderObject.transform.matrix.set(3, 0, tx);
    renderObject.transform.matrix.set(3, 1, ty);
    renderObject.transform.matrix.set(3, 2, 0);

    // Wrap in Entity
    const entity = new Entity("SDFText", "sdf-text-entity");
    (entity as any).mesh = renderObject.mesh;
    (entity as any).material = renderObject.material;
    (entity as any).transform = renderObject.transform;

    scene.addObject(entity);

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

    // Set debug mode
    renderSystem.setDebugTriangles(args.debugTriangles);

    // Update scene viewport
    scene.viewport = { width: canvas.width || 800, height: canvas.height || 600 };

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
    loading.innerText = "Error: " + err;
    console.error("[SDFText.stories] Error:", err);
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
    text: "Hello MSDF!\nSharp at any size",
    fontSize: 64,
    letterSpacing: 0,
    lineHeight: 1.2,
    align: "center",
    maxWidth: 0,
    colorR: 1.0,
    colorG: 1.0,
    colorB: 1.0,
    colorA: 1,
    cameraZoom: 1,
    debugTriangles: false,
    resolutionScale: 1,
  },
};

export const SmallText: Story = {
  render: (args) => {
    const el = document.createElement("div");
    render(args, "small").then((dom) => {
      el.appendChild(dom);
    });
    return el;
  },
  args: {
    text: "SDF text stays crisp even at small sizes!\nNo extra triangles needed.\nCompare with vector text at 12px.",
    fontSize: 16,
    letterSpacing: 0,
    lineHeight: 1.4,
    align: "left",
    maxWidth: 400,
    colorR: 0.9,
    colorG: 0.9,
    colorB: 0.9,
    colorA: 1,
    cameraZoom: 1,
    debugTriangles: false,
    resolutionScale: 1,
  },
};

export const LargeScaled: Story = {
  render: (args) => {
    const el = document.createElement("div");
    render(args, "large").then((dom) => {
      el.appendChild(dom);
    });
    return el;
  },
  args: {
    text: "BIG",
    fontSize: 200,
    letterSpacing: 10,
    lineHeight: 1,
    align: "center",
    maxWidth: 0,
    colorR: 0.2,
    colorG: 0.8,
    colorB: 1.0,
    colorA: 1,
    cameraZoom: 1,
    debugTriangles: false,
    resolutionScale: 1,
  },
};

export const TriangleComparison: Story = {
  render: (args) => {
    const el = document.createElement("div");
    render(args, "comparison").then((dom) => {
      el.appendChild(dom);
    });
    return el;
  },
  parameters: {
    docs: {
      description: {
        story: "Enable **Debug Triangles** to see that each glyph uses only 2 triangles (1 quad), regardless of glyph complexity.",
      },
    },
  },
  args: {
    text: "MSDF uses 2△ per glyph!",
    fontSize: 48,
    letterSpacing: 0,
    lineHeight: 1.2,
    align: "center",
    maxWidth: 0,
    colorR: 1.0,
    colorG: 0.8,
    colorB: 0.2,
    colorA: 1,
    cameraZoom: 1,
    debugTriangles: true,
    resolutionScale: 1,
  },
};
