import { RenderPass, type PassContext } from "../RenderPass";

/**
 *
 */
export class ClearPass extends RenderPass {
  constructor(private color: [number, number, number, number]) {
    super();
  }

  name(): string {
    return "Clear";
  }

  execute(ctx: PassContext): void {
    const { gl } = ctx;

    // Validate clear color values
    if (!isFinite(this.color[0]) || !isFinite(this.color[1]) || !isFinite(this.color[2]) || !isFinite(this.color[3])) {
      console.error("ClearPass: Invalid clear color values:", this.color);
      return;
    }

    // Ensure color mask is enabled
    gl.colorMask(true, true, true, true);

    // Set clear color - this overrides any previous clear color setting
    gl.clearColor(this.color[0], this.color[1], this.color[2], this.color[3]);

    // Check for errors after setting clear color
    const error = gl.getError();
    if (error !== gl.NO_ERROR) {
      const errorNames: Record<number, string> = {
        0x0500: "INVALID_ENUM",
        0x0501: "INVALID_VALUE",
        0x0502: "INVALID_OPERATION",
        0x0503: "INVALID_FRAMEBUFFER_OPERATION",
        0x0505: "OUT_OF_MEMORY",
      };
      console.error(`ClearPass WebGL Error (clearColor):`, errorNames[error] || `0x${error.toString(16)}`);
    }

    // Clear both color and depth buffers
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Check for errors after clearing
    const clearError = gl.getError();
    if (clearError !== gl.NO_ERROR) {
      const errorNames: Record<number, string> = {
        0x0500: "INVALID_ENUM",
        0x0501: "INVALID_VALUE",
        0x0502: "INVALID_OPERATION",
        0x0503: "INVALID_FRAMEBUFFER_OPERATION",
        0x0505: "OUT_OF_MEMORY",
      };
      console.error(`ClearPass WebGL Error (clear):`, errorNames[clearError] || `0x${clearError.toString(16)}`);
    }
  }
}
