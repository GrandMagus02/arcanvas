import type { Camera } from "@arcanvas/core";

/**
 * World units per CSS pixel from camera projection and canvas display size.
 * Used so handle quads render at constant screen size regardless of zoom.
 *
 * Returns the number of world units that correspond to 1 CSS pixel on screen.
 * This accounts for both camera zoom and device pixel ratio.
 *
 * Fallback to 1/pixelsPerUnit when projection bounds are not set (e.g. before controller attach).
 */
export function getWorldUnitsPerPixel(camera: Camera): number {
  const proj = camera.projection;
  const left = proj.left;
  const right = proj.right;
  const top = proj.top;
  const bottom = proj.bottom;
  const canvas = camera.arcanvas?.canvas;

  if (left !== undefined && right !== undefined && top !== undefined && bottom !== undefined && canvas) {
    // World dimensions from projection bounds
    const worldW = right - left;
    const worldH = top - bottom;

    // Get CSS pixel dimensions (what the user sees on screen)
    // Prefer clientWidth/Height, but fall back to physical dimensions / devicePixelRatio
    let cssW = canvas.clientWidth;
    let cssH = canvas.clientHeight;

    if (!cssW || !cssH) {
      // clientWidth/Height not available, estimate from physical pixels
      const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
      cssW = (canvas.width || 1) / dpr;
      cssH = (canvas.height || 1) / dpr;
    }

    // World units per CSS pixel
    const result = (worldW / cssW + worldH / cssH) / 2;

    // Debug logging - remove once issue is fixed
    if (typeof console !== "undefined" && (console as unknown as { _wuppLogged?: boolean })._wuppLogged !== true) {
      console.log("[getWorldUnitsPerPixel] projection:", { left, right, top, bottom });
      console.log("[getWorldUnitsPerPixel] world dims:", { worldW, worldH });
      console.log("[getWorldUnitsPerPixel] css dims:", { cssW, cssH });
      console.log("[getWorldUnitsPerPixel] result:", result);
      console.log("[getWorldUnitsPerPixel] expected 8px handle size in world units:", 8 * result);
      (console as unknown as { _wuppLogged?: boolean })._wuppLogged = true;
    }

    return result;
  }

  // Fallback when projection bounds aren't available
  const ppu = "pixelsPerUnit" in camera && typeof camera.pixelsPerUnit === "number" ? camera.pixelsPerUnit : 100;
  console.log("[getWorldUnitsPerPixel] FALLBACK used, ppu:", ppu, "result:", 1 / ppu);
  return 1 / ppu;
}
