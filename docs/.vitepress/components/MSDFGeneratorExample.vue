<script setup lang="ts">
import { VPBadge, VPButton } from "vitepress/theme";
import { computed, ref, watch } from "vue";

const ATLAS_GENERATE_URL = "/__atlas-generate__";

type FieldType = "msdf" | "sdf" | "psdf";

/** Result from the atlas generator API (msdf-bmfont-xml) */
interface AtlasGeneratorFont {
  filename: string;
  data: string;
  settings: {
    opt: Record<string, unknown>;
    pages: string[];
    packer: { bins: unknown[] };
  };
}

interface FontAtlasResult {
  atlasDataUrl: string;
  json: AtlasGeneratorFont;
}

const fontFile = ref<File | null>(null);
const fontUrl = ref("https://raw.githubusercontent.com/google/fonts/main/ofl/ubuntu/Ubuntu-Regular.ttf");
const fontSize = ref(42);
const distanceRange = ref(4);
const padding = ref(2);
const fieldType = ref<FieldType>("msdf");
const charset = ref(" !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~");

const status = ref("Ready. Load a font file or use a URL.");
const isLoading = ref(false);
const result = ref<FontAtlasResult | null>(null);
const activeTab = ref<"atlas" | "json">("atlas");
const apiError = ref<string | null>(null);

const jsonPreview = computed(() => {
  if (!result.value) return "";
  return JSON.stringify(result.value.json, null, 2);
});

/** Parsed BMFont data from json.data when outputType is json */
interface ParsedBMFontCommon {
  scaleW: number;
  scaleH: number;
  lineHeight: number;
  base: number;
}
interface ParsedBMFont {
  common?: ParsedBMFontCommon;
  chars?: unknown[];
}

const atlasInfo = computed(() => {
  if (!result.value) return null;
  const { json } = result.value;
  try {
    const parsed = JSON.parse(json.data) as ParsedBMFont;
    if (parsed.common && Array.isArray(parsed.chars)) {
      return {
        width: parsed.common.scaleW,
        height: parsed.common.scaleH,
        glyphCount: parsed.chars.length,
        lineHeight: parsed.common.lineHeight,
        base: parsed.common.base,
      };
    }
  } catch {
    // json.data may be XML
  }
  return null;
});

/** Convert a Blob to base64 string (for API body) */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      resolve(dataUrl.split(",")[1] ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/** Call the atlas generator API (runs on VitePress dev server) */
async function callAtlasApi(fontBase64: string, filename: string): Promise<FontAtlasResult> {
  const options = {
    fontSize: fontSize.value,
    distanceRange: distanceRange.value,
    fieldType: fieldType.value,
    charset: charset.value.split(""),
    outputType: "json" as const,
    fontPadding: [padding.value, padding.value, padding.value, padding.value] as [number, number, number, number],
  };

  const res = await fetch(ATLAS_GENERATE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fontBase64, options, filename }),
  });

  const data = (await res.json()) as { dataUrl?: string; json?: AtlasGeneratorFont; error?: string };
  if (!res.ok || data.error) {
    throw new Error(data.error ?? `HTTP ${res.status}`);
  }
  if (!data.dataUrl || !data.json) {
    throw new Error("Invalid response: missing dataUrl or json");
  }
  return { atlasDataUrl: data.dataUrl, json: data.json };
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    fontFile.value = input.files[0] ?? null;
  }
}

async function generateFromFile() {
  if (!fontFile.value) {
    status.value = "Please select a font file first.";
    return;
  }

  isLoading.value = true;
  apiError.value = null;
  status.value = "Generating atlas...";

  try {
    const blob = new Blob([await fontFile.value.arrayBuffer()]);
    const fontBase64 = await blobToBase64(blob);
    const filename = fontFile.value.name;

    result.value = await callAtlasApi(fontBase64, filename);
    const count = atlasInfo.value?.glyphCount ?? 0;
    status.value = `Generated ${fieldType.value.toUpperCase()} atlas (${count} glyphs) using msdf-bmfont-xml`;
  } catch (err) {
    apiError.value = err instanceof Error ? err.message : String(err);
    status.value = `Error: ${apiError.value}`;
    result.value = null;
    console.error(err);
  } finally {
    isLoading.value = false;
  }
}

