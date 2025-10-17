Below is an extensible architecture for a web-first, TypeScript-based canvas engine designed for scale, low-level control, and future plugin/tooling. It’s organized with SOLID in mind and keeps the MVP focused on raster (Photoshop-like), while explicitly leaving seams to add vector and 3D later.

High-level overview (modules and relationships)
- Core
  - Engine: lifecycle, dependency injection, service registry, startup/shutdown.
  - EventBus: decoupled pub/sub for domain events.
  - CommandBus + History: undoable commands, transactions, snapshots.
  - Scheduler: main loop coordination, throttling, background tasks.
  - WorkerPool: run CPU-heavy tasks off-main-thread, OffscreenCanvas support.
  - Settings/Prefs: persistent configuration.
- Document Model
  - Document: root of state; pages/artboards/canvases, color profile.
  - Node graph: Layer (abstract), GroupLayer, RasterLayer, Mask, AdjustmentLayer.
  - Attributes: Transform, BlendMode, Opacity, Visibility, Locking.
  - Channels: RGBA, extra channels for selection, alpha, quick mask.
- Rendering
  - Renderer: retained-mode rendering with invalidation and tiling.
  - RenderBackend: Canvas2DBackend (MVP), WebGL2Backend, WebGPUBackend.
  - Compositor: blend modes, filters, masks; CPU and GPU paths.
  - TileCache: tiled rendering, MIP levels, dirty-rect invalidation.
  - ShaderModule/Material: future slot for vector/3D and GPU effects.
- Tools
  - Tool interface + ToolController: input routing, mode switching.
  - BrushTool, EraserTool, MoveTool, SelectionTools (marquee/lasso/magic-wand).
  - BrushEngine: stamp-based brush, spacing, opacity/flow, dynamics.
- Selection and Masking
  - Selection: raster mask, geometric ops (union/intersection/subtract).
  - MarchingAntsOverlay: visual feedback layer.
  - MagicWand/FloodFill: color/tolerance-based selection.
- Assets and IO
  - AssetManager: images, fonts, patterns, gradients, brushes, swatches.
  - Importers/Exporters: PNG, JPEG, ag-psd for PSD, JSON project format.
  - Clipboard and DragDrop services.
- Color Management
  - ColorSpace, ColorProfileManager (ICC), conversions, gamut mapping.
- Plugin System
  - PluginManager: load, activate, deactivate.
  - PluginContext: capabilities, service access (safe), event hooks.
  - Sandboxed execution via Workers; message bridge.
- Future: Vector and 3D
  - Vector: VectorLayer, Path, Shape, Stroke/Fill, BooleanOps, TextLayer.
  - 3D: Scene, Entity, Component (ECS or scene graph), Camera, Light, Mesh,
    Material, ShaderGraph, Geometry, Texture, Framebuffer.

Core TypeScript interfaces and classes (skeletons)
Note: Names use interfaces for behavior and classes for concrete types to enable OCP and DIP. Lines wrapped for 80-char width.

