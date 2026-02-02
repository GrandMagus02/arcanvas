# TreeNodeError

Base error type for all TreeNode-related errors.

# TreeNodeSelfAttachmentError

Error thrown when attempting to attach a TreeNode as a child of itself.

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

Adds a child TreeNode to this TreeNode.

| Method | Type |
| ---------- | ---------- |
| `add` | `(child: T) => this` |

### addAt

Inserts a child at a specific index.

| Method | Type |
| ---------- | ---------- |
| `addAt` | `(child: T, index: number) => this` |

### remove

Detaches this TreeNode from its parent.

| Method | Type |
| ---------- | ---------- |
| `remove` | `() => void` |

### removeChild

Removes the given TreeNode from this TreeNode's children.

| Method | Type |
| ---------- | ---------- |
| `removeChild` | `(child: T) => void` |

### removeChildren

Removes all children from this TreeNode.

| Method | Type |
| ---------- | ---------- |
| `removeChildren` | `() => void` |

### replaceChild

Replaces an existing child with a new TreeNode.

| Method | Type |
| ---------- | ---------- |
| `replaceChild` | `(oldChild: T, newChild: T) => void` |

### replaceWith

Replaces this TreeNode in its parent with another TreeNode.

| Method | Type |
| ---------- | ---------- |
| `replaceWith` | `(node: T) => void` |

### moveTo

Moves this TreeNode to a new parent.

| Method | Type |
| ---------- | ---------- |
| `moveTo` | `(newParent: T, index?: number or undefined) => void` |

### size

| Method | Type |
| ---------- | ---------- |
| `size` | `() => number` |

### index

| Method | Type |
| ---------- | ---------- |
| `index` | `() => number` |

### siblings

| Method | Type |
| ---------- | ---------- |
| `siblings` | `() => T[]` |

### prevSibling

| Method | Type |
| ---------- | ---------- |
| `prevSibling` | `() => T or null` |

### nextSibling

| Method | Type |
| ---------- | ---------- |
| `nextSibling` | `() => T or null` |

### ancestors

| Method | Type |
| ---------- | ---------- |
| `ancestors` | `() => T[]` |

### descendants

| Method | Type |
| ---------- | ---------- |
| `descendants` | `() => T[]` |

### pathFromRoot

| Method | Type |
| ---------- | ---------- |
| `pathFromRoot` | `() => T[]` |

### isAncestorOf

| Method | Type |
| ---------- | ---------- |
| `isAncestorOf` | `(other: T) => boolean` |

### isDescendantOf

| Method | Type |
| ---------- | ---------- |
| `isDescendantOf` | `(other: T) => boolean` |

### contains

| Method | Type |
| ---------- | ---------- |
| `contains` | `(node: T) => boolean` |

### traverse

| Method | Type |
| ---------- | ---------- |
| `traverse` | `(fn: (n: T) => void) => void` |

### traverseBF

| Method | Type |
| ---------- | ---------- |
| `traverseBF` | `(fn: (n: T) => void) => void` |

### find

| Method | Type |
| ---------- | ---------- |
| `find` | `(predicate: (n: T) => boolean) => T or null` |

### findAll

| Method | Type |
| ---------- | ---------- |
| `findAll` | `(predicate: (n: T) => boolean) => T[]` |

## Properties

- [parent](#parent)
- [children](#children)

### parent

| Property | Type |
| ---------- | ---------- |
| `parent` | `T or null` |

### children

| Property | Type |
| ---------- | ---------- |
| `children` | `T[]` |
