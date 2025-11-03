import { BlendMode } from "./BlendMode";
import { GroupLayer, RasterLayer, type BaseLayer } from "./Layer";

/**
 * Map a blend mode to a Canvas2D composite operation.
 */
function mapBlendToComposite(b: BlendMode): GlobalCompositeOperation {
  switch (b) {
    case BlendMode.Multiply:
      return "multiply";
    case BlendMode.Screen:
      return "screen";
    case BlendMode.Overlay:
      return "overlay";
    default:
      return "source-over";
  }
}

/**
 * Options for composing a document to a canvas.
 */
export interface ComposeOptions {
  clearBefore?: boolean;
  background?: { r: number; g: number; b: number; a: number } | null;
  dirtyRect?: DOMRectReadOnly | null;
}

/**
 * Flattens a layer tree to a target 2D canvas using Canvas2D blend modes.
 */
export function composeToCanvas(target: HTMLCanvasElement, root: GroupLayer, opts: ComposeOptions = {}): void {
  const ctx = target.getContext("2d");
  if (!ctx) return;
  const width = target.width | 0;
  const height = target.height | 0;
  const dirty = opts.dirtyRect ?? new DOMRect(0, 0, width, height);

  if (opts.clearBefore !== false) {
    if (opts.background) {
      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.fillStyle = `rgba(${opts.background.r},${opts.background.g},${opts.background.b},${opts.background.a})`;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    } else {
      ctx.clearRect(dirty.x, dirty.y, dirty.width, dirty.height);
    }
  }

  drawLayer(ctx, root);
}

/**
 * Draw a layer to a canvas.
 */
function drawLayer(ctx: CanvasRenderingContext2D, layer: BaseLayer): void {
  if (!layer.visible || layer.opacity <= 0) return;
  // Apply transform (MVP: tx, ty, rotation, scaling)
  ctx.save();
  const t = layer.transform;
  ctx.translate(t.tx, t.ty);
  ctx.rotate(t.rotation);
  ctx.scale(t.sx, t.sy);

  ctx.globalAlpha = layer.opacity;
  ctx.globalCompositeOperation = mapBlendToComposite(layer.blendMode);

  if (layer instanceof GroupLayer) {
    for (const child of layer.children) drawLayer(ctx, child);
  } else if (layer instanceof RasterLayer) {
    const surf = layer.getSurface();
    if (surf) ctx.drawImage(surf, 0, 0);
  }

  ctx.restore();
}