```ts
// core/AppContext.ts
export interface Service {
  readonly id: string;
}

export interface ServiceLocator {
  get<T extends Service>(id: string): T;
  register(service: Service): void;
}

export class DefaultServiceLocator implements ServiceLocator {
  private services = new Map<string, Service>();

  get<T extends Service>(id: string): T {
    const svc = this.services.get(id);
    if (!svc) throw new Error(`Service not found: ${id}`);
    return svc as T;
  }

  register(service: Service): void {
    if (this.services.has(service.id)) {
      throw new Error(`Service already registered: ${service.id}`);
    }
    this.services.set(service.id, service);
  }
}

// core/EventBus.ts
export type EventPayload = Record<string, unknown>;

export interface Event<T extends EventPayload = EventPayload> {
  type: string;
  payload: T;
}

export type EventHandler<T extends EventPayload> = (e: Event<T>) => void;

export interface EventBus extends Service {
  on<T extends EventPayload>(type: string, handler: EventHandler<T>): void;
  off<T extends EventPayload>(type: string, handler: EventHandler<T>): void;
  emit<T extends EventPayload>(event: Event<T>): void;
}

export class SimpleEventBus implements EventBus {
  readonly id = "EventBus";
  private handlers = new Map<string, Set<EventHandler<any>>>();

  on<T extends EventPayload>(type: string, handler: EventHandler<T>): void {
    if (!this.handlers.has(type)) this.handlers.set(type, new Set());
    this.handlers.get(type)!.add(handler as any);
  }

  off<T extends EventPayload>(type: string, handler: EventHandler<T>): void {
    this.handlers.get(type)?.delete(handler as any);
  }

  emit<T extends EventPayload>(event: Event<T>): void {
    this.handlers.get(event.type)?.forEach((h) => h(event));
  }
}

// core/Command.ts
export interface Command extends Service {
  do(): Promise<void> | void;
  undo(): Promise<void> | void;
  describe(): string;
}

export interface History extends Service {
  execute(cmd: Command, mergeKey?: string): Promise<void>;
  undo(): Promise<void>;
  redo(): Promise<void>;
  beginTransaction(label: string): void;
  endTransaction(): void;
}

export class HistoryManager implements History {
  readonly id = "History";
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];
  private inTxn: Command[] | null = null;

  async execute(cmd: Command, mergeKey?: string): Promise<void> {
    await cmd.do();
    if (this.inTxn) {
      this.inTxn.push(cmd);
    } else {
      this.undoStack.push(cmd);
      this.redoStack = [];
    }
  }

  beginTransaction(): void {
    if (this.inTxn) throw new Error("Nested transactions unsupported");
    this.inTxn = [];
  }

  endTransaction(): void {
    if (!this.inTxn) return;
    // Optionally wrap txn into a composite command
    this.undoStack.push(...this.inTxn);
    this.inTxn = null;
    this.redoStack = [];
  }

  async undo(): Promise<void> {
    const cmd = this.undoStack.pop();
    if (!cmd) return;
    await cmd.undo();
    this.redoStack.push(cmd);
  }

  async redo(): Promise<void> {
    const cmd = this.redoStack.pop();
    if (!cmd) return;
    await cmd.do();
    this.undoStack.push(cmd);
  }
}

// core/Scheduler.ts
export interface Scheduler extends Service {
  requestFrame(cb: (dtMs: number) => void): void;
  scheduleIdle(cb: () => void): void;
}

export class RAFScheduler implements Scheduler {
  readonly id = "Scheduler";
  private last = performance.now();

  requestFrame(cb: (dtMs: number) => void): void {
    requestAnimationFrame((t) => {
      const dt = t - this.last;
      this.last = t;
      cb(dt);
    });
  }

  scheduleIdle(cb: () => void): void {
    (self as any).requestIdleCallback?.(cb, { timeout: 50 }) ?? setTimeout(cb);
  }
}
```

Document model and layer tree
- Single responsibility: Layer only stores state; rendering is handled by Renderer/Compositor. Editing operations are Commands. Decoding/IO belongs to AssetManager.
- Open-closed: New layer types implement ILayer.
- Liskov: Any Layer can be handled by generic traversal/compose logic.
- Interface segregation: Separate IRenderable from ISerializable, etc.
- Dependency inversion: Rendering depends on IRenderBackend, not concrete Canvas2D/WebGL.

```ts
// document/Types.ts
export type UUID = string;

export interface Size {
  width: number;
  height: number;
}

export interface Transform2D {
  tx: number;
  ty: number;
  sx: number;
  sy: number;
  rotation: number; // radians
}

export enum BlendMode {
  Normal = "normal",
  Multiply = "multiply",
  Screen = "screen",
  Overlay = "overlay",
  // ... add more as needed
}

// document/Layer.ts
export interface ILayer {
  readonly id: UUID;
  readonly name: string;
  parent: IGroupLayer | null;
  visible: boolean;
  locked: boolean;
  opacity: number; // 0..1
  blendMode: BlendMode;
  transform: Transform2D;

  getBounds(): DOMRectReadOnly;
  isDirty(): boolean;
  markDirty(rect?: DOMRectReadOnly): void;

  // No render here; keep SRP, renderer pulls pixels via LayerSurface
}

export interface IGroupLayer extends ILayer {
  children: ILayer[];
  add(child: ILayer, index?: number): void;
  remove(child: ILayer): void;
}

export interface IRasterLayer extends ILayer {
  // Surface abstraction for CPU/GPU
  getSurface(): LayerSurface;
  setPixelData(
    x: number,
    y: number,
    w: number,
    h: number,
    data: Uint8ClampedArray
  ): void;
}

export interface IMaskLayer extends ILayer {
  getMaskSurface(): LayerSurface;
  invert: boolean;
}

export interface LayerSurface {
  size: Size;
  // CPU bitmap access (MVP)
  readPixels(): ImageData;
  writePixels(img: ImageData): void;

  // Extensible handles for WebGL/WebGPU in the future
  getHandle(): unknown;
}

// document/Document.ts
export interface DocumentOptions {
  size: Size;
  colorProfile?: string; // ICC profile ref
  background?: "transparent" | { color: string };
}

export interface IDocument {
  readonly id: UUID;
  readonly size: Size;
  readonly root: IGroupLayer;
  readonly colorProfile?: string;

  findLayerById(id: UUID): ILayer | null;
  markDirty(rect?: DOMRectReadOnly): void;
}

export class Document implements IDocument {
  readonly id: UUID;
  readonly size: Size;
  readonly root: IGroupLayer;
  readonly colorProfile?: string;
  private dirtyRegion: DOMRectReadOnly | null = null;

  constructor(opts: DocumentOptions, rootFactory: () => IGroupLayer) {
    this.id = crypto.randomUUID();
    this.size = opts.size;
    this.colorProfile = opts.colorProfile;
    this.root = rootFactory();
  }

  findLayerById(id: UUID): ILayer | null {
    const stack: ILayer[] = [this.root];
    while (stack.length) {
      const n = stack.pop()!;
      if (n.id === id) return n;
      if ("children" in n) stack.push(...(n as IGroupLayer).children);
    }
    return null;
  }

  markDirty(rect?: DOMRectReadOnly): void {
    // Merge dirty rects. MVP: mark whole doc if undefined.
    this.dirtyRegion = rect ?? new DOMRect(0, 0, this.size.width, this.size.height);
  }
}
```