async function generateFromUrl() {
  if (!fontUrl.value) {
    status.value = "Please enter a font URL.";
    return;
  }

  isLoading.value = true;
  apiError.value = null;
  status.value = "Loading font from URL...";

  try {
    const response = await fetch(fontUrl.value);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    const fontBase64 = await blobToBase64(blob);
    const filename = fontUrl.value.split("/").pop()?.replace(/\.[^/.]+$/, "") ?? "font.ttf";

    status.value = "Generating atlas...";
    result.value = await callAtlasApi(fontBase64, filename);
    const count = atlasInfo.value?.glyphCount ?? 0;
    status.value = `Generated ${fieldType.value.toUpperCase()} atlas (${count} glyphs) using msdf-bmfont-xml`;
  } catch (err) {
    apiError.value = err instanceof Error ? err.message : String(err);
    status.value = `Error: ${apiError.value}`;
    result.value = null;
    console.error(err);
  } finally {
    isLoading.value = false;
  }
}

function downloadAtlas() {
  if (!result.value) return;

  const link = document.createElement("a");
  link.download = "font-atlas.png";
  link.href = result.value.atlasDataUrl;
  link.click();
}

function downloadJson() {
  if (!result.value) return;

  const blob = new Blob([JSON.stringify(result.value.json, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.download = "font-atlas.json";
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
}

// Reset result when options change
watch([fontSize, distanceRange, padding, fieldType, charset], () => {
  result.value = null;
});
</script>

<template>
  <div class="msdf-generator">
    <div class="status-bar" :class="{ loading: isLoading, error: apiError }">
      {{ status }}
    </div>

    <div v-if="apiError" class="wasm-warning">
      <strong>Atlas generation failed.</strong>
      <p>{{ apiError }}</p>
      <p class="hint">Ensure you run the docs dev server (<code>bun run docs:dev</code>) so the API is available.</p>
    </div>

    <div class="controls">
      <div class="section">
        <h3>Font Source</h3>
        <div class="input-group">
          <label>
            <span>Local File</span>
            <input type="file" accept=".ttf,.otf,.woff,.woff2" @change="onFileChange" />
          </label>
          <VPButton text="Generate from File" :disabled="!fontFile || isLoading" @click="generateFromFile" />
        </div>
        <div class="divider">OR</div>
        <div class="input-group">
          <label>
            <span>URL</span>
            <input v-model="fontUrl" type="text" placeholder="https://..." />
          </label>
          <VPButton text="Generate from URL" :disabled="!fontUrl || isLoading" @click="generateFromUrl" />
        </div>
      </div>

      <div class="section">
        <h3>Options</h3>
        <div class="options-grid">
          <label>
            <span>Field Type</span>
            <select v-model="fieldType">
              <option value="msdf">MSDF (Multi-channel)</option>
              <option value="sdf">SDF (Single-channel)</option>
              <option value="psdf">PSDF (Perpendicular)</option>
            </select>
          </label>
          <label>
            <span>Font Size</span>
            <input v-model.number="fontSize" type="number" min="8" max="128" />
          </label>
          <label>
            <span>Distance Range</span>
            <input v-model.number="distanceRange" type="number" min="1" max="16" />
          </label>
          <label>
            <span>Padding</span>
            <input v-model.number="padding" type="number" min="0" max="16" />
          </label>
        </div>
        <label class="charset-label">
          <span>Charset</span>
          <textarea v-model="charset" rows="2"></textarea>
        </label>
      </div>
    </div>

    <div v-if="result" class="result">
      <div class="result-header">
        <div class="tabs">
          <VPButton text="Atlas Preview" :class="{ active: activeTab === 'atlas' }" @click="activeTab = 'atlas'" />
          <VPButton text="JSON Data" :class="{ active: activeTab === 'json' }" @click="activeTab = 'json'" />
        </div>
        <div class="actions">
          <VPButton text="Download PNG" @click="downloadAtlas" />
          <VPButton text="Download JSON" @click="downloadJson" />
        </div>
      </div>

      <div v-if="atlasInfo" class="atlas-info">
        <span>{{ atlasInfo.width }}x{{ atlasInfo.height }}px</span>
        <span>{{ atlasInfo.glyphCount }} glyphs</span>
        <span>Line height: {{ atlasInfo.lineHeight }}</span>
        <VPBadge class="badge">msdf-bmfont-xml</VPBadge>
      </div>

      <div v-if="activeTab === 'atlas'" class="atlas-container">
        <img :src="result.atlasDataUrl" alt="Font Atlas" class="atlas-image" />
      </div>

      <div v-else class="json-container">
        <pre><code>{{ jsonPreview }}</code></pre>
      </div>
    </div>
  </div>
</template>

<style scoped>
.msdf-generator {
  font-family: system-ui, -apple-system, sans-serif;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
}

.status-bar {
  background: var(--vp-c-bg-alt);
  padding: 8px 12px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 13px;
  color: var(--vp-c-text-2);
  margin-bottom: 16px;
}

.status-bar.loading {
  color: var(--vp-c-brand-1);
}

.status-bar.error {
  color: var(--vp-c-warning-1);
}

.wasm-warning {
  background: var(--vp-c-warning-soft);
  border: 1px solid var(--vp-c-warning-1);
  border-radius: 6px;
  padding: 12px 16px;
  margin-bottom: 16px;
  font-size: 13px;
}

.wasm-warning strong {
  color: var(--vp-c-warning-1);
}

.wasm-warning p {
  margin: 8px 0 4px;
  color: var(--vp-c-text-2);
}

.wasm-warning p.hint {
  font-size: 12px;
  margin-top: 4px;
}

.wasm-warning code {
  display: block;
  background: var(--vp-c-bg);
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section {
  background: var(--vp-c-bg);
  padding: 16px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
}

.section h3 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.input-group {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.input-group label {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.input-group label span,
.options-grid label span,
.charset-label span {
  font-size: 12px;
  color: var(--vp-c-text-2);
}

.input-group input[type="text"],
.input-group input[type="file"] {
  padding: 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 13px;
}

.input-group input[type="file"] {
  padding: 6px;
}

.divider {
  text-align: center;
  color: var(--vp-c-text-3);
  font-size: 12px;
  margin: 12px 0;
  position: relative;
}

.divider::before,
.divider::after {
  content: "";
  position: absolute;
  top: 50%;
  width: calc(50% - 20px);
  height: 1px;
  background: var(--vp-c-divider);
}

.divider::before {
  left: 0;
}

.divider::after {
  right: 0;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

.options-grid label {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.options-grid select,
.options-grid input {
  padding: 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 13px;
}

.charset-label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 12px;
}

.charset-label textarea {
  padding: 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-family: monospace;
  font-size: 12px;
  resize: vertical;
}

.result {
  margin-top: 16px;
  background: var(--vp-c-bg);
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  overflow: hidden;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--vp-c-divider);
  flex-wrap: wrap;
  gap: 8px;
}

.tabs {
  display: flex;
  gap: 4px;
}

.tabs :deep(.active) {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.actions {
  display: flex;
  gap: 8px;
}

.atlas-info {
  display: flex;
  gap: 16px;
  padding: 8px 16px;
  background: var(--vp-c-bg-soft);
  font-size: 12px;
  color: var(--vp-c-text-2);
  align-items: center;
}

.badge {
  margin-left: auto;
}

.atlas-container {
  padding: 16px;
  background: #1e1e1e;
  display: flex;
  justify-content: center;
  overflow: auto;
}

.atlas-image {
  max-width: 100%;
  image-rendering: pixelated;
  border: 1px solid #333;
}

.json-container {
  max-height: 400px;
  overflow: auto;
  background: var(--vp-c-bg-alt);
}

.json-container pre {
  margin: 0;
  padding: 16px;
}

.json-container code {
  font-size: 12px;
  line-height: 1.5;
  color: var(--vp-c-text-2);
}
</style>
