# TreeNodeError

Base error type for all {@link TreeNode}-related errors.

# TreeNodeSelfAttachmentError

Error thrown when attempting to attach a {@link TreeNode} as a child of itself.

# TreeNodeCycleError

Error thrown when an operation would introduce a cycle into the TreeNode hierarchy.

# TreeNode

A generic tree node that provides hierarchical tree structure and operations.

## Methods

- [add](#add)
- [addAt](#addat)
- [remove](#remove)
- [removeChild](#removechild)
- [removeChildren](#removechildren)
- [replaceChild](#replacechild)
- [replaceWith](#replacewith)
- [moveTo](#moveto)
- [size](#size)
- [index](#index)
- [siblings](#siblings)
- [prevSibling](#prevsibling)
- [nextSibling](#nextsibling)
- [ancestors](#ancestors)
- [descendants](#descendants)
- [pathFromRoot](#pathfromroot)
- [isAncestorOf](#isancestorof)
- [isDescendantOf](#isdescendantof)
- [contains](#contains)
- [traverse](#traverse)
- [traverseBF](#traversebf)
- [find](#find)
- [findAll](#findall)

### add

Adds a child TreeNode to this TreeNode, reparenting it if necessary.

If the child already has a parent, it will be removed from that parent before
being attached here.

| Method | Type |
| ---------- | ---------- |
| `add` | `(child: T) => this` |

Parameters:

* `child`: The TreeNode to add as a child.


Returns:

`this`, for chaining.

### addAt

Inserts a child at a specific index in the children array.

If the child already has a parent, it will be reparented to this node first.
The index is clamped to the `[0, children.length]` range.

| Method | Type |
| ---------- | ---------- |
| `addAt` | `(child: T, index: number) => this` |

Parameters:

* `child`: The TreeNode to insert.
* `index`: Target index in the children list (clamped if out of range).


Returns:

`this`, for chaining.

### remove

Detaches this TreeNode from its parent, if it has one.

After this call, {@link parent} will be `null`.

| Method | Type |
| ---------- | ---------- |
| `remove` | `() => void` |

### removeChild

Removes the given TreeNode from this TreeNode's children.

If the TreeNode is not a direct child, this is a no-op.

| Method | Type |
| ---------- | ---------- |
| `removeChild` | `(child: T) => void` |

Parameters:

* `child`: The child TreeNode to remove.


### removeChildren

Removes all children from this TreeNode.

All children's {@link parent} references are cleared.

| Method | Type |
| ---------- | ---------- |
| `removeChildren` | `() => void` |

### replaceChild

Replaces an existing child with a new TreeNode.

The new child will be reparented to this TreeNode, and the old child's parent
reference will be cleared. If `oldChild` is not a child of this TreeNode, this
method does nothing.

| Method | Type |
| ---------- | ---------- |
| `replaceChild` | `(oldChild: T, newChild: T) => void` |

Parameters:

* `oldChild`: The existing child to replace.
* `newChild`: The new child TreeNode.


### replaceWith

Replaces this TreeNode in its parent with another TreeNode.

If this TreeNode has no parent, this is a no-op.

| Method | Type |
| ---------- | ---------- |
| `replaceWith` | `(node: T) => void` |

Parameters:

* `node`: The TreeNode to insert in place of this TreeNode.


### moveTo

Moves this TreeNode to a new parent, optionally at a specific index.

If the new parent is the same as the current parent and `index` is `undefined`,
the operation is a no-op.

| Method | Type |
| ---------- | ---------- |
| `moveTo` | `(newParent: T, index?: number or undefined) => void` |

Parameters:

* `newParent`: The TreeNode that will become this TreeNode's new parent.
* `index`: Optional index to insert at in the new parent's children list.


### size

Counts the number of TreeNodes in the subtree rooted at this TreeNode.

| Method | Type |
| ---------- | ---------- |
| `size` | `() => number` |

Returns:

The total number of TreeNodes including this TreeNode.

### index

Returns this TreeNode's index in its parent's children array.

| Method | Type |
| ---------- | ---------- |
| `index` | `() => number` |

Returns:

The zero-based index, or `-1` if this TreeNode has no parent.

### siblings

Returns the siblings of this TreeNode (other children of the same parent).

| Method | Type |
| ---------- | ---------- |
| `siblings` | `() => T[]` |

Returns:

An array of sibling TreeNodes, or an empty array if this is a root.

### prevSibling

Returns the previous sibling of this TreeNode, if any.

| Method | Type |
| ---------- | ---------- |
| `prevSibling` | `() => T or null` |

Returns:

The previous sibling, or `null` if this TreeNode is the first child or a root.

### nextSibling

Returns the next sibling of this TreeNode, if any.

| Method | Type |
| ---------- | ---------- |
| `nextSibling` | `() => T or null` |

Returns:

The next sibling, or `null` if this TreeNode is the last child or a root.

### ancestors

Returns all ancestors of this TreeNode, starting from its parent up to the root.

| Method | Type |
| ---------- | ---------- |
| `ancestors` | `() => T[]` |

Returns:

An array of ancestor TreeNodes in order from closest parent to root.

### descendants

Returns all descendants of this TreeNode (children, grandchildren, etc.).

| Method | Type |
| ---------- | ---------- |
| `descendants` | `() => T[]` |

Returns:

A flat array of all descendant TreeNodes.

### pathFromRoot

Returns the path from the root TreeNode down to this TreeNode (inclusive).

| Method | Type |
| ---------- | ---------- |
| `pathFromRoot` | `() => T[]` |

Returns:

An array of TreeNodes starting with the root and ending with this TreeNode.

### isAncestorOf

Determines whether this TreeNode is an ancestor of another TreeNode.

| Method | Type |
| ---------- | ---------- |
| `isAncestorOf` | `(other: T) => boolean` |

Parameters:

* `other`: The TreeNode to test against.


Returns:

`true` if this TreeNode is an ancestor of `other`, otherwise `false`.

### isDescendantOf

Determines whether this TreeNode is a descendant of another TreeNode.

| Method | Type |
| ---------- | ---------- |
| `isDescendantOf` | `(other: T) => boolean` |

Parameters:

* `other`: The node to test against.


Returns:

`true` if this TreeNode is a descendant of `other`, otherwise `false`.

### contains

Determines whether this node's subtree contains another node.

| Method | Type |
| ---------- | ---------- |
| `contains` | `(node: T) => boolean` |

Parameters:

* `node`: The TreeNode to look for.


Returns:

`true` if `node` is this node or one of its descendants.

### traverse

Traverses the subtree rooted at this TreeNode in depth-first order.

| Method | Type |
| ---------- | ---------- |
| `traverse` | `(fn: (n: T) => void) => void` |

Parameters:

* `fn`: Callback invoked for each visited TreeNode.


### traverseBF

Traverses the subtree rooted at this TreeNode in breadth-first order.

| Method | Type |
| ---------- | ---------- |
| `traverseBF` | `(fn: (n: T) => void) => void` |

Parameters:

* `fn`: Callback invoked for each visited TreeNode.


### find

Finds the first TreeNode in this subtree that matches the given predicate.

| Method | Type |
| ---------- | ---------- |
| `find` | `(predicate: (n: T) => boolean) => T or null` |

Parameters:

* `predicate`: Function used to test each TreeNode.


Returns:

The first matching TreeNode, or `null` if none match.

### findAll

Finds all TreeNodes in this subtree that match the given predicate.

| Method | Type |
| ---------- | ---------- |
| `findAll` | `(predicate: (n: T) => boolean) => T[]` |

Parameters:

* `predicate`: Function used to test each TreeNode.


Returns:

An array of all matching TreeNodes (possibly empty).

## Properties

- [parent](#parent)
- [children](#children)

### parent

Reference to the parent node, or `null` if this is a root node.

| Property | Type |
| ---------- | ---------- |
| `parent` | `T or null` |

### children

Array of child nodes.

| Property | Type |
| ---------- | ---------- |
| `children` | `T[]` |