Rendering pipeline
- Renderer is decoupled from document; it watches dirty regions and re-renders tiles. The Renderer depends on an IRenderBackend that provides drawing primitives; choose Canvas2D for MVP, and later swap to WebGL/WebGPU.
- Compositor handles blend modes and masks. For MVP, use CPU compositing with putImageData/drawImage; later, GPU fragment shaders.

```ts
// render/RenderBackend.ts
export interface IRenderTarget {
  size: Size;
  getCanvas(): HTMLCanvasElement | OffscreenCanvas;
  // For GPU backends, return framebuffer or texture handle
  getHandle(): unknown;
}

export interface IRenderBackend extends Service {
  createRenderTarget(size: Size): IRenderTarget;
  begin(rt: IRenderTarget): void;
  end(rt: IRenderTarget): void;

  // 2D ops (MVP scope)
  clear(r: number, g: number, b: number, a: number): void;
  drawImage(
    src: CanvasImageSource,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    dx: number,
    dy: number,
    dw: number,
    dh: number,
    globalAlpha: number,
    blend: BlendMode,
    transform?: DOMMatrix
  ): void;

  applyMask(
    mask: CanvasImageSource,
    invert: boolean,
    transform?: DOMMatrix
  ): void;
}

export class Canvas2DBackend implements IRenderBackend {
  readonly id = "RenderBackend.Canvas2D";
  createRenderTarget(size: Size): IRenderTarget {
    const canvas = new OffscreenCanvas(size.width, size.height);
    return {
      size,
      getCanvas: () => canvas,
      getHandle: () => canvas,
    };
  }

  private ctx: OffscreenCanvasRenderingContext2D | null = null;

  begin(rt: IRenderTarget): void {
    this.ctx = (rt.getCanvas() as OffscreenCanvas).getContext("2d", {
      willReadFrequently: false,
      alpha: true,
      desynchronized: true,
    })!;
  }

  end(): void {
    this.ctx = null;
  }

  clear(r: number, g: number, b: number, a: number): void {
    if (!this.ctx) return;
    const { width, height } = this.ctx.canvas;
    this.ctx.save();
    this.ctx.globalCompositeOperation = "source-over";
    this.ctx.globalAlpha = 1;
    this.ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
    this.ctx.fillRect(0, 0, width, height);
    this.ctx.restore();
  }

  drawImage(
    src: CanvasImageSource,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    dx: number,
    dy: number,
    dw: number,
    dh: number,
    globalAlpha: number,
    blend: BlendMode,
    transform?: DOMMatrix
  ): void {
    if (!this.ctx) return;
    this.ctx.save();
    if (transform) this.ctx.setTransform(transform);
    this.ctx.globalAlpha = globalAlpha;
    this.ctx.globalCompositeOperation = this.mapBlend(blend);
    this.ctx.drawImage(src, sx, sy, sw, sh, dx, dy, dw, dh);
    this.ctx.restore();
  }

  applyMask(): void {
    // MVP: handled via compositing-to-temp-canvas
  }

  private mapBlend(b: BlendMode): GlobalCompositeOperation {
    switch (b) {
      case BlendMode.Multiply:
        return "multiply";
      case BlendMode.Screen:
        return "screen";
      case BlendMode.Overlay:
        return "overlay";
      default:
        return "source-over";
    }
  }
}

// render/Renderer.ts
export interface Renderer extends Service {
  attachTo(element: HTMLCanvasElement): void;
  setDocument(doc: IDocument | null): void;
  render(): void; // manual render
}

export class TiledRenderer implements Renderer {
  readonly id = "Renderer";
  private doc: IDocument | null = null;
  private viewCanvas: HTMLCanvasElement | null = null;
  private rt: IRenderTarget | null = null;

  constructor(private backend: IRenderBackend) {}

  attachTo(element: HTMLCanvasElement): void {
    this.viewCanvas = element;
  }

  setDocument(doc: IDocument | null): void {
    this.doc = doc;
    if (!doc || !this.viewCanvas) return;
    this.rt = this.backend.createRenderTarget(doc.size);
  }

  render(): void {
    if (!this.doc || !this.rt) return;
    // MVP: naive full redraw; later: dirty tiles only
    this.backend.begin(this.rt);
    this.backend.clear(0, 0, 0, 0);
    this.renderLayerTree(this.doc.root, new DOMMatrix());
    this.backend.end(this.rt);

    // Blit to view canvas
    const vctx = this.viewCanvas!.getContext("2d")!;
    vctx.clearRect(0, 0, this.viewCanvas!.width, this.viewCanvas!.height);
    vctx.drawImage(this.rt.getCanvas() as HTMLCanvasElement, 0, 0);
  }

  private renderLayerTree(layer: ILayer, parentTx: DOMMatrix): void {
    if (!layer.visible) return;
    const tx = this.composeTransform(parentTx, layer.transform);
    if ("children" in layer) {
      for (const child of (layer as IGroupLayer).children) {
        this.renderLayerTree(child, tx);
      }
      return;
    }
    if ("getSurface" in layer) {
      const rl = layer as IRasterLayer;
      const surf = rl.getSurface();
      this.backend.drawImage(
        surf.getHandle() as CanvasImageSource,
        0,
        0,
        surf.size.width,
        surf.size.height,
        0,
        0,
        surf.size.width,
        surf.size.height,
        rl.opacity,
        rl.blendMode,
        tx
      );
    }
  }

  private composeTransform(m: DOMMatrix, t: Transform2D): DOMMatrix {
    return m
      .translate(t.tx, t.ty)
      .rotate((t.rotation * 180) / Math.PI)
      .scale(t.sx, t.sy);
  }
}
```

