import { Arcanvas } from "../../Arcanvas";

/**
 * Plugin that automatically resizes the canvas to its parent element.
 * Falls back to `Arcanvas` options when no parent is present.
 */
export class AutoResize {
  private observer: ResizeObserver | null = null;

  constructor(private readonly arcanvas: Arcanvas) {
    this.init();
    this.arcanvas.provide(AutoResize, this);
  }

  private init() {
    const canvas = this.arcanvas.canvas;
    const parent = canvas.parentElement;
    const HasResizeObserver = typeof ResizeObserver !== "undefined";
    if (parent && HasResizeObserver) {
      // Fill parent and keep backing store in sync with parent size
      canvas.style.width = "100%";
      canvas.style.height = "100%";

      const resizeNow = () => {
        const rect = parent.getBoundingClientRect();
        const width = Math.max(0, Math.floor(rect.width || 0));
        const height = Math.max(0, Math.floor(rect.height || 0));
        if (canvas.width !== width) {
          canvas.width = width;
        }
        if (canvas.height !== height) {
          canvas.height = height;
        }
      };

      this.observer = new ResizeObserver(() => resizeNow());
      this.observer.observe(parent);
      // Initial sync
      resizeNow();
      return;
    }

    // Fallback to options if no parent element is available
    const { width, height } = this.arcanvas.getOptions();
    if (typeof width === "number") {
      canvas.width = width;
    }
    if (typeof height === "number") {
      canvas.height = height;
    }
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.observer = null;
  }
}

export const autoResizePlugin = (arcanvas: Arcanvas) => new AutoResize(arcanvas);
