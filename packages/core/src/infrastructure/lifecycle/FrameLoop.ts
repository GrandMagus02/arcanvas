/**
 * FrameLoop schedules update/render ticks using requestAnimationFrame.
 */
export type FrameCallback = (dtMs: number, timeMs: number) => void;

/**
 *
 */
export interface FrameLoopOptions {
  fixedDeltaMs?: number | null;
}

/**
 *
 */
export class FrameLoop {
  private _running = false;
  private _rafId: number | null = null;
  private _lastTime = 0;
  private _cb: FrameCallback;
  private _opts: FrameLoopOptions;

  constructor(cb: FrameCallback, opts: FrameLoopOptions = {}) {
    this._cb = cb;
    this._opts = opts;
  }

  start(): void {
    if (this._running) return;
    this._running = true;
    this._lastTime = performance.now();
    const loop = () => {
      if (!this._running) return;
      const now = performance.now();
      const dt = this._opts.fixedDeltaMs ?? now - this._lastTime;
      this._lastTime = now;
      this._cb(dt, now);
      this._rafId = requestAnimationFrame(loop);
    };
    this._rafId = requestAnimationFrame(loop);
  }

  stop(): void {
    if (!this._running) return;
    this._running = false;
    if (this._rafId !== null) cancelAnimationFrame(this._rafId);
    this._rafId = null;
  }
}