Raster MVP: surfaces, brush engine, and tools
- The BrushEngine stamps a precomputed brush tip into a tileable surface with flow/opacity/hardness. The Tool uses Command to make actions undoable.
- IRasterSurface is agnostic to CPU/GPU; MVP uses OffscreenCanvas and ImageData.

```ts
// raster/RasterSurface.ts
export class CanvasSurface implements LayerSurface {
  size: Size;
  private canvas: OffscreenCanvas;

  constructor(size: Size) {
    this.size = size;
    this.canvas = new OffscreenCanvas(size.width, size.height);
  }

  readPixels(): ImageData {
    const ctx = this.canvas.getContext("2d")!;
    return ctx.getImageData(0, 0, this.size.width, this.size.height);
  }

  writePixels(img: ImageData): void {
    const ctx = this.canvas.getContext("2d")!;
    ctx.putImageData(img, 0, 0);
  }

  getHandle(): OffscreenCanvas {
    return this.canvas;
  }

  drawStamp(
    img: CanvasImageSource,
    x: number,
    y: number,
    alpha: number,
    blend: BlendMode
  ): void {
    const ctx = this.canvas.getContext("2d")!;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.globalCompositeOperation =
      blend === BlendMode.Normal ? "source-over" : "source-over";
    const r = img as CanvasImageSource;
    const w = (r as any).width ?? 1;
    const h = (r as any).height ?? 1;
    ctx.drawImage(r, x - w / 2, y - h / 2);
    ctx.restore();
  }
}

// raster/RasterLayer.ts
export class RasterLayer implements IRasterLayer {
  readonly id: UUID = crypto.randomUUID();
  name = "Raster Layer";
  parent: IGroupLayer | null = null;
  visible = true;
  locked = false;
  opacity = 1;
  blendMode = BlendMode.Normal;
  transform: Transform2D = { tx: 0, ty: 0, sx: 1, sy: 1, rotation: 0 };

  private surface: CanvasSurface;
  private dirty = true;

  constructor(size: Size) {
    this.surface = new CanvasSurface(size);
  }

  getSurface(): LayerSurface {
    return this.surface;
  }

  setPixelData(
    x: number,
    y: number,
    w: number,
    h: number,
    data: Uint8ClampedArray
  ): void {
    const img = new ImageData(data, w, h);
    const ctx = (this.surface.getHandle() as OffscreenCanvas).getContext("2d")!;
    ctx.putImageData(img, x, y);
    this.markDirty(new DOMRect(x, y, w, h));
  }

  getBounds(): DOMRectReadOnly {
    return new DOMRect(0, 0, this.surface.size.width, this.surface.size.height);
  }

  isDirty(): boolean {
    return this.dirty;
  }

  markDirty(): void {
    this.dirty = true;
  }
}

// tools/Tooling.ts
export interface PointerEventLike {
  x: number;
  y: number;
  pressure: number;
  altKey: boolean;
  shiftKey: boolean;
  ctrlKey: boolean;
}

export interface Tool {
  readonly id: string;
  onPointerDown(evt: PointerEventLike, ctx: ToolContext): void;
  onPointerMove(evt: PointerEventLike, ctx: ToolContext): void;
  onPointerUp(evt: PointerEventLike, ctx: ToolContext): void;
  cancel(ctx: ToolContext): void;
}

export interface ToolContext {
  doc: IDocument;
  history: History;
  eventBus: EventBus;
  services: ServiceLocator;
}

export class ToolController implements Service {
  readonly id = "ToolController";
  private active: Tool | null = null;
  setActive(tool: Tool): void {
    this.active = tool;
  }
  // Wire DOM events → PointerEventLike → active tool
}
```

