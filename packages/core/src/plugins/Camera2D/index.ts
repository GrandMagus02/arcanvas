import { Arcanvas } from "../../Arcanvas";
import { Viewport } from "../Viewport";

export interface Camera2DOptions {
  viewport?: Viewport;
  panButton?: number; // 0 left, 1 middle, 2 right
}

/**
 * Camera2D wires basic pointer-driven panning to a `Viewport`.
 * Hold the configured mouse button and drag to pan. Consumers can
 * also drive it programmatically via `panBy`/`setPosition`.
 */
export class Camera2D {
  private readonly arcanvas: Arcanvas;
  private readonly viewport: Viewport;
  private panButton: number = 0;

  private isPanning = false;
  private lastScreenX = 0;
  private lastScreenY = 0;

  private boundOnPointerDown?: (e: PointerEvent) => void;
  private boundOnPointerMove?: (e: PointerEvent) => void;
  private boundOnPointerUp?: (e: PointerEvent) => void;
  private boundOnLeave?: (e: PointerEvent) => void;

  constructor(arcanvas: Arcanvas, options: Camera2DOptions = {}) {
    this.arcanvas = arcanvas;
    const injected = options.viewport ?? arcanvas.inject<Viewport>(Viewport);
    this.viewport = injected ?? new Viewport(arcanvas);
    this.panButton = options.panButton ?? 0;
    this.attach();
    this.arcanvas.provide(Camera2D, this);
  }

  getViewport(): Viewport {
    return this.viewport;
  }

  private attach() {
    const canvas = this.arcanvas.canvas;
    canvas.style.touchAction = "none"; // prevent default panning/zooming on touch devices

    this.boundOnPointerDown = (e: PointerEvent) => {
      if (e.button !== this.panButton) return;
      this.isPanning = true;
      this.lastScreenX = e.clientX;
      this.lastScreenY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    };

    this.boundOnPointerMove = (e: PointerEvent) => {
      if (!this.isPanning) return;
      const dx = e.clientX - this.lastScreenX;
      const dy = e.clientY - this.lastScreenY;
      this.lastScreenX = e.clientX;
      this.lastScreenY = e.clientY;
      this.panBy(dx, dy);
    };

    this.boundOnPointerUp = (e: PointerEvent) => {
      if (e.button !== this.panButton) return;
      this.isPanning = false;
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {}
    };

    this.boundOnLeave = () => {
      this.isPanning = false;
    };

    canvas.addEventListener("pointerdown", this.boundOnPointerDown);
    canvas.addEventListener("pointermove", this.boundOnPointerMove);
    canvas.addEventListener("pointerup", this.boundOnPointerUp);
    canvas.addEventListener("pointerleave", this.boundOnLeave);
  }

  destroy() {
    const canvas = this.arcanvas.canvas;
    if (this.boundOnPointerDown) canvas.removeEventListener("pointerdown", this.boundOnPointerDown);
    if (this.boundOnPointerMove) canvas.removeEventListener("pointermove", this.boundOnPointerMove);
    if (this.boundOnPointerUp) canvas.removeEventListener("pointerup", this.boundOnPointerUp);
    if (this.boundOnLeave) canvas.removeEventListener("pointerleave", this.boundOnLeave);
  }

  setPosition(screenTranslationX: number, screenTranslationY: number) {
    this.viewport.setTranslation(screenTranslationX, screenTranslationY);
  }

  panBy(deltaScreenX: number, deltaScreenY: number) {
    this.viewport.translateBy(deltaScreenX, deltaScreenY);
  }
}

export const camera2DPlugin = (arcanvas: Arcanvas) => new Camera2D(arcanvas);
