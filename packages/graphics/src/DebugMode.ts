/**
 * Debug visualization modes for rendering.
 * These modes help visualize mesh structure and rendering characteristics.
 */
export type DebugMode =
  | "none" // Normal rendering
  | "triangles" // Each triangle with a unique random color
  | "wireframe" // Wireframe overlay
  | "normals" // Visualize vertex normals
  | "uv" // Visualize UV coordinates as colors
  | "depth"; // Visualize depth buffer

/**
 * Options for debug rendering.
 */
export interface DebugOptions {
  /**
   * The debug visualization mode.
   * @default "none"
   */
  mode: DebugMode;

  /**
   * Opacity of the debug overlay (0-1).
   * Only used when combining debug view with normal rendering.
   * @default 1.0
   */
  opacity?: number;

  /**
   * Seed for random color generation in triangle mode.
   * Use the same seed for consistent colors across frames.
   * @default undefined (random each frame)
   */
  colorSeed?: number;

  /**
   * Whether to show wireframe on top of the debug visualization.
   * @default false
   */
  wireframeOverlay?: boolean;
}

/**
 * Default debug options.
 */
export const DEFAULT_DEBUG_OPTIONS: DebugOptions = {
  mode: "none",
  opacity: 1.0,
  wireframeOverlay: false,
};

/**
 * Simple seeded random number generator for consistent colors.
 */
export function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

/**
 * Generates a random color with optional seed.
 * Colors are chosen to be visually distinct (avoiding very dark colors).
 */
export function generateTriangleColor(triangleIndex: number, seed?: number): [number, number, number, number] {
  // Use golden ratio for better color distribution
  const goldenRatio = 0.618033988749895;
  const hue = ((triangleIndex * goldenRatio + (seed ?? 0) * 0.1) % 1.0) * 360;

  // Convert HSV to RGB (saturation = 0.7, value = 0.9 for vivid colors)
  const s = 0.7;
  const v = 0.9;
  const c = v * s;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = v - c;

  let r = 0,
    g = 0,
    b = 0;
  if (hue < 60) {
    r = c;
    g = x;
  } else if (hue < 120) {
    r = x;
    g = c;
  } else if (hue < 180) {
    g = c;
    b = x;
  } else if (hue < 240) {
    g = x;
    b = c;
  } else if (hue < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  return [r + m, g + m, b + m, 1.0];
}
