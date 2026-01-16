/**
 *
 */
export class StateCache {
  private blendEnabled = false;
  private depthTest = false;

  setBlend(gl: WebGLRenderingContext, enabled: boolean): void {
    if (this.blendEnabled === enabled) return;
    this.blendEnabled = enabled;
    if (enabled) gl.enable(gl.BLEND);
    else gl.disable(gl.BLEND);
  }

  setDepthTest(gl: WebGLRenderingContext, enabled: boolean): void {
    if (this.depthTest === enabled) return;
    this.depthTest = enabled;
    if (enabled) gl.enable(gl.DEPTH_TEST);
    else gl.disable(gl.DEPTH_TEST);
  }
}
