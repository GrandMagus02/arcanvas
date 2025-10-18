import { type Plugin } from "../../Arcanvas";

/**
 * Plugin that automatically resizes the canvas to its parent element.
 * Falls back to `Arcanvas` options when no parent is present.
 */

export const AutoResize: Plugin<"autoResize", unknown> = {
  name: "autoResize",
  setup(ctx) {
    let observer: ResizeObserver | null = null;
    const canvas = ctx.canvas;
    const parent = canvas.parentElement;
    const HasResizeObserver = typeof ResizeObserver !== "undefined";
    if (parent && HasResizeObserver) {
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      const resizeNow = () => {
        const rect = parent.getBoundingClientRect();
        const width = Math.max(0, Math.floor(rect.width || 0));
        const height = Math.max(0, Math.floor(rect.height || 0));
        if (canvas.width !== width) canvas.width = width;
        if (canvas.height !== height) canvas.height = height;
      };
      observer = new ResizeObserver(() => resizeNow());
      observer.observe(parent);
      resizeNow();
    }
    ctx.hooks.onDestroy(() => {
      if (observer) observer.disconnect();
      observer = null;
    });
    return {};
  },
};
