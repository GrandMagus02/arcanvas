import { BlendMode } from "./BlendMode";

/** A simple 2D transform for layers. */
export interface Transform2D {
  tx: number;
  ty: number;
  sx: number;
  sy: number;
  rotation: number; // radians
}

/** Base class for all document layers. */
export abstract class BaseLayer {
  id: string = crypto.randomUUID();
  name = "Layer";
  parent: GroupLayer | null = null;
  visible = true;
  locked = false;
  opacity = 1;
  blendMode: BlendMode = BlendMode.Normal;
  transform: Transform2D = { tx: 0, ty: 0, sx: 1, sy: 1, rotation: 0 };

  private _dirty = true;
  private _dirtyRect: DOMRect | null = null;

  /** Returns true if this layer has changes pending re-render. */
  isDirty(): boolean {
    return this._dirty;
  }

  /** Marks this layer dirty. Optionally merges the provided rect into the dirty area. */
  markDirty(rect?: DOMRectReadOnly): void {
    this._dirty = true;
    if (rect) {
      if (!this._dirtyRect) {
        this._dirtyRect = new DOMRect(rect.x, rect.y, rect.width, rect.height);
      } else {
        const a = this._dirtyRect;
        const minX = Math.min(a.x, rect.x);
        const minY = Math.min(a.y, rect.y);
        const maxX = Math.max(a.x + a.width, rect.x + rect.width);
        const maxY = Math.max(a.y + a.height, rect.y + rect.height);
        this._dirtyRect = new DOMRect(minX, minY, maxX - minX, maxY - minY);
      }
    }
  }

  /** Clears the dirty state and accumulated dirty rectangle. */
  clearDirty(): void {
    this._dirty = false;
    this._dirtyRect = null;
  }

  abstract kind(): string;

  /** Returns a copy of the accumulated dirty rectangle, if any. */
  getDirtyRect(): DOMRect | null {
    return this._dirtyRect ? new DOMRect(this._dirtyRect.x, this._dirtyRect.y, this._dirtyRect.width, this._dirtyRect.height) : null;
  }
}

/** A layer that groups other layers. */
export class GroupLayer extends BaseLayer {
  override name = "Group";
  children: BaseLayer[] = [];

  override kind(): string {
    return "group";
  }

  add(child: BaseLayer): void {
    child.parent = this;
    this.children.push(child);
    this.markDirty();
  }

  remove(child: BaseLayer): void {
    const i = this.children.indexOf(child);
    if (i >= 0) this.children.splice(i, 1);
    child.parent = null;
    this.markDirty();
  }
}

/** A pixel-based layer backed by an OffscreenCanvas (MVP). */
export class RasterLayer extends BaseLayer {
  override name = "Raster";
  width = 0;
  height = 0;
  // Backing canvas for MVP
  private surface: OffscreenCanvas | null = null;

  constructor(width: number, height: number) {
    super();
    this.width = width;
    this.height = height;
    if (typeof OffscreenCanvas !== "undefined") {
      this.surface = new OffscreenCanvas(width, height);
    }
  }

  getSurface(): OffscreenCanvas | null {
    return this.surface;
  }

  override kind(): string {
    return "raster";
  }
}

/** A non-destructive adjustment layer (filters applied later phases). */
export class AdjustmentLayer extends BaseLayer {
  override name = "Adjustment";
  override kind(): string {
    return "adjustment";
  }
}
