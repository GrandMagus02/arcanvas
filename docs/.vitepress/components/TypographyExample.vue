<script setup lang="ts">
import { Arcanvas, AutoResizePlugin, Camera, Camera2DController, EngineRenderSystem } from "@arcanvas/core";
import { GridObject } from "@arcanvas/feature-2d";
import { RenderObject, UnlitColorMaterial } from "@arcanvas/graphics";
import { Scene } from "@arcanvas/scene";
import { FontLoader, TextGeometry, type Font } from "@arcanvas/typography";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

const canvasRef = ref<HTMLCanvasElement | null>(null);
const currentFont = ref<Font | null>(null);
let arc: Arcanvas | null = null;
let scene: Scene | null = null;
let renderSystem: EngineRenderSystem | null = null;
let animationId: number | null = null;
let textObject: RenderObject | null = null;
let grid: GridObject | null = null;
let cameraController: Camera2DController | null = null;

const status = ref("Upload a font file to get started");
const text = ref("Hello Arcanvas!");
const fontSize = ref(64);
const color = ref("#ffffff");
const fontName = ref("No font loaded");
const showGrid = ref(true);

const colorRgb = computed(() => {
  const hex = color.value.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  return [r, g, b, 1] as [number, number, number, number];
});

onMounted(() => {
  if (!canvasRef.value) return;

  arc = new Arcanvas(canvasRef.value);
  arc.use(AutoResizePlugin);

  scene = new Scene({ width: 800, height: 600 });

  const camera = new Camera(arc);
  camera.pixelsPerUnit = 1;
  arc.setCamera(camera);

  // Add camera controls for pan/zoom
  cameraController = new Camera2DController();
  cameraController.attach(camera);
  cameraController.enable();

  renderSystem = new EngineRenderSystem(canvasRef.value, scene, camera, { backend: "webgl" });

  // Force initial resize to container size
  const parent = canvasRef.value.parentElement;
  if (parent) {
    const rect = parent.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      arc.resize(rect.width, rect.height);
    }
  }

  // Create grid
  grid = new GridObject({
    plane: "XY",
    cellSize: 50,
    majorDivisions: 4,
    adaptiveSpacing: true,
    fixedPixelSize: true,
    minCellPixelSize: 20,
    baseColor: [0.08, 0.08, 0.08, 1],
    minorColor: [0.2, 0.2, 0.2, 0.5],
    majorColor: [0.35, 0.35, 0.35, 0.8],
    xAxisColor: [0.6, 0.15, 0.15, 1],
    yAxisColor: [0.15, 0.6, 0.15, 1],
  });
  scene.addObject(grid);

  arc.on("resize", (width, height) => {
    if (scene) scene.viewport = { width, height };
  });

  startRenderLoop();
});

async function handleFontUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  status.value = "Loading font...";
  try {
    currentFont.value = await FontLoader.fromFile(file);
    fontName.value = file.name.replace(/\.(ttf|otf|woff|woff2)$/i, "");
    status.value = "Ready - drag to pan, scroll to zoom";
    updateText();
  } catch (err) {
    status.value = "Error: Invalid font file";
    console.error(err);
  }
}

function updateText() {
  if (!scene || !currentFont.value || !text.value) return;

  if (textObject) {
    textObject.remove();
    textObject = null;
  }

  try {
    const mesh = TextGeometry.create(text.value, currentFont.value, {
      fontSize: fontSize.value,
      align: "left",
    });

    const material = new UnlitColorMaterial({ baseColor: colorRgb.value });
    textObject = new RenderObject(mesh, material);
    // Position text near origin
    textObject.transform.matrix.translate(20, 80, 0);
    scene.addObject(textObject);
  } catch (err) {
    console.error("Error creating text:", err);
  }
}

function startRenderLoop() {
  const frame = () => {
    if (!renderSystem) return;
    renderSystem.renderOnce();
    animationId = requestAnimationFrame(frame);
  };
  frame();
}

function toggleGrid() {
  if (!scene || !grid) return;
  if (showGrid.value) {
    scene.addObject(grid);
  } else {
    grid.remove();
  }
}

function resetView() {
  if (cameraController) {
    cameraController.zoom = 1;
    cameraController.panX = 0;
    cameraController.panY = 0;
  }
}

