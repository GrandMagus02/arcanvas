import { Matrix4 } from "@arcanvas/matrix";
import { ProjectionMode } from "./ProjectionMode";

/**
 * OrthographicProjectionMatrixOptions is an interface for the options of the OrthographicProjectionMatrix.
 * @param left - The left boundary of the viewport.
 * @param right - The right boundary of the viewport.
 * @param bottom - The bottom boundary of the viewport.
 * @param top - The top boundary of the viewport.
 * @param near - The near plane of the viewport.
 * @param far - The far plane of the viewport.
 */
export interface OrthographicProjectionMatrixOptions {
  left: number;
  right: number;
  bottom: number;
  top: number;
  near: number;
  far: number;
}

/**
 * PerspectiveProjectionMatrixOptions is an interface for the options of the PerspectiveProjectionMatrix.
 * @param fovY - The field of view angle in the vertical direction.
 * @param aspect - The aspect ratio of the viewport.
 * @param near - The near plane of the viewport.
 * @param far - The far plane of the viewport.
 */
export interface PerspectiveProjectionMatrixOptions {
  fovY: number;
  aspect: number;
  near: number;
  far: number;
}

/**
 * ProjectionMatrixOptions is a discriminated union type for the options of the ProjectionMatrix.
 */
export type ProjectionMatrixOptions<T extends ProjectionMode> = (T extends ProjectionMode.Perspective ? PerspectiveProjectionMatrixOptions : OrthographicProjectionMatrixOptions) & {
  mode: T;
};

const DEFAULT_PERSPECTIVE_OPTIONS: ProjectionMatrixOptions<ProjectionMode.Perspective> = {
  mode: ProjectionMode.Perspective,
  fovY: (60 * Math.PI) / 180,
  aspect: 1,
  near: 0.1,
  far: 1000,
};

const DEFAULT_ORTHOGRAPHIC_OPTIONS: ProjectionMatrixOptions<ProjectionMode.Orthographic> = {
  mode: ProjectionMode.Orthographic,
  left: -1,
  right: 1,
  bottom: -1,
  top: 1,
  near: 0.1,
  far: 1000,
};

/**
 * ProjectionMatrix is a 4x4 matrix that represents a projection in 3D space.
 */
export class ProjectionMatrix<T extends ProjectionMode = ProjectionMode.Perspective> extends Matrix4 {
  private _options: ProjectionMatrixOptions<T>;

