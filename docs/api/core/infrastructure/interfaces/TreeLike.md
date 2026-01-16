
# Interfaces

- [TreeLike](#treelike)

## TreeLike

Interface for objects that form a hierarchical tree structure.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `parent` | `T or null` | Reference to the parent node, or `null` if this is a root node. |
| `children` | `T[]` | Array of child nodes. |
| `isRoot` | `boolean` | Indicates whether this node is a root (has no parent). |
| `isLeaf` | `boolean` | Indicates whether this node is a leaf (has no children). |
| `root` | `T` | The root node of the tree that this node belongs to. |
| `depth` | `number` | The depth of this node in the tree (distance from root). Roots have depth `0`. |
| `level` | `number` | The level (height) of the subtree rooted at this node. Leaf nodes have level `0`. |

