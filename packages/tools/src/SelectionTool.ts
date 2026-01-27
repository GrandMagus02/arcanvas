import type { Camera } from "@arcanvas/core";
import { HandleRenderer2D, HitTest2D, PhotoshopHandleStyle2D, Polygon2DObject } from "@arcanvas/feature-2d";
import type { InputState, NormalizedInputEvent } from "@arcanvas/interaction";
import { Vector2 } from "@arcanvas/math";
import type { ISelectable } from "@arcanvas/selection";
import { HandleInteraction, InteractionType, SelectionManager } from "@arcanvas/selection";
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

  /**
   * Handle renderer to use.
   */
  handleRenderer?: HandleRenderer2D;

  /**
   * Handle style to use.
   */
  handleStyle?: "photoshop" | "konva";
}

/**
 * Selection tool for selecting and manipulating 2D objects.
 */
export class SelectionTool extends Tool {
  readonly name = "select";

  private _camera: Camera | null = null;
  private _selectionManager: SelectionManager;
  private _handleRenderer: HandleRenderer2D;
  private _handleStyle: PhotoshopHandleStyle2D;
  private _handleInteraction: HandleInteraction;
  private _isDragging: boolean = false;
  private _dragStartPosition: { x: number; y: number } | null = null;
  private _selectables: Map<string, ISelectable> = new Map();

  constructor(options: SelectionToolOptions = {}) {
    super();
    this._camera = options.camera ?? null;
    this._selectionManager = options.selectionManager ?? new SelectionManager();
    this._handleRenderer = options.handleRenderer ?? new HandleRenderer2D();
    this._handleStyle = new PhotoshopHandleStyle2D();
    this._handleInteraction = new HandleInteraction();

    // Set up handle interaction callback
    this._handleInteraction.setInteractionCallback((data) => {
      this._onHandleInteraction(data);
    });

    // Set up selection change callback
    this._selectionManager.setSelectionChangeCallback((event) => {
      this._onSelectionChange(event);
    });
  }

  /**
   * Sets the camera for coordinate conversion.
   */
  setCamera(camera: Camera | null): void {
    this._camera = camera;
  }

  /**
   * Registers a selectable object.
   */
  registerSelectable(selectable: ISelectable): void {
    this._selectables.set(selectable.id, selectable);
    this._selectionManager.register(selectable);
  }

  /**
   * Unregisters a selectable object.
   */
  unregisterSelectable(id: string): void {
    this._selectables.delete(id);
    this._selectionManager.unregister(id);
  }

  activate(): void {
    // Tool activated
  }

  deactivate(): void {
    // Cancel any ongoing interactions
    if (this._handleInteraction.isActive) {
      this._handleInteraction.cancel();
    }
    this._isDragging = false;
    this._dragStartPosition = null;
  }

