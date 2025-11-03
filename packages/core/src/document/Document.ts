import { GroupLayer, type BaseLayer } from "./Layer";

/**
 *
 */
export interface DocumentOptions {
  width: number;
  height: number;
  colorProfile?: string;
}

/**
 *
 */
export class DocumentModel {
  readonly id = crypto.randomUUID();
  readonly width: number;
  readonly height: number;
  readonly colorProfile?: string;
  readonly root: GroupLayer;

  // Simple dirty flag for MVP; future: dirty rects
  private _dirty = true;

  constructor(opts: DocumentOptions) {
    this.width = opts.width;
    this.height = opts.height;
    this.colorProfile = opts.colorProfile;
    this.root = new GroupLayer();
  }

  addLayer(layer: BaseLayer): void {
    this.root.add(layer);
    this._dirty = true;
  }

  markDirty(): void {
    this._dirty = true;
  }

  clearDirty(): void {
    this._dirty = false;
  }

  isDirty(): boolean {
    return this._dirty;
  }
}
