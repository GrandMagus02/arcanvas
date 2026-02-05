/**
 * @arcanvas/runtime - Frame Loop
 *
 * Manages the render/update loop with timing and control.
 */

/**
 * Frame timing information.
 */
export interface FrameInfo {
  /** Time since last frame in seconds */
  deltaTime: number;
  /** Total elapsed time in seconds */
  elapsedTime: number;
  /** Frame number (starts at 0) */
  frameNumber: number;
  /** Current timestamp in milliseconds */
  timestamp: number;
}

/**
 * Frame callback function.
 */
export type FrameCallback = (info: FrameInfo) => void;

/**
 * Frame loop configuration.
 */
export interface FrameLoopConfig {
  /** Target frames per second (0 = uncapped, default: 0) */
  targetFps?: number;
  /** Maximum delta time to prevent spiral of death (default: 0.1 = 100ms) */
  maxDeltaTime?: number;
  /** Whether to start immediately (default: false) */
  autoStart?: boolean;
}

/**
 * Animation frame loop manager.
 *
 * @example
 * ```ts
 * const loop = new FrameLoop();
 *
 * loop.onFrame(({ deltaTime, frameNumber }) => {
 *   console.log(`Frame ${frameNumber}, dt: ${deltaTime.toFixed(3)}s`);
 *   // Update and render...
 * });
 *
 * loop.start();
 *
 * // Later...
 * loop.stop();
 * ```
 */
export class FrameLoop {
  private readonly _callbacks: Set<FrameCallback> = new Set();
  private readonly _maxDeltaTime: number;
  private readonly _minFrameTime: number;

  private _running = false;
  private _frameId: number | null = null;
  private _lastTimestamp = 0;
  private _elapsedTime = 0;
  private _frameNumber = 0;
  private _accumulator = 0;

  constructor(config: FrameLoopConfig = {}) {
    this._maxDeltaTime = config.maxDeltaTime ?? 0.1;
    this._minFrameTime = config.targetFps ? 1000 / config.targetFps : 0;

    if (config.autoStart) {
      this.start();
    }
  }

  /**
   * Whether the loop is currently running.
   */
  get running(): boolean {
    return this._running;
  }

  /**
   * Current frame number.
   */
  get frameNumber(): number {
    return this._frameNumber;
  }

  /**
   * Total elapsed time in seconds.
   */
  get elapsedTime(): number {
    return this._elapsedTime;
  }

  /**
   * Register a frame callback.
   *
   * @param callback - Function to call each frame
   * @returns Unsubscribe function
   */
  onFrame(callback: FrameCallback): () => void {
    this._callbacks.add(callback);
    return () => this._callbacks.delete(callback);
  }

  /**
   * Start the frame loop.
   */
  start(): void {
    if (this._running) return;

    this._running = true;
    this._lastTimestamp = performance.now();
    this._frameId = requestAnimationFrame(this.tick);
  }

  /**
   * Stop the frame loop.
   */
  stop(): void {
    if (!this._running) return;

    this._running = false;
    if (this._frameId !== null) {
      cancelAnimationFrame(this._frameId);
      this._frameId = null;
    }
  }

  /**
   * Reset timing state.
   */
  reset(): void {
    this._elapsedTime = 0;
    this._frameNumber = 0;
    this._lastTimestamp = performance.now();
    this._accumulator = 0;
  }

  /**
   * Request a single frame (for manual stepping).
   */
  step(deltaTime = 1 / 60): void {
    const info: FrameInfo = {
      deltaTime,
      elapsedTime: this._elapsedTime,
      frameNumber: this._frameNumber,
      timestamp: performance.now(),
    };

    this._elapsedTime += deltaTime;
    this._frameNumber++;

    for (const callback of this._callbacks) {
      try {
        callback(info);
      } catch (error) {
        console.error("Error in frame callback:", error);
      }
    }
  }

  /**
   * Internal tick function.
   */
  private tick = (timestamp: number): void => {
    if (!this._running) return;

    // Calculate delta time
    let deltaTime = (timestamp - this._lastTimestamp) / 1000;

    // Clamp to prevent spiral of death
    if (deltaTime > this._maxDeltaTime) {
      deltaTime = this._maxDeltaTime;
    }

    // Frame rate limiting
    if (this._minFrameTime > 0) {
      this._accumulator += timestamp - this._lastTimestamp;
      if (this._accumulator < this._minFrameTime) {
        this._frameId = requestAnimationFrame(this.tick);
        return;
      }
      this._accumulator = 0;
    }

    this._lastTimestamp = timestamp;

    // Call frame callbacks
    const info: FrameInfo = {
      deltaTime,
      elapsedTime: this._elapsedTime,
      frameNumber: this._frameNumber,
      timestamp,
    };

    this._elapsedTime += deltaTime;
    this._frameNumber++;

    for (const callback of this._callbacks) {
      try {
        callback(info);
      } catch (error) {
        console.error("Error in frame callback:", error);
      }
    }

    // Schedule next frame
    this._frameId = requestAnimationFrame(this.tick);
  };

  /**
   * Dispose the frame loop.
   */
  dispose(): void {
    this.stop();
    this._callbacks.clear();
  }
}

/**
 * Create a new frame loop.
 */
export function createFrameLoop(config?: FrameLoopConfig): FrameLoop {
  return new FrameLoop(config);
}