Brush engine and command example
```ts
// brush/BrushEngine.ts
export interface BrushTip {
  // OffscreenCanvas for the tip; supports soft edges
  image: OffscreenCanvas;
  spacing: number; // px between stamps
  flow: number; // 0..1
  opacity: number; // 0..1
  size: number; // px
  hardness: number; // 0..1
}

export class BrushEngine {
  stampAlongPath(
    layer: RasterLayer,
    tip: BrushTip,
    points: Array<{ x: number; y: number; p: number }>
  ): void {
    let last: { x: number; y: number } | null = null;
    const surf = layer.getSurface() as CanvasSurface;

    for (const pt of points) {
      if (!last) {
        surf.drawStamp(tip.image, pt.x, pt.y, tip.opacity * pt.p, BlendMode.Normal);
        last = pt;
        continue;
      }
      const dx = pt.x - last.x;
      const dy = pt.y - last.y;
      const dist = Math.hypot(dx, dy);
      const step = tip.spacing;
      for (let s = step; s <= dist; s += step) {
        const t = s / dist;
        const x = last.x + dx * t;
        const y = last.y + dy * t;
        surf.drawStamp(tip.image, x, y, tip.opacity * pt.p, BlendMode.Normal);
      }
      last = pt;
    }
    layer.markDirty();
  }
}

// brush/commands/PaintStrokeCommand.ts
export class PaintStrokeCommand implements Command {
  readonly id = "cmd.paintStroke";
  private before?: ImageData;
  private after?: ImageData;

  constructor(
    private layer: RasterLayer,
    private engine: BrushEngine,
    private tip: BrushTip,
    private path: Array<{ x: number; y: number; p: number }>
  ) {}

  describe(): string {
    return "Paint Stroke";
  }

  do(): void {
    const surf = this.layer.getSurface() as CanvasSurface;
    this.before = surf.readPixels();
    this.engine.stampAlongPath(this.layer, this.tip, this.path);
    this.after = surf.readPixels();
  }

  undo(): void {
    if (!this.before) return;
    const surf = this.layer.getSurface() as CanvasSurface;
    surf.writePixels(this.before);
    this.layer.markDirty();
  }
}
```

Selection and masking (raster MVP)
```ts
// selection/Selection.ts
export interface Selection {
  getMask(): OffscreenCanvas;
  setMask(canvas: OffscreenCanvas): void;
  clear(): void;
  invert(): void;
  addRegion(rect: DOMRectReadOnly): void;
  subtractRegion(rect: DOMRectReadOnly): void;
  // Future: path-based, feather, expand/contract
}

export class RasterSelection implements Selection {
  private mask: OffscreenCanvas;

  constructor(private size: Size) {
    this.mask = new OffscreenCanvas(size.width, size.height);
  }

  getMask(): OffscreenCanvas {
    return this.mask;
  }

  setMask(canvas: OffscreenCanvas): void {
    this.mask = canvas;
  }

  clear(): void {
    const ctx = this.mask.getContext("2d")!;
    ctx.clearRect(0, 0, this.mask.width, this.mask.height);
  }

  invert(): void {
    const ctx = this.mask.getContext("2d")!;
    const img = ctx.getImageData(0, 0, this.mask.width, this.mask.height);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      d[i + 3] = 255 - d[i + 3];
    }
    ctx.putImageData(img, 0, 0);
  }

  addRegion(rect: DOMRectReadOnly): void {
    const ctx = this.mask.getContext("2d")!;
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(0,0,0,1)";
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    ctx.restore();
  }

  subtractRegion(rect: DOMRectReadOnly): void {
    const ctx = this.mask.getContext("2d")!;
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0,0,0,1)";
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    ctx.restore();
  }
}
```

