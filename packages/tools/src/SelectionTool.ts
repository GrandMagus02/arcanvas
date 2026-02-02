import type { Camera } from "@arcanvas/core";
import { buildAdornerFor, getWorldUnitsPerPixel, HitTest2D, Polygon2DObject, type IElementWithBoundsAndTransform } from "@arcanvas/feature-2d";
import type { RenderObject } from "@arcanvas/graphics";
import { ModifierKey, type InputState, type NormalizedInputEvent } from "@arcanvas/interaction";
import { Vector2 } from "@arcanvas/math";
import type { ISelectable } from "@arcanvas/selection";
import { HandleInteraction, SelectionManager, type DragInfo } from "@arcanvas/selection";
import { Tool } from "./Tool";

/**
 * Options for SelectionTool.
 */
export interface SelectionToolOptions {
  /**
   * Camera to use for coordinate conversion.
   */
  camera?: Camera;

  /**
   * Selection manager to use.
   */
  selectionManager?: SelectionManager;
}

/**
 * Selection tool for selecting and manipulating 2D objects.
 * Uses ISelectionAdorner (Strategy + Decorator): handles and mesh visuals come from
 * buildAdornerFor(selection). Render by submitting getAdornerMeshes() to the WebGL pipeline.
 */
/**
 * Pixels the pointer must move from pointerdown before starting a drag.
 * Lower threshold for more responsive dragging.
 */
const DRAG_THRESHOLD_PX = 4;

/**
 *
 */
export class SelectionTool extends Tool {
  readonly name = "select";

  private _camera: Camera | null = null;
  private _selectionManager: SelectionManager;
  private _handleInteraction: HandleInteraction;
  private _isDragging: boolean = false;
  private _dragStartPosition: { x: number; y: number } | null = null;
  private _selectables: Map<string, ISelectable> = new Map();
  private _activeSelection: IElementWithBoundsAndTransform | IElementWithBoundsAndTransform[] | null = null;
  /** Optional hit id set by host on pointerdown when it has already hit-tested (e.g. same event). Used when tool's _hitTestObjects fails. */
  private _pointerDownHitId: string | null = null;

  constructor(options: SelectionToolOptions = {}) {
    super();
    this._camera = options.camera ?? null;
    this._selectionManager = options.selectionManager ?? new SelectionManager();
    this._handleInteraction = new HandleInteraction();

    this._handleInteraction.setInteractionCallback((data) => {
      this._onHandleInteraction(data);
    });

    this._selectionManager.setSelectionChangeCallback(() => {
      this._activeSelection = null;
    });
  }

  setCamera(camera: Camera | null): void {
    this._camera = camera;
  }

  /**
   * Sets an optional hit id for the current pointerdown.
   * If the host has already performed a hit test (e.g. for hover), it can pass the hit id here
   * so selection works even when the tool's internal hit test would miss (e.g. coordinate/timing).
   * Cleared after use or on next pointerdown.
   */
  setPointerDownHit(id: string | null): void {
    this._pointerDownHitId = id;
  }

  registerSelectable(selectable: ISelectable): void {
    this._selectables.set(selectable.id, selectable);
    this._selectionManager.register(selectable);
  }

  unregisterSelectable(id: string): void {
    this._selectables.delete(id);
    this._selectionManager.unregister(id);
  }

  activate(): void {}

  deactivate(): void {
    if (this._handleInteraction.isActive) {
      this._handleInteraction.cancel();
    }
    this._isDragging = false;
    this._dragStartPosition = null;
    this._activeSelection = null;
  }

