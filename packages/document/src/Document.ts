import { BlendMode } from "./BlendMode";
import { GroupLayer, type BaseLayer, type Transform2D } from "./Layer";

// Simple event map type
type EventMap = Record<string, unknown[]>;

// Simple event bus implementation (to avoid dependency on core)
/**
 *
 */
class EventBus<T extends EventMap = Record<string, unknown[]>> {
  private map = new Map<keyof T & string, Set<(...args: unknown[]) => void>>();

  on<K extends keyof T>(event: K, fn: (...args: T[K]) => void): () => void {
    const eventKey = event as keyof T & string;
    if (!this.map.has(eventKey)) this.map.set(eventKey, new Set());
    this.map.get(eventKey)!.add(fn as (...args: unknown[]) => void);
    return () => this.off(event, fn);
  }

  off<K extends keyof T>(event: K, fn: (...args: T[K]) => void): void {
    this.map.get(event as keyof T & string)?.delete(fn as (...args: unknown[]) => void);
  }

  emit<K extends keyof T>(event: K, ...args: T[K]): void {
    this.map.get(event as keyof T & string)?.forEach((fn) => fn(...args));
  }
}

/**
 * Document event map.
 */
export interface DocumentEvents extends EventMap {
  layerChanged: [layerId: string];
  structureChanged: [];
  documentMetadataChanged: [];
}

/**
 * Document options.
 */
export interface DocumentOptions {
  width: number;
  height: number;
  colorProfile?: string;
}

/**
 * Document model representing a layered composition.
 * Renamed from DocumentModel to Document for clarity.
 */
export class Document {
  readonly id = crypto.randomUUID();
  readonly width: number;
  readonly height: number;
  readonly colorProfile?: string;
  readonly root: GroupLayer;
  private readonly events = new EventBus<DocumentEvents>();

  // Simple dirty flag for MVP; future: dirty rects
  private _dirty = true;

  constructor(opts: DocumentOptions) {
    this.width = opts.width;
    this.height = opts.height;
    this.colorProfile = opts.colorProfile;
    this.root = new GroupLayer();
  }

  /**
   * Event bus for document events.
   */
  get on(): EventBus<DocumentEvents>["on"] {
    return this.events.on.bind(this.events);
  }

  /**
   * Emit document events.
   */
  private emit<K extends keyof DocumentEvents>(event: K, ...args: DocumentEvents[K]): void {
    this.events.emit(event, ...args);
  }

  /**
   * Add a layer to the document root.
   */
  addLayer(layer: BaseLayer): void {
    this.root.add(layer);
    this._dirty = true;
    this.emit("structureChanged");
  }

  /**
   * Remove a layer by ID.
   */
  removeLayer(layerId: string): boolean {
    const layer = this.getLayerById(layerId);
    if (!layer) return false;

    if (layer.parent) {
      layer.parent.remove(layer);
      this._dirty = true;
      this.emit("structureChanged");
      return true;
    }
    return false;
  }

  /**
   * Reorder a layer to a new index within its parent.
   */
  reorderLayer(layerId: string, newIndex: number): boolean {
    const layer = this.getLayerById(layerId);
    if (!layer || !layer.parent) return false;

    const parent = layer.parent;
    const currentIndex = parent.children.indexOf(layer);
    if (currentIndex === -1) return false;

    parent.children.splice(currentIndex, 1);
    parent.children.splice(Math.max(0, Math.min(newIndex, parent.children.length)), 0, layer);
    this._dirty = true;
    this.emit("structureChanged");
    return true;
  }

  /**
   * Set layer opacity.
   */
  setLayerOpacity(layerId: string, opacity: number): boolean {
    const layer = this.getLayerById(layerId);
    if (!layer) return false;
    layer.opacity = Math.max(0, Math.min(1, opacity));
    layer.markDirty();
    this._dirty = true;
    this.emit("layerChanged", layerId);
    return true;
  }

  /**
   * Set layer blend mode.
   */
  setLayerBlendMode(layerId: string, blendMode: BlendMode): boolean {
    const layer = this.getLayerById(layerId);
    if (!layer) return false;
    layer.blendMode = blendMode;
    layer.markDirty();
    this._dirty = true;
    this.emit("layerChanged", layerId);
    return true;
  }

  /**
   * Set layer transform.
   */
  setLayerTransform(layerId: string, transform: Transform2D): boolean {
    const layer = this.getLayerById(layerId);
    if (!layer) return false;
    layer.transform = transform;
    layer.markDirty();
    this._dirty = true;
    this.emit("layerChanged", layerId);
    return true;
  }

  /**
   * Set layer visibility.
   */
  setLayerVisible(layerId: string, visible: boolean): boolean {
    const layer = this.getLayerById(layerId);
    if (!layer) return false;
    layer.visible = visible;
    layer.markDirty();
    this._dirty = true;
    this.emit("layerChanged", layerId);
    return true;
  }

  /**
   * Get layer by ID (searches recursively).
   */
  getLayerById(layerId: string): BaseLayer | null {
    return this.findLayer((layer) => layer.id === layerId);
  }

  /**
   * Find layer by predicate (searches recursively).
   */
  findLayer(predicate: (layer: BaseLayer) => boolean): BaseLayer | null {
    const search = (layer: BaseLayer): BaseLayer | null => {
      if (predicate(layer)) return layer;
      if (layer instanceof GroupLayer) {
        for (const child of layer.children) {
          const found = search(child);
          if (found) return found;
        }
      }
      return null;
    };

    return search(this.root);
  }

  /**
   * Mark document as dirty.
   */
  markDirty(): void {
    this._dirty = true;
  }

  /**
   * Clear dirty flag.
   */
  clearDirty(): void {
    this._dirty = false;
  }

  /**
   * Check if document is dirty.
   */
  isDirty(): boolean {
    return this._dirty;
  }
}

/**
 * Backward compatibility: export DocumentModel as alias for Document.
 */
export const DocumentModel = Document;
