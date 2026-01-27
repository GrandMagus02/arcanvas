import type { ISelectable } from "../interfaces/ISelectable";

/**
 * Selection change event data.
 */
export interface SelectionChangeEvent {
  /**
   * IDs of currently selected objects.
   */
  selectedIds: string[];

  /**
   * IDs of objects that were just selected.
   */
  addedIds: string[];

  /**
   * IDs of objects that were just deselected.
   */
  removedIds: string[];
}

/**
 * Callback type for selection change events.
 */
export type SelectionChangeCallback = (event: SelectionChangeEvent) => void;

/**
 * Manages selection state for selectable objects.
 * Supports single-select and multi-select modes.
 */
export class SelectionManager {
  private _selectedIds: Set<string> = new Set();
  private _selectables: Map<string, ISelectable> = new Map();
  private _onSelectionChange: SelectionChangeCallback | null = null;
  private _multiSelectEnabled: boolean = true;

  /**
   * Sets the callback for selection change events.
   */
  setSelectionChangeCallback(callback: SelectionChangeCallback | null): void {
    this._onSelectionChange = callback;
  }

  /**
   * Enables or disables multi-select mode.
   * When disabled, selecting a new object deselects all others.
   */
  setMultiSelectEnabled(enabled: boolean): void {
    this._multiSelectEnabled = enabled;
  }

  /**
   * Registers a selectable object.
   */
  register(selectable: ISelectable): void {
    this._selectables.set(selectable.id, selectable);
  }

  /**
   * Unregisters a selectable object.
   */
  unregister(id: string): void {
    this._selectables.delete(id);
    this._selectedIds.delete(id);
  }

  /**
   * Selects an object by ID.
   * @param id - ID of the object to select
   * @param addToSelection - If true, adds to selection (multi-select). If false, replaces selection.
   */
  select(id: string, addToSelection: boolean = false): void {
    if (!this._selectables.has(id)) {
      return;
    }

    const wasSelected = this._selectedIds.has(id);
    const addedIds: string[] = [];
    const removedIds: string[] = [];

    if (!addToSelection && !this._multiSelectEnabled) {
      // Clear existing selection
      const previousIds = Array.from(this._selectedIds);
      this._selectedIds.clear();
      removedIds.push(...previousIds);
    }

    if (!wasSelected) {
      this._selectedIds.add(id);
      addedIds.push(id);
    }

    this._notifySelectionChange(addedIds, removedIds);
  }

  /**
   * Deselects an object by ID.
   */
  deselect(id: string): void {
    if (this._selectedIds.delete(id)) {
      this._notifySelectionChange([], [id]);
    }
  }

  /**
   * Clears all selections.
   */
  clear(): void {
    if (this._selectedIds.size === 0) {
      return;
    }

    const removedIds = Array.from(this._selectedIds);
    this._selectedIds.clear();
    this._notifySelectionChange([], removedIds);
  }

  /**
   * Checks if an object is selected.
   */
  isSelected(id: string): boolean {
    return this._selectedIds.has(id);
  }

  /**
   * Gets all selected object IDs.
   */
  getSelectedIds(): string[] {
    return Array.from(this._selectedIds);
  }

  /**
   * Gets all selected objects.
   */
  getSelected(): ISelectable[] {
    return Array.from(this._selectedIds)
      .map((id) => this._selectables.get(id))
      .filter((s): s is ISelectable => s !== undefined);
  }

  /**
   * Gets a selectable object by ID.
   */
  getSelectable(id: string): ISelectable | undefined {
    return this._selectables.get(id);
  }

  /**
   * Notifies listeners of selection changes.
   */
  private _notifySelectionChange(addedIds: string[], removedIds: string[]): void {
    if (this._onSelectionChange) {
      this._onSelectionChange({
        selectedIds: this.getSelectedIds(),
        addedIds,
        removedIds,
      });
    }
  }
}
