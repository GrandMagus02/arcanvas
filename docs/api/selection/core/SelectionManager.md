# SelectionManager

Manages selection state for selectable objects.
Supports single-select and multi-select modes.

## Methods

- [setSelectionChangeCallback](#setselectionchangecallback)
- [setMultiSelectEnabled](#setmultiselectenabled)
- [register](#register)
- [unregister](#unregister)
- [select](#select)
- [deselect](#deselect)
- [clear](#clear)
- [isSelected](#isselected)
- [getSelectedIds](#getselectedids)
- [getSelected](#getselected)
- [getSelectable](#getselectable)

### setSelectionChangeCallback

Sets the callback for selection change events.

| Method | Type |
| ---------- | ---------- |
| `setSelectionChangeCallback` | `(callback: SelectionChangeCallback or null) => void` |

### setMultiSelectEnabled

Enables or disables multi-select mode.
When disabled, selecting a new object deselects all others.

| Method | Type |
| ---------- | ---------- |
| `setMultiSelectEnabled` | `(enabled: boolean) => void` |

### register

Registers a selectable object.

| Method | Type |
| ---------- | ---------- |
| `register` | `(selectable: ISelectable) => void` |

### unregister

Unregisters a selectable object.

| Method | Type |
| ---------- | ---------- |
| `unregister` | `(id: string) => void` |

### select

Selects an object by ID.

| Method | Type |
| ---------- | ---------- |
| `select` | `(id: string, addToSelection?: boolean) => void` |

Parameters:

* `id`: - ID of the object to select
* `addToSelection`: - If true, adds to selection (multi-select). If false, replaces selection.


### deselect

Deselects an object by ID.

| Method | Type |
| ---------- | ---------- |
| `deselect` | `(id: string) => void` |

### clear

Clears all selections.

| Method | Type |
| ---------- | ---------- |
| `clear` | `() => void` |

### isSelected

Checks if an object is selected.

| Method | Type |
| ---------- | ---------- |
| `isSelected` | `(id: string) => boolean` |

### getSelectedIds

Gets all selected object IDs.

| Method | Type |
| ---------- | ---------- |
| `getSelectedIds` | `() => string[]` |

### getSelected

Gets all selected objects.

| Method | Type |
| ---------- | ---------- |
| `getSelected` | `() => ISelectable[]` |

### getSelectable

Gets a selectable object by ID.

| Method | Type |
| ---------- | ---------- |
| `getSelectable` | `(id: string) => ISelectable or undefined` |

# Interfaces

- [SelectionChangeEvent](#selectionchangeevent)

## SelectionChangeEvent

Selection change event data.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `selectedIds` | `string[]` | IDs of currently selected objects. |
| `addedIds` | `string[]` | IDs of objects that were just selected. |
| `removedIds` | `string[]` | IDs of objects that were just deselected. |


# Types

- [SelectionChangeCallback](#selectionchangecallback)

## SelectionChangeCallback

Callback type for selection change events.

| Type | Type |
| ---------- | ---------- |
| `SelectionChangeCallback` | `(event: SelectionChangeEvent) => void` |