Plugin system (low-level, future-safe)
- Plugins should not directly mutate core classes; they use APIs exposed via PluginContext.
- Keep host-guest isolation using Workers, structured clone, and message channels.

```ts
// plugin/Plugin.ts
export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  permissions?: string[];
}

export interface PluginContext {
  events: EventBus;
  commands: {
    register(id: string, factory: () => Command): void;
  };
  tools: {
    register(tool: Tool): void;
  };
  services: ServiceLocator;
  doc: () => IDocument | null;
  render: () => void;
}

export interface Plugin {
  manifest: PluginManifest;
  activate(ctx: PluginContext): Promise<void> | void;
  deactivate(): Promise<void> | void;
}

export interface PluginManager extends Service {
  load(manifestUrl: string): Promise<void>;
  activate(id: string): Promise<void>;
  deactivate(id: string): Promise<void>;
}

export class SimplePluginManager implements PluginManager {
  readonly id = "PluginManager";
  private plugins = new Map<string, Plugin>();

  async load(manifestUrl: string): Promise<void> {
    // MVP: import module, instantiate plugin
  }

  async activate(id: string): Promise<void> {
    const p = this.plugins.get(id);
    if (!p) throw new Error("Plugin not loaded");
    // call p.activate with limited context
  }

  async deactivate(id: string): Promise<void> {
    const p = this.plugins.get(id);
    if (!p) return;
    await p.deactivate();
  }
}
```

App/Engine wiring
```ts
// app/Engine.ts
export class Engine {
  private services: DefaultServiceLocator;
  private renderer: Renderer | null = null;
  private doc: IDocument | null = null;

  constructor() {
    this.services = new DefaultServiceLocator();
    // Register core services
    this.services.register(new SimpleEventBus());
    this.services.register(new HistoryManager());
    this.services.register(new RAFScheduler());
    const backend = new Canvas2DBackend();
    this.services.register(backend);
    const renderer = new TiledRenderer(backend);
    this.renderer = renderer;
    this.services.register(renderer);
    this.services.register(new ToolController());
    this.services.register(new SimplePluginManager());
  }

  createDocument(size: Size): IDocument {
    const root: IGroupLayer = {
      id: crypto.randomUUID(),
      name: "Root",
      parent: null,
      visible: true,
      locked: false,
      opacity: 1,
      blendMode: BlendMode.Normal,
      transform: { tx: 0, ty: 0, sx: 1, sy: 1, rotation: 0 },
      children: [],
      add(child: ILayer) {
        child.parent = this;
        this.children.push(child);
      },
      remove(child: ILayer) {
        const i = this.children.indexOf(child);
        if (i >= 0) this.children.splice(i, 1);
      },
      getBounds() {
        return new DOMRect(0, 0, size.width, size.height);
      },
      isDirty() {
        return true;
      },
      markDirty() {},
      name: "Root",
    } as unknown as IGroupLayer;

    const doc = new Document({ size }, () => root);
    this.doc = doc;
    this.renderer?.setDocument(doc);
    return doc;
  }

  attachTo(canvas: HTMLCanvasElement): void {
    this.renderer?.attachTo(canvas);
  }

  render(): void {
    this.renderer?.render();
  }

  getServices(): ServiceLocator {
    return this.services;
  }
}
```

Future-proofing seams for vector and 3D
- Vector
  - Add VectorLayer implementing ILayer; it owns a retained scene of Paths/Shapes.
  - Introduce IVectorRenderer with GPU tessellation path when WebGPU is present.
  - Boolean ops via a dedicated geometry module; can run in Workers.
  - TextLayer separately with font shaping in WASM (e.g., HarfBuzz WASM).
- 3D
  - Parallel render backend interface with WebGPU/WebGL2 implementations.
  - Scene graph or ECS: Scene -> Entities -> Components (Transform3D, Mesh,
    Camera, Light).
  - Materials decouple shader code using ShaderModule and parameter blocks.
  - Use a RenderGraph/Pass system (G-buffer, lighting, post) that coexists
    with 2D compositing via a Compositor that merges 3D RT into 2D.