  handleInput(event: NormalizedInputEvent, state: InputState): void {
    if (!this._camera) {
      return;
    }

    // Use x/y from normalized event which are calculated as clientX/Y - rect.left/top
    // This gives coordinates relative to the canvas element's bounding box in CSS pixels
    const screenPoint = {
      x: event.position.x,
      y: event.position.y,
    };

    // Handle mouse down
    if (event.type === "mousedown" || event.type === "pointerdown" || event.type === "touchstart") {
      if (event.buttons.length === 0) {
        return;
      }

      const worldPoint = HitTest2D.screenToWorld(screenPoint, this._camera);

      // Check if clicking on a handle
      const selected = this._selectionManager.getSelected();
      for (const selectable of selected) {
        const bounds = selectable.getBounds();
        if (bounds) {
          const handleSet = this._handleStyle.createHandles(bounds);
          const handle = handleSet.getHandleAt(worldPoint);
          if (handle) {
            // Start handle interaction
            this._handleInteraction.start(handle, worldPoint as Vector2);
            this._dragStartPosition = screenPoint;
            // Stop event propagation to prevent camera controller from handling it
            if (event.originalEvent) {
              event.originalEvent.stopPropagation();
              event.originalEvent.preventDefault();
            }
            return;
          }
        }
      }

      // Check if clicking on a selectable object
      const hitObject = this._hitTestObjects(screenPoint);
      if (hitObject) {
        const addToSelection = state.modifiers.includes("Shift") || state.modifiers.includes("Meta");
        this._selectionManager.select(hitObject.id, addToSelection);
        this._isDragging = true;
        this._dragStartPosition = screenPoint;
        // Stop event propagation to prevent camera controller from handling it
        // Only when we actually select something
        if (event.originalEvent) {
          event.originalEvent.stopPropagation();
          event.originalEvent.preventDefault();
        }
        return; // Exit early to prevent camera from handling
      } else {
        // Clicked on empty space - deselect all (unless holding modifier)
        // Don't stop propagation here - let camera handle it for panning
        if (!state.modifiers.includes("Shift") && !state.modifiers.includes("Meta")) {
          this._selectionManager.clear();
        }
      }
    }

    // Handle mouse move
    if (event.type === "mousemove" || event.type === "pointermove" || event.type === "touchmove") {
      if (this._handleInteraction.isActive) {
        // Update handle interaction
        const worldPoint = HitTest2D.screenToWorld(screenPoint, this._camera);
        this._handleInteraction.update(worldPoint as Vector2);
      } else if (this._isDragging && this._dragStartPosition) {
        // Move selected objects
        // Convert screen delta to world delta
        const worldStart = HitTest2D.screenToWorld(this._dragStartPosition, this._camera);
        const worldEnd = HitTest2D.screenToWorld(screenPoint, this._camera);
        const worldDeltaX = worldEnd.x - worldStart.x;
        const worldDeltaY = worldEnd.y - worldStart.y;

        // Move all selected objects
        // This would need to be implemented based on how objects are moved
        // For now, this is a placeholder
      }
    }

    // Handle mouse up
    if (event.type === "mouseup" || event.type === "pointerup" || event.type === "touchend") {
      if (this._handleInteraction.isActive) {
        this._handleInteraction.end();
      }
      this._isDragging = false;
      this._dragStartPosition = null;
    }
  }

  /**
   * Performs hit-testing against all registered selectable objects.
   */
  private _hitTestObjects(screenPoint: { x: number; y: number }): ISelectable | null {
    if (!this._camera) {
      return null;
    }

    // Convert screen to world coordinates
    const worldPoint = HitTest2D.screenToWorld(screenPoint, this._camera);

    // Test objects in reverse order (top-most first)
    const selectables = Array.from(this._selectables.values()).reverse();

    for (const selectable of selectables) {
      if (!selectable.isVisible()) {
        continue;
      }

      // Check if it's a Polygon2DObject and do proper polygon hit-testing
      if (selectable instanceof Polygon2DObject) {
        // Use polygon hit-testing for accurate results
        const hit = HitTest2D.hitTestPolygon(screenPoint, selectable, selectable.transform, this._camera);
        if (hit) {
          return selectable;
        }
      } else {
        // Fallback to bounds check for other selectable types
        const bounds = selectable.getBounds();
        if (bounds && bounds.contains(worldPoint)) {
          return selectable;
        }
      }
    }

    return null;
  }

  /**
   * Called when a handle interaction occurs.
   */
  private _onHandleInteraction(data: { handle: unknown; type: InteractionType; delta: { x: number; y: number } }): void {
    // Handle resize/rotate based on interaction type
    // This would need to be implemented based on how objects are transformed
    // For now, this is a placeholder
  }

  /**
   * Called when selection changes.
   */
  private _onSelectionChange(event: { selectedIds: string[] }): void {
    // Update handle rendering, etc.
    // This would trigger a re-render of handles
  }

  /**
   * Renders selection handles (called by renderer).
   */
  renderHandles(context: { camera: Camera; viewport: { width: number; height: number } }): void {
    const selected = this._selectionManager.getSelected();
    for (const selectable of selected) {
      const bounds = selectable.getBounds();
      if (bounds) {
        // Render outline
        this._handleRenderer.renderOutline(bounds, context);

        // Render handles
        const handleSet = this._handleStyle.createHandles(bounds);
        this._handleRenderer.renderHandleSet(handleSet, context);
      }
    }
  }
}