watch([text, fontSize, color], () => {
  updateText();
});

onBeforeUnmount(() => {
  if (animationId !== null) {
    cancelAnimationFrame(animationId);
  }
  cameraController?.disable();
  arc?.destroy();
});
</script>

<template>
  <div class="typography-example">
    <div class="controls">
      <div class="control-group">
        <label>
          <span class="label">Text</span>
          <input v-model="text" type="text" placeholder="Enter text..." class="text-input" />
        </label>
      </div>

      <div class="control-row">
        <label class="control-group">
          <span class="label">Size</span>
          <input v-model.number="fontSize" type="range" min="12" max="200" class="slider" />
          <span class="value">{{ fontSize }}px</span>
        </label>

        <label class="control-group">
          <span class="label">Color</span>
          <input v-model="color" type="color" class="color-picker" />
        </label>

        <label class="control-group checkbox">
          <input type="checkbox" v-model="showGrid" @change="toggleGrid" />
          <span>Grid</span>
        </label>

        <button class="reset-btn" @click="resetView">Reset View</button>
      </div>

      <div class="control-group">
        <span class="label">Font</span>
        <div class="font-controls">
          <span class="font-name">{{ fontName }}</span>
          <label class="upload-btn">
            Upload Font
            <input type="file" accept=".ttf,.otf,.woff,.woff2" @change="handleFontUpload" hidden />
          </label>
        </div>
      </div>
    </div>

    <div class="canvas-container">
      <canvas ref="canvasRef"></canvas>
      <div v-if="!currentFont" class="no-font-overlay">
        <div class="no-font-message">
          <p>Upload a font file to render text</p>
          <p class="hint">Supports .ttf and .otf formats</p>
        </div>
      </div>
      <div class="status">{{ status }}</div>
      <div class="controls-hint">Drag to pan | Scroll to zoom</div>
    </div>
  </div>
</template>

<style scoped>
.typography-example {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  background: #1e1e1e;
  border: 1px solid #333;
}

.controls {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-bottom: 1px solid #333;
  background: #252529;
}

.control-row {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-group.checkbox {
  gap: 4px;
  color: #aaa;
  font-size: 13px;
}

.control-group.checkbox input {
  accent-color: #4a9eff;
}

.label {
  color: #888;
  font-size: 12px;
  min-width: 40px;
}

.text-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #444;
  border-radius: 4px;
  background: #2a2a2a;
  color: #fff;
  font-size: 14px;
}

.text-input:focus {
  outline: none;
  border-color: #666;
}

.slider {
  width: 120px;
  accent-color: #4a9eff;
}

.value {
  color: #aaa;
  font-size: 12px;
  min-width: 50px;
}

.color-picker {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: transparent;
}

.font-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.font-name {
  color: #ccc;
  font-size: 14px;
}

.upload-btn {
  padding: 6px 12px;
  background: #4a9eff;
  border: none;
  border-radius: 4px;
  color: #fff;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-btn:hover {
  background: #5aafff;
}

.reset-btn {
  padding: 6px 12px;
  background: #333;
  border: 1px solid #444;
  border-radius: 4px;
  color: #aaa;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-btn:hover {
  background: #444;
  color: #fff;
}

.canvas-container {
  position: relative;
  height: 400px;
}

canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.status {
  position: absolute;
  bottom: 10px;
  left: 10px;
  color: #666;
  font-family: monospace;
  font-size: 11px;
  background: rgba(0, 0, 0, 0.5);
  padding: 4px 8px;
  border-radius: 4px;
}

.controls-hint {
  position: absolute;
  bottom: 10px;
  right: 10px;
  color: #555;
  font-family: monospace;
  font-size: 10px;
  background: rgba(0, 0, 0, 0.5);
  padding: 4px 8px;
  border-radius: 4px;
}

.no-font-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(30, 30, 30, 0.85);
  pointer-events: none;
}

.no-font-message {
  text-align: center;
  color: #888;
}

.no-font-message p {
  margin: 0;
  font-size: 16px;
}

.no-font-message .hint {
  margin-top: 8px;
  font-size: 12px;
  color: #666;
}
</style>