Design notes for SOLID compliance
- SRP: Each class has a clear reason to change (e.g., Renderer only renders).
- OCP: New layer types, tools, commands, backends via interfaces.
- LSP: All ILayer work in the render traversal and history without special-casing.
- ISP: Separate small interfaces (ILayer, IRasterLayer, IGroupLayer, etc.).
- DIP: High-level modules depend on abstractions (IRenderBackend, Tool, Command).

Performance and scalability primitives (MVP now, grow later)
- Dirty regions and tiled rendering: Divide document into 256x256 tiles, render
  only invalid tiles. Keep a TileCache keyed by tile coords and layer revision.
- OffscreenCanvas and Worker painting: For expensive filters or large brushes,
  paint in a Worker using OffscreenCanvas to avoid blocking UI.
- Brush preview/stabilization: Smooth input path via a low-pass filter for
  pointer movement; preview stroke as vector path, commit to pixels in batches.
- Blend modes: Start with Canvas2D’s supported modes; extend via GPU shaders
  later (WebGL/WebGPU) with a mapping to Photoshop modes.
- Color management: Initially assume sRGB; add ICC transform stage when
  ColorProfileManager is available. Provide per-document profile metadata.

Suggested low-level libraries (opt-in, not required)
- Math/linear algebra: gl-matrix or wgpu-matrix (for future 3D and transforms).
- Geometry/paths (future vector): paperjs is higher-level; for operations,
  polygon-clipping, clipper-lib, or pathops via WASM.
- PSD: ag-psd (TypeScript) for read/write interoperability.
- Image codecs: Squoosh codecs (WASM) for WebP/AVIF/JPEG XL when exporting.
- Color: culori or colorjs.io for conversions; okhsv/oklch support.
- Earcut (triangulation) for vector fill tessellation later.
- WGSL/GLSL helpers: shader preprocessors can be simple string modules you own;
  avoid heavy frameworks at first. For WebGL helpers, twgl.js or regl can
  accelerate initial GPU backends if desired.

MVP implementation milestones (raster-focused)
1) Core and boot
- ServiceLocator, EventBus, History, Scheduler.
- Canvas2DBackend, TiledRenderer (initially full redraw).

2) Document and layers
- Document, GroupLayer, RasterLayer, CanvasSurface.

3) Tools and brush
- ToolController, BrushEngine (stamp-based), BrushTool.
- PaintStrokeCommand with undo/redo.

4) Selection basics
- RasterSelection, Rect/Lasso tools (as plugins to ToolController).
- Apply selection as write mask in BrushEngine (skip outside selection).

5) IO
- PNG export/import, simple JSON project format.
- ag-psd import for raster layers (optional).

6) Plugin system seed
- PluginManager with in-process activation and limited context.
- Allow registering a simple FilterCommand plugin.

7) Performance
- Dirty-rect tracking; avoid full redraw when possible.
- OffscreenCanvas usage; begin Worker offloading for filters.

How it all fits together (example flow: painting a stroke)
- DOM pointer events → ToolController → BrushTool accumulates points.
- On pointer up, BrushTool creates PaintStrokeCommand and executes via History.
- Command snapshots layer pixels, calls BrushEngine to stamp along the path.
- RasterLayer marks dirty; Document dirty region is updated.
- Renderer sees dirty region and redraws affected tiles via Canvas2DBackend.
- View canvas blits from render target; EventBus emits “documentRendered”.

This structure gives you a clean, SOLID-aligned foundation for a Photoshop-like MVP while keeping seams open for vector, filters, and 3D/GPU evolution later. If you want, I can turn this into a minimal runnable scaffold with a brush tool and undo/redo wired to a canvas element.