  handleInput(event: NormalizedInputEvent, state: InputState): void {
    if (!this._camera) return;

    const screenPoint = { x: event.position.x, y: event.position.y };
    // Check if any mouse button is currently pressed (from event or tracked pointers)
    const isButtonPressed = event.buttons.length > 0;

    if (event.type === "mousedown" || event.type === "pointerdown" || event.type === "touchstart") {
      if (event.buttons.length === 0) return;

      // Ignore duplicate mousedown if we already handled pointerdown
      if (event.type === "mousedown" && this._dragStartPosition) {
        return;
      }

      const worldPoint = HitTest2D.screenToWorld(screenPoint, this._camera);
      const selected = this._getSelectedAsElements();

      // Use host-provided hit id if set (e.g. from same pointerdown hit test in Vue)
      const hostHitId = this._pointerDownHitId;
      this._pointerDownHitId = null;

      // Check handles first if we have a selection
      if (selected.length > 0) {
        const adorner = buildAdornerFor(selected);
        if (adorner) {
          const selectionArg = selected.length > 1 ? selected : selected[0]!;
          const handles = adorner.getHandles(selectionArg);
          const worldUnitsPerPixel = getWorldUnitsPerPixel(this._camera);
          for (let i = handles.length - 1; i >= 0; i--) {
            const handle = handles[i]!;
            if (handle.contains(worldPoint as Vector2, worldUnitsPerPixel)) {
              this._activeSelection = selectionArg;
              this._handleInteraction.start(handle, worldPoint as Vector2);
              this._dragStartPosition = screenPoint;
              if (event.originalEvent) {
                event.originalEvent.stopPropagation();
                event.originalEvent.preventDefault();
              }
              return;
            }
          }
        }
      }

      if (hostHitId !== null && this._selectionManager.getSelectable(hostHitId)) {
        const addToSelection = state.modifiers.includes(ModifierKey.Shift) || state.modifiers.includes(ModifierKey.Meta);
        this._selectionManager.select(hostHitId, addToSelection);
        this._dragStartPosition = screenPoint;
        if (event.originalEvent) {
          event.originalEvent.stopPropagation();
          event.originalEvent.preventDefault();
        }
        return;
      }

      const hitObject = this._hitTestObjects(screenPoint);
      if (hitObject) {
        const addToSelection = state.modifiers.includes(ModifierKey.Shift) || state.modifiers.includes(ModifierKey.Meta);
        this._selectionManager.select(hitObject.id, addToSelection);
        this._dragStartPosition = screenPoint;
        if (event.originalEvent) {
          event.originalEvent.stopPropagation();
          event.originalEvent.preventDefault();
        }
        return;
      }

      if (!state.modifiers.includes(ModifierKey.Shift) && !state.modifiers.includes(ModifierKey.Meta)) {
        this._selectionManager.clear();
      }
    }

    if (event.type === "mousemove" || event.type === "pointermove" || event.type === "touchmove") {
      // Only process drag if a button is actually pressed
      if (!isButtonPressed) {
        // Reset drag state if mouse was released outside canvas or event was missed
        if (this._dragStartPosition || this._isDragging) {
          this._isDragging = false;
          this._dragStartPosition = null;
          if (this._handleInteraction.isActive) {
            this._handleInteraction.end();
            this._activeSelection = null;
          }
        }
        return;
      }

      if (this._handleInteraction.isActive) {
        const worldPoint = HitTest2D.screenToWorld(screenPoint, this._camera);
        this._handleInteraction.update(worldPoint as Vector2);
      } else if (this._dragStartPosition) {
        const selected = this._getSelectedAsElements();
        const dist = Math.hypot(screenPoint.x - this._dragStartPosition.x, screenPoint.y - this._dragStartPosition.y);
        if (!this._isDragging && dist > DRAG_THRESHOLD_PX && selected.length > 0) {
          this._isDragging = true;
        }
        if (this._isDragging && selected.length > 0) {
          const worldStart = HitTest2D.screenToWorld(this._dragStartPosition, this._camera);
          const worldEnd = HitTest2D.screenToWorld(screenPoint, this._camera);
          const dx = worldEnd.x - worldStart.x;
          const dy = worldEnd.y - worldStart.y;
          for (const el of selected) {
            if ("transform" in el && el.transform) {
              el.transform.matrix.translate(dx, dy, 0);
            }
          }
          this._dragStartPosition = screenPoint;
        }
      }
    }

    if (event.type === "mouseup" || event.type === "pointerup" || event.type === "touchend") {
      if (this._handleInteraction.isActive) {
        this._handleInteraction.end();
        this._activeSelection = null;
      }
      this._isDragging = false;
      this._dragStartPosition = null;
    }
  }

  /**
   * Returns current selection as elements with bounds and transform (for adorner).
   */
  private _getSelectedAsElements(): IElementWithBoundsAndTransform[] {
    const selected = this._selectionManager.getSelected();
    return selected.filter((s): s is IElementWithBoundsAndTransform => {
      if (!s) return false;
      const hasTransform = "transform" in s && !!(s as unknown as { transform: unknown }).transform;
      const b = s.getBounds();
      return hasTransform && !!b;
    });
  }

  private _hitTestObjects(screenPoint: { x: number; y: number }): ISelectable | null {
    if (!this._camera) return null;
    const worldPoint = HitTest2D.screenToWorld(screenPoint, this._camera);
    const selectables = Array.from(this._selectables.values()).reverse();

    for (const selectable of selectables) {
      if (!selectable.isVisible()) continue;
      if (selectable instanceof Polygon2DObject) {
        const hit = HitTest2D.hitTestPolygon(screenPoint, selectable, selectable.transform, this._camera);
        if (hit) return selectable;
      } else {
        const bounds = selectable.getBounds();
        if (bounds && bounds.contains(worldPoint)) return selectable;
      }
    }
    return null;
  }

  private _onHandleInteraction(data: {
    handle: { id?: string };
    startPosition: { x: number; y: number };
    currentPosition: { x: number; y: number };
    delta: { x: number; y: number };
    incrementalDelta: { x: number; y: number };
  }): void {
    const selection = this._activeSelection;
    if (!selection) return;
    const selected = this._getSelectedAsElements();
    if (selected.length === 0) return;
    const adorner = buildAdornerFor(selected);
    if (!adorner) return;
    const handleId = data.handle.id ?? "";
    const drag: DragInfo = {
      startPosition: data.startPosition,
      currentPosition: data.currentPosition,
      delta: data.delta,
      incrementalDelta: data.incrementalDelta,
    };
    const selectionArg = selected.length > 1 ? selected : selected[0]!;
    adorner.dragHandle(selectionArg, handleId, drag);
  }

  /**
   * Returns adorner meshes for the current selection to submit to the WebGL pipeline.
   * Call this from the render loop and draw the returned RenderObjects like any other scene objects.
   */
  getAdornerMeshes(): RenderObject[] {
    const selected = this._getSelectedAsElements();
    if (selected.length === 0) return [];
    const adorner = buildAdornerFor(selected);
    if (!adorner || !adorner.getMeshes) return [];
    const selectionArg = selected.length > 1 ? selected : selected[0]!;
    const context = this._camera ? { camera: this._camera } : undefined;
    return (adorner.getMeshes(selectionArg, context) ?? []) as RenderObject[];
  }
}