  constructor(options: Partial<ProjectionMatrixOptions<T>> = {}) {
    super(new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]));

    // Determine mode from options or default to Perspective
    const mode = options.mode ?? ProjectionMode.Perspective;

    // Initialize with appropriate defaults
    if (mode === ProjectionMode.Perspective) {
      this._options = {
        ...DEFAULT_PERSPECTIVE_OPTIONS,
        ...options,
      } as unknown as ProjectionMatrixOptions<T>;
    } else {
      this._options = {
        ...DEFAULT_ORTHOGRAPHIC_OPTIONS,
        ...options,
      } as unknown as ProjectionMatrixOptions<T>;
    }

    this.update();
  }

  get mode(): T {
    return this._options.mode;
  }

  // Perspective-only properties
  get fovY(): number | undefined {
    if (this._options.mode === ProjectionMode.Perspective) {
      return (this._options as ProjectionMatrixOptions<ProjectionMode.Perspective>).fovY;
    }
    return undefined;
  }

  set fovY(value: number) {
    if (this._options.mode === ProjectionMode.Perspective) {
      (this._options as ProjectionMatrixOptions<ProjectionMode.Perspective>).fovY = value;
      this.update();
    }
  }

  get aspect(): number | undefined {
    if (this._options.mode === ProjectionMode.Perspective) {
      return (this._options as ProjectionMatrixOptions<ProjectionMode.Perspective>).aspect;
    }
    return undefined;
  }

  set aspect(value: number) {
    if (this._options.mode === ProjectionMode.Perspective) {
      (this._options as ProjectionMatrixOptions<ProjectionMode.Perspective>).aspect = value;
      this.update();
    }
  }

  // Common properties
  get near(): number {
    return this._options.near;
  }

  set near(value: number) {
    this._options.near = value;
    this.update();
  }

  get far(): number {
    return this._options.far;
  }

  set far(value: number) {
    this._options.far = value;
    this.update();
  }

  // Orthographic-only properties
  get left(): number | undefined {
    if (this._options.mode === ProjectionMode.Orthographic) {
      return (this._options as ProjectionMatrixOptions<ProjectionMode.Orthographic>).left;
    }
    return undefined;
  }

  set left(value: number) {
    if (this._options.mode === ProjectionMode.Orthographic) {
      (this._options as ProjectionMatrixOptions<ProjectionMode.Orthographic>).left = value;
      this.update();
    }
  }

  get right(): number | undefined {
    if (this._options.mode === ProjectionMode.Orthographic) {
      return (this._options as ProjectionMatrixOptions<ProjectionMode.Orthographic>).right;
    }
    return undefined;
  }

  set right(value: number) {
    if (this._options.mode === ProjectionMode.Orthographic) {
      (this._options as ProjectionMatrixOptions<ProjectionMode.Orthographic>).right = value;
      this.update();
    }
  }

  get bottom(): number | undefined {
    if (this._options.mode === ProjectionMode.Orthographic) {
      return (this._options as ProjectionMatrixOptions<ProjectionMode.Orthographic>).bottom;
    }
    return undefined;
  }

  set bottom(value: number) {
    if (this._options.mode === ProjectionMode.Orthographic) {
      (this._options as ProjectionMatrixOptions<ProjectionMode.Orthographic>).bottom = value;
      this.update();
    }
  }

  get top(): number | undefined {
    if (this._options.mode === ProjectionMode.Orthographic) {
      return (this._options as ProjectionMatrixOptions<ProjectionMode.Orthographic>).top;
    }
    return undefined;
  }

  set top(value: number) {
    if (this._options.mode === ProjectionMode.Orthographic) {
      (this._options as ProjectionMatrixOptions<ProjectionMode.Orthographic>).top = value;
      this.update();
    }
  }

  /**
   * Update the projection matrix with new options.
   */
  update(options?: Partial<ProjectionMatrixOptions<T>>): void {
    // Merge new options if provided
    if (options) {
      this._options = {
        ...this._options,
        ...options,
      } as unknown as ProjectionMatrixOptions<T>;
    }

    // Rebuild matrix based on current mode
    if (this._options.mode === ProjectionMode.Perspective) {
      this.updatePerspective(this._options as ProjectionMatrixOptions<ProjectionMode.Perspective>);
    } else {
      this.updateOrthographic(this._options as ProjectionMatrixOptions<ProjectionMode.Orthographic>);
    }
  }

  private updatePerspective(options: ProjectionMatrixOptions<ProjectionMode.Perspective>): void {
    const { fovY, aspect, near, far } = options;

    const factor = 1.0 / Math.tan(fovY / 2);
    this._data[0] = factor / aspect;
    this._data[1] = 0;
    this._data[2] = 0;
    this._data[3] = 0;
    this._data[4] = 0;
    this._data[5] = factor;
    this._data[6] = 0;
    this._data[7] = 0;
    this._data[8] = 0;
    this._data[9] = 0;
    this._data[10] = 0;
    this._data[11] = -1;
    this._data[12] = 0;
    this._data[13] = 0;
    this._data[14] = 0;
    this._data[15] = 0;

    if (far !== undefined && far !== null && far !== Infinity) {
      const nf = 1 / (near - far);
      this._data[10] = (far + near) * nf;
      this._data[14] = 2 * far * near * nf;
    } else {
      this._data[10] = -1;
      this._data[14] = -2 * near;
    }
  }

  private updateOrthographic(options: ProjectionMatrixOptions<ProjectionMode.Orthographic>): void {
    const { left, right, bottom, top, near, far } = options;

    const lr = 1 / (left - right);
    const bt = 1 / (bottom - top);
    const nf = 1 / (near - far);

    this._data[0] = -2 * lr;
    this._data[1] = 0;
    this._data[2] = 0;
    this._data[3] = 0;
    this._data[4] = 0;
    this._data[5] = -2 * bt;
    this._data[6] = 0;
    this._data[7] = 0;
    this._data[8] = 0;
    this._data[9] = 0;
    this._data[10] = 2 * nf;
    this._data[11] = 0;
    this._data[12] = (left + right) * lr;
    this._data[13] = (top + bottom) * bt;
    this._data[14] = (far + near) * nf;
    this._data[15] = 1;
  }
}