```
arcanvas/
  .editorconfig
  .gitignore
  .prettierrc
  .eslintrc.cjs
  .npmrc
  .nvmrc
  LICENSE
  README.md
  package.json
  pnpm-workspace.yaml
  turbo.json
  tsconfig.base.json
  vitest.workspace.ts
  .changeset/
    config.json
    README.md

  scripts/
    verify-types.mjs
    gen-licenses.mjs

  apps/
    studio/                # Full app (Photoshop-like)
      index.html
      src/
        main.tsx
        App.tsx
        canvas/
          CanvasView.tsx
          Toolbars.tsx
      public/
      package.json
      tsconfig.json
      vite.config.ts
    viewer/                # Lightweight viewer/renderer
      index.html
      src/
        main.ts
      public/
      package.json
      tsconfig.json
      vite.config.ts
    benchmarks/            # Perf micro-benchmarks
      src/
        raster-brush.bench.ts
        compositing.bench.ts
      package.json
      tsconfig.json
      vitest.config.ts

  examples/
    basic-brush/
      index.html
      src/main.ts
      package.json
      tsconfig.json
      vite.config.ts
    plugin-filter/
      src/index.ts
      package.json
      tsconfig.json

  docs/
    site/
      package.json
      docusaurus.config.ts
      docs/
      blog/

  packages/
    types/                 # Shared TS types (no runtime)
      src/index.ts
      package.json
      tsconfig.json

    utils/                 # Small helpers, non-DOM specific
      src/index.ts
      package.json
      tsconfig.json

    core/                  # EventBus, Command/History, DI, Scheduler
      src/
        index.ts
        di/
          Service.ts
          Locator.ts
        events/
          EventBus.ts
        history/
          Command.ts
          History.ts
        sched/
          Scheduler.ts
      package.json
      tsconfig.json

    engine/                # Document graph, layers, transforms
      src/
        index.ts
        document/
          Document.ts
          Layer.ts
          GroupLayer.ts
          RasterLayer.ts
          Selection.ts
        geometry/
          Transform2D.ts
        color/
          BlendMode.ts
      package.json
      tsconfig.json

    raster/                # Raster surfaces and ops
      src/
        index.ts
        surface/
          CanvasSurface.ts
          ImageDataOps.ts
        brush/
          BrushEngine.ts
          BrushTip.ts
        select/
          MagicWand.ts
          FloodFill.ts
      package.json
      tsconfig.json

    vec/                   # Vector scene, paths, tessellation (future)
      src/
        index.ts
        path/
          Path.ts
          BooleanOps.ts
        text/
          TextLayer.ts
      package.json
      tsconfig.json

    compositor/            # Blend + mask + filters (CPU/GPU-agnostic)
      src/
        index.ts
        cpu/
          PorterDuff.ts
          Filters.ts
        gpu/
          Pipelines.ts
      package.json
      tsconfig.json

    render-canvas2d/       # Canvas2D backend
      src/
        index.ts
        Canvas2DBackend.ts
      package.json
      tsconfig.json

    render-webgl/          # WebGL2 backend (future)
      src/
        index.ts
        GLContext.ts
        GLBackend.ts
      package.json
      tsconfig.json

    render-webgpu/         # WebGPU backend (future)
      src/
        index.ts
        GPUDevice.ts
        GPUBackend.ts
      package.json
      tsconfig.json

    renderer/              # Retained-mode traversal, tiling, invalidation
      src/
        index.ts
        TiledRenderer.ts
        TileCache.ts
        Viewport.ts
      package.json
      tsconfig.json

    selection/             # Selection models and ops
      src/
        index.ts
        RasterSelection.ts
        Feather.ts
      package.json
      tsconfig.json

    plugin/                # Plugin host APIs and loader
      src/
        index.ts
        PluginManager.ts
        PluginContext.ts
        sandbox/
          WorkerHost.ts
          Bridge.ts
      package.json
      tsconfig.json

    worker/                # Worker pool + OffscreenCanvas helpers
      src/
        index.ts
        WorkerPool.ts
        Tasks.ts
      package.json
      tsconfig.json

    shaders/               # WGSL/GLSL modules and bindings (string assets)
      src/
        index.ts
        wgsl/
          compositing.wgsl
          blur.wgsl
        glsl/
          compositing.frag
          blur.frag
      package.json
      tsconfig.json

    io/                    # Import/export: PNG, JPG, PSD, project JSON
      src/
        index.ts
        png/
          encode.ts
          decode.ts
        psd/
          import-psd.ts
        project/
          serialize.ts
          deserialize.ts
      package.json
      tsconfig.json

    color/                 # Color spaces, ICC (optional), conversions
      src/
        index.ts
        spaces/
          sRGB.ts
          OKLCH.ts
        convert.ts
      package.json
      tsconfig.json

    math/                  # Linear algebra, utilities shared across engines
      src/
        index.ts
        mat3.ts
        vec2.ts
      package.json
      tsconfig.json

    ui/                    # Headless UI models + React bindings
      src/
        index.ts
        headless/
          ToolController.ts
          Shortcuts.ts
        react/
          CanvasSurfaceView.tsx
          LayersPanel.tsx
      package.json
      tsconfig.json

    devtools/              # Inspector, perf HUD, logging
      src/
        index.ts
        Inspector.tsx
        Profiler.ts
      package.json
      tsconfig.json

    storage/               # Persistence, autosave, cloud adapters
      src/
        index.ts
        local/
          IndexedDBStore.ts
        cloud/
          S3Store.ts
      package.json
      tsconfig.json

  tools/
    create-arcanvas-app/   # Scaffolder CLI (optional)
      bin.js
      template/
        package.json
        src/main.ts
      package.json
      tsconfig.json
```