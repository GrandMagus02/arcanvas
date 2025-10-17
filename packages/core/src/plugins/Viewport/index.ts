import { Arcanvas, type ArcanvasPluginInstance } from "../../Arcanvas";

export interface ViewportOptions {
  scale?: number;
  translation?: { x: number; y: number };
  minScale?: number;
  maxScale?: number;
}

/**
 * Maintains a simple 2D view transform (scale + translation) and
 * provides helpers to convert between world and screen coordinates.
 */
export class Viewport implements ArcanvasPluginInstance {
  destroy(): void {
    // TODO: Implement
  }

  private readonly arcanvas: Arcanvas;
  private scaleValue = 1;
  private translationX = 0;
  private translationY = 0;
  private minScale = 0.05;
  private maxScale = 20;

  constructor(arcanvas: Arcanvas, options: ViewportOptions = {}) {
    this.arcanvas = arcanvas;
    if (typeof options.scale === "number") this.scaleValue = options.scale;
    if (options.translation) {
      this.translationX = options.translation.x || 0;
      this.translationY = options.translation.y || 0;
    }
    if (typeof options.minScale === "number") this.minScale = options.minScale;
    if (typeof options.maxScale === "number") this.maxScale = options.maxScale;
    // Register in DI so other plugins/consumers can inject the shared Viewport
    this.arcanvas.provide(Viewport, this);
  }

  get scale(): number {
    return this.scaleValue;
  }

  set scale(v: number) {
    this.scaleValue = this.clampScale(v);
  }

  get translation(): { x: number; y: number } {
    return { x: this.translationX, y: this.translationY };
  }

  set translation(t: { x: number; y: number }) {
    this.translationX = t.x;
    this.translationY = t.y;
  }

  setScale(nextScale: number) {
    this.scale = nextScale;
  }

  setTranslation(x: number, y: number) {
    this.translationX = x;
    this.translationY = y;
  }

  translateBy(dx: number, dy: number) {
    this.translationX += dx;
    this.translationY += dy;
  }

  zoomAtScreenPoint(factor: number, screenX: number, screenY: number) {
    const before = this.screenToWorld(screenX, screenY);
    this.scale = this.scale * factor;
    const after = this.screenToWorld(screenX, screenY);
    // Keep the point under the cursor stationary by offsetting translation
    this.translationX += screenX - (after.x * this.scale + this.translationX);
    this.translationY += screenY - (after.y * this.scale + this.translationY);
    // Alternatively, translate by the world delta mapped back to screen space
    const dx = (before.x - after.x) * this.scale;
    const dy = (before.y - after.y) * this.scale;
    this.translateBy(dx, dy);
  }

  clampScale(next: number): number {
    return Math.max(this.minScale, Math.min(this.maxScale, next));
  }

  applyTransform(ctx: CanvasRenderingContext2D) {
    ctx.setTransform(this.scaleValue, 0, 0, this.scaleValue, this.translationX, this.translationY);
  }

  reset() {
    this.scaleValue = 1;
    this.translationX = 0;
    this.translationY = 0;
  }

  worldToScreen(wx: number, wy: number): { x: number; y: number } {
    return {
      x: wx * this.scaleValue + this.translationX,
      y: wy * this.scaleValue + this.translationY,
    };
  }

  screenToWorld(sx: number, sy: number): { x: number; y: number } {
    return {
      x: (sx - this.translationX) / this.scaleValue,
      y: (sy - this.translationY) / this.scaleValue,
    };
  }

  getVisibleWorldBounds(): { minX: number; minY: number; maxX: number; maxY: number } {
    const canvas = this.arcanvas.canvas;
    const topLeft = this.screenToWorld(0, 0);
    const bottomRight = this.screenToWorld(canvas.width, canvas.height);
    return { minX: topLeft.x, minY: topLeft.y, maxX: bottomRight.x, maxY: bottomRight.y };
  }
}

export const viewportPlugin = (arcanvas: Arcanvas) => new Viewport(arcanvas);
