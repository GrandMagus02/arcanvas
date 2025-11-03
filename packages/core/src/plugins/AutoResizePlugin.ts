import { Plugin } from "../Plugin";

/**
 * Plugin that automatically resizes the canvas to its parent element.
 */
export class AutoResizePlugin extends Plugin {
  private _observer: ResizeObserver | null = null;

  setup(): void {
    const canvas = this.app.canvas;
    const parent = canvas.parentElement;

    const hasResizeObserver = typeof ResizeObserver !== "undefined";

    if (parent && hasResizeObserver) {
      if (!canvas.style.width) canvas.style.width = "100%";
      if (!canvas.style.height) canvas.style.height = "100%";

      this._observer = new ResizeObserver(() => {
        const dpr = typeof window !== "undefined" && window.devicePixelRatio ? window.devicePixelRatio : 1;
        const cssWidth = Math.max(0, Math.floor(parent.clientWidth || 0));
        const cssHeight = Math.max(0, Math.floor(parent.clientHeight || 0));
        const width = Math.max(0, Math.floor(cssWidth * dpr));
        const height = Math.max(0, Math.floor(cssHeight * dpr));
        if (canvas.width !== width || canvas.height !== height) {
          this.app.resize(width, height);
        }
      });
      this._observer.observe(parent);
    } else if (!hasResizeObserver) {
      console.warn("ResizeObserver is not supported in this browser.");
    }
  }

  destroy(): void {
    if (this._observer) this._observer.disconnect();
    this._observer = null;
  }
}
