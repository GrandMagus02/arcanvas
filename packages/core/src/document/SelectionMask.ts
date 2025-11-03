/**
 *
 */
export class SelectionMask {
  private canvas: OffscreenCanvas | null = null;

  constructor(
    private width: number,
    private height: number
  ) {
    if (typeof OffscreenCanvas !== "undefined") {
      this.canvas = new OffscreenCanvas(width, height);
    }
  }

  getCanvas(): OffscreenCanvas | null {
    return this.canvas;
  }

  clear(): void {
    if (!this.canvas) return;
    const ctx = this.canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, this.width, this.height);
  }
}
