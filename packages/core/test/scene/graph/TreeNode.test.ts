import { describe, expect, it } from "bun:test";
import { TreeNode, TreeNodeCycleError, TreeNodeError, TreeNodeSelfAttachmentError } from "src/scene/graph/TreeNode";

/**
 * Concrete test implementation of TreeNode for testing purposes.
 */
class TestNode extends TreeNode<TestNode> {
  name: string;
  constructor(name: string) {
    super();
    this.name = name;
  }
}

describe("TreeNode", () => {
  describe("Error Types", () => {
    it("TreeNodeError is an Error instance", () => {
      const error = new TreeNodeError("test message");
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(TreeNodeError);
      expect(error.name).toBe("TreeNodeError");
      expect(error.message).toBe("test message");
    });

    it("TreeNodeSelfAttachmentError extends TreeNodeError", () => {
      const error = new TreeNodeSelfAttachmentError();
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(TreeNodeError);
      expect(error).toBeInstanceOf(TreeNodeSelfAttachmentError);
      expect(error.name).toBe("TreeNodeSelfAttachmentError");
      expect(error.message).toBe("Cannot attach a node to itself.");
    });

    it("TreeNodeCycleError extends TreeNodeError", () => {
      const error = new TreeNodeCycleError();
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(TreeNodeError);
      expect(error).toBeInstanceOf(TreeNodeCycleError);
      expect(error.name).toBe("TreeNodeCycleError");
      expect(error.message).toBe("Cannot create cycles (child is an ancestor).");
    });
  });

  describe("Basic Properties", () => {
    it("initializes with null parent and empty children", () => {
      const node = new TestNode("node");
      expect(node.parent).toBeNull();
      expect(node.children).toEqual([]);
    });

    it("isRoot returns true for nodes without parent", () => {
      const root = new TestNode("root");
      expect(root.isRoot).toBe(true);

      const child = new TestNode("child");
      root.add(child);
      expect(child.isRoot).toBe(false);
    });

    it("isLeaf returns true for nodes without children", () => {
      const leaf = new TestNode("leaf");
      expect(leaf.isLeaf).toBe(true);

      const parent = new TestNode("parent");
      parent.add(leaf);
      expect(leaf.isLeaf).toBe(true);
      expect(parent.isLeaf).toBe(false);
    });
  });

  describe("Adding Children", () => {
    it("adds a single child", () => {
      const parent = new TestNode("parent");
      const child = new TestNode("child");

      const result = parent.add(child);
      expect(result).toBe(parent);
      expect(parent.children).toEqual([child]);
      expect(child.parent).toBe(parent);
    });

    it("adds multiple children", () => {
      const parent = new TestNode("parent");
      const child1 = new TestNode("child1");
      const child2 = new TestNode("child2");
      const child3 = new TestNode("child3");

      parent.add(child1).add(child2).add(child3);
      expect(parent.children).toEqual([child1, child2, child3]);
      expect(child1.parent).toBe(parent);
      expect(child2.parent).toBe(parent);
      expect(child3.parent).toBe(parent);
    });

    it("reparents child when adding to new parent", () => {
      const p1 = new TestNode("p1");
      const p2 = new TestNode("p2");
      const child = new TestNode("child");

      p1.add(child);
      expect(child.parent).toBe(p1);
      expect(p1.children).toEqual([child]);

      p2.add(child);
      expect(child.parent).toBe(p2);
      expect(p1.children).toEqual([]);
      expect(p2.children).toEqual([child]);
    });

    it("throws TreeNodeSelfAttachmentError when adding self", () => {
      const node = new TestNode("self");
      expect(() => node.add(node)).toThrow(TreeNodeSelfAttachmentError);
    });

    it("throws TreeNodeCycleError when adding ancestor", () => {
      const root = new TestNode("root");
      const child = new TestNode("child");
      const grandchild = new TestNode("grandchild");

      root.add(child);
      child.add(grandchild);

      expect(() => grandchild.add(root)).toThrow(TreeNodeCycleError);
      expect(() => grandchild.add(child)).toThrow(TreeNodeCycleError);
    });

    it("addAt inserts child at specific index", () => {
      const parent = new TestNode("parent");
      const a = new TestNode("a");
      const b = new TestNode("b");
      const c = new TestNode("c");

      parent.add(a).add(c);
      parent.addAt(b, 1);

      expect(parent.children).toEqual([a, b, c]);
      expect(b.parent).toBe(parent);
    });

    it("addAt clamps negative index to 0", () => {
      const parent = new TestNode("parent");
      const a = new TestNode("a");
      const b = new TestNode("b");

      parent.add(b);
      parent.addAt(a, -5);

      expect(parent.children[0]).toBe(a);
    });

    it("addAt clamps index beyond length to end", () => {
      const parent = new TestNode("parent");
      const a = new TestNode("a");
      const b = new TestNode("b");
      const c = new TestNode("c");

      parent.add(a).add(b);
      parent.addAt(c, 100);

      expect(parent.children[parent.children.length - 1]).toBe(c);
    });
  });

  describe("Removing Nodes", () => {
    it("remove detaches node from parent", () => {
      const parent = new TestNode("parent");
      const child = new TestNode("child");

      parent.add(child);
      child.remove();

      expect(child.parent).toBeNull();
      expect(parent.children).toEqual([]);
    });

    it("remove is no-op for root nodes", () => {
      const root = new TestNode("root");
      root.remove();
      expect(root.parent).toBeNull();
    });

    it("removeChild removes specific child", () => {
      const parent = new TestNode("parent");
      const a = new TestNode("a");
      const b = new TestNode("b");
      const c = new TestNode("c");

      parent.add(a).add(b).add(c);
      parent.removeChild(b);

      expect(parent.children).toEqual([a, c]);
      expect(b.parent).toBeNull();
    });

    it("removeChild is no-op for non-child", () => {
      const parent = new TestNode("parent");
      const child = new TestNode("child");
      const other = new TestNode("other");

      parent.add(child);
      parent.removeChild(other);

      expect(parent.children).toEqual([child]);
    });

    it("removeChildren removes all children", () => {
      const parent = new TestNode("parent");
      const a = new TestNode("a");
      const b = new TestNode("b");
      const c = new TestNode("c");

      parent.add(a).add(b).add(c);
      parent.removeChildren();

      expect(parent.children).toEqual([]);
      expect(a.parent).toBeNull();
      expect(b.parent).toBeNull();
      expect(c.parent).toBeNull();
    });
  });

  describe("Replacing Nodes", () => {
    it("replaceChild replaces existing child", () => {
      const parent = new TestNode("parent");
      const oldChild = new TestNode("old");
      const newChild = new TestNode("new");

      parent.add(oldChild);
      parent.replaceChild(oldChild, newChild);

      expect(parent.children).toEqual([newChild]);
      expect(oldChild.parent).toBeNull();
      expect(newChild.parent).toBe(parent);
    });

    it("replaceChild is no-op when oldChild === newChild", () => {
      const parent = new TestNode("parent");
      const child = new TestNode("child");

      parent.add(child);
      parent.replaceChild(child, child);

      expect(parent.children).toEqual([child]);
      expect(child.parent).toBe(parent);
    });

    it("replaceChild is no-op when oldChild not found", () => {
      const parent = new TestNode("parent");
      const child = new TestNode("child");
      const other = new TestNode("other");

      parent.add(child);
      parent.replaceChild(other, new TestNode("new"));

      expect(parent.children).toEqual([child]);
    });

    it("replaceWith replaces node in its parent", () => {
      const parent = new TestNode("parent");
      const old = new TestNode("old");
      const replacement = new TestNode("replacement");

      parent.add(old);
      old.replaceWith(replacement);

      expect(parent.children).toEqual([replacement]);
      expect(old.parent).toBeNull();
      expect(replacement.parent).toBe(parent);
    });

    it("replaceWith is no-op for root nodes", () => {
      const root = new TestNode("root");
      const replacement = new TestNode("replacement");

      root.replaceWith(replacement);

      expect(root.parent).toBeNull();
      expect(replacement.parent).toBeNull();
    });
  });

  describe("Moving Nodes", () => {
    it("moveTo moves node to new parent", () => {
      const p1 = new TestNode("p1");
      const p2 = new TestNode("p2");
      const node = new TestNode("node");

      p1.add(node);
      node.moveTo(p2);

      expect(p1.children).toEqual([]);
      expect(p2.children).toEqual([node]);
      expect(node.parent).toBe(p2);
    });

    it("moveTo inserts at specific index", () => {
      const p1 = new TestNode("p1");
      const p2 = new TestNode("p2");
      const a = new TestNode("a");
      const b = new TestNode("b");
      const c = new TestNode("c");

      p1.add(a).add(b).add(c);
      c.moveTo(p2, 0);

      expect(p1.children).toEqual([a, b]);
      expect(p2.children).toEqual([c]);
    });

    it("moveTo is no-op when moving to same parent without index", () => {
      const parent = new TestNode("parent");
      const child = new TestNode("child");

      parent.add(child);
      const originalIndex = child.index();
      child.moveTo(parent);

      expect(child.index()).toBe(originalIndex);
      expect(parent.children).toEqual([child]);
    });

    it("moveTo throws when creating cycle", () => {
      const root = new TestNode("root");
      const child = new TestNode("child");

      root.add(child);
      expect(() => root.moveTo(child)).toThrow(TreeNodeCycleError);
    });
  });

  describe("Tree Properties", () => {
    it("root returns self for root nodes", () => {
      const root = new TestNode("root");
      expect(root.root).toBe(root);
    });

    it("root returns tree root for nested nodes", () => {
      const root = new TestNode("root");
      const child = new TestNode("child");
      const grandchild = new TestNode("grandchild");

      root.add(child);
      child.add(grandchild);

      expect(child.root).toBe(root);
      expect(grandchild.root).toBe(root);
    });

    it("depth returns 0 for root", () => {
      const root = new TestNode("root");
      expect(root.depth).toBe(0);
    });

    it("depth returns correct depth for nested nodes", () => {
      const root = new TestNode("root");
      const level1 = new TestNode("level1");
      const level2 = new TestNode("level2");
      const level3 = new TestNode("level3");

      root.add(level1);
      level1.add(level2);
      level2.add(level3);

      expect(root.depth).toBe(0);
      expect(level1.depth).toBe(1);
      expect(level2.depth).toBe(2);
      expect(level3.depth).toBe(3);
    });

    it("level returns 0 for leaf nodes", () => {
      const leaf = new TestNode("leaf");
      expect(leaf.level).toBe(0);
    });

    it("level returns correct level for nodes with children", () => {
      const root = new TestNode("root");
      const child1 = new TestNode("child1");
      const child2 = new TestNode("child2");
      const grandchild = new TestNode("grandchild");

      root.add(child1).add(child2);
      child1.add(grandchild);

      expect(grandchild.level).toBe(0);
      expect(child2.level).toBe(0);
      expect(child1.level).toBe(1);
      expect(root.level).toBe(2);
    });

    it("size returns 1 for single node", () => {
      const node = new TestNode("node");
      expect(node.size()).toBe(1);
    });

    it("size returns total count including descendants", () => {
      const root = new TestNode("root");
      const child1 = new TestNode("child1");
      const child2 = new TestNode("child2");
      const grandchild = new TestNode("grandchild");

      root.add(child1).add(child2);
      child1.add(grandchild);

      expect(grandchild.size()).toBe(1);
      expect(child2.size()).toBe(1);
      expect(child1.size()).toBe(2);
      expect(root.size()).toBe(4);
    });

    it("index returns -1 for root nodes", () => {
      const root = new TestNode("root");
      expect(root.index()).toBe(-1);
    });

    it("index returns correct position in parent", () => {
      const parent = new TestNode("parent");
      const a = new TestNode("a");
      const b = new TestNode("b");
      const c = new TestNode("c");

      parent.add(a).add(b).add(c);

      expect(a.index()).toBe(0);
      expect(b.index()).toBe(1);
      expect(c.index()).toBe(2);
    });
  });

  describe("Siblings", () => {
    it("siblings returns empty array for root", () => {
      const root = new TestNode("root");
      expect(root.siblings()).toEqual([]);
    });

    it("siblings returns other children of parent", () => {
      const parent = new TestNode("parent");
      const a = new TestNode("a");
      const b = new TestNode("b");
      const c = new TestNode("c");

      parent.add(a).add(b).add(c);

      expect(a.siblings()).toEqual([b, c]);
      expect(b.siblings()).toEqual([a, c]);
      expect(c.siblings()).toEqual([a, b]);
    });

    it("prevSibling returns null for first child", () => {
      const parent = new TestNode("parent");
      const first = new TestNode("first");
      const second = new TestNode("second");

      parent.add(first).add(second);
      expect(first.prevSibling()).toBeNull();
      expect(second.prevSibling()).toBe(first);
    });

    it("prevSibling returns null for root", () => {
      const root = new TestNode("root");
      expect(root.prevSibling()).toBeNull();
    });

    it("nextSibling returns null for last child", () => {
      const parent = new TestNode("parent");
      const first = new TestNode("first");
      const second = new TestNode("second");

      parent.add(first).add(second);
      expect(first.nextSibling()).toBe(second);
      expect(second.nextSibling()).toBeNull();
    });

    it("nextSibling returns null for root", () => {
      const root = new TestNode("root");
      expect(root.nextSibling()).toBeNull();
    });
  });

  describe("Ancestors and Descendants", () => {
    it("ancestors returns empty array for root", () => {
      const root = new TestNode("root");
      expect(root.ancestors()).toEqual([]);
    });

    it("ancestors returns all ancestors from parent to root", () => {
      const root = new TestNode("root");
      const level1 = new TestNode("level1");
      const level2 = new TestNode("level2");
      const level3 = new TestNode("level3");

      root.add(level1);
      level1.add(level2);
      level2.add(level3);

      const ancestors = level3.ancestors();
      expect(ancestors).toEqual([level2, level1, root]);
    });

    it("descendants returns empty array for leaf", () => {
      const leaf = new TestNode("leaf");
      expect(leaf.descendants()).toEqual([]);
    });

    it("descendants returns all descendants", () => {
      const root = new TestNode("root");
      const a = new TestNode("a");
      const b = new TestNode("b");
      const c = new TestNode("c");
      const d = new TestNode("d");

      root.add(a).add(b);
      a.add(c);
      b.add(d);

      const descendants = root.descendants();
      expect(descendants).toEqual([a, c, b, d]);
    });

    it("pathFromRoot returns path from root to node", () => {
      const root = new TestNode("root");
      const level1 = new TestNode("level1");
      const level2 = new TestNode("level2");

      root.add(level1);
      level1.add(level2);

      const path = level2.pathFromRoot();
      expect(path).toEqual([root, level1, level2]);
    });

    it("pathFromRoot returns single node for root", () => {
      const root = new TestNode("root");
      expect(root.pathFromRoot()).toEqual([root]);
    });
  });

  describe("Relationship Checks", () => {
    it("isAncestorOf returns true for direct parent", () => {
      const parent = new TestNode("parent");
      const child = new TestNode("child");

      parent.add(child);
      expect(parent.isAncestorOf(child)).toBe(true);
    });

    it("isAncestorOf returns true for indirect ancestor", () => {
      const root = new TestNode("root");
      const child = new TestNode("child");
      const grandchild = new TestNode("grandchild");

      root.add(child);
      child.add(grandchild);

      expect(root.isAncestorOf(grandchild)).toBe(true);
    });

    it("isAncestorOf returns false for non-ancestor", () => {
      const root = new TestNode("root");
      const child = new TestNode("child");

      root.add(child);
      expect(child.isAncestorOf(root)).toBe(false);
    });

    it("isDescendantOf returns true for direct child", () => {
      const parent = new TestNode("parent");
      const child = new TestNode("child");

      parent.add(child);
      expect(child.isDescendantOf(parent)).toBe(true);
    });

    it("isDescendantOf returns true for indirect descendant", () => {
      const root = new TestNode("root");
      const child = new TestNode("child");
      const grandchild = new TestNode("grandchild");

      root.add(child);
      child.add(grandchild);

      expect(grandchild.isDescendantOf(root)).toBe(true);
    });

    it("contains returns true for self", () => {
      const node = new TestNode("node");
      expect(node.contains(node)).toBe(true);
    });

    it("contains returns true for descendants", () => {
      const root = new TestNode("root");
      const child = new TestNode("child");
      const grandchild = new TestNode("grandchild");

      root.add(child);
      child.add(grandchild);

      expect(root.contains(root)).toBe(true);
      expect(root.contains(child)).toBe(true);
      expect(root.contains(grandchild)).toBe(true);
    });

    it("contains returns false for ancestors", () => {
      const root = new TestNode("root");
      const child = new TestNode("child");

      root.add(child);
      expect(child.contains(root)).toBe(false);
    });
  });

  describe("Traversal", () => {
    it("traverse visits nodes in depth-first order", () => {
      const root = new TestNode("root");
      const a = new TestNode("a");
      const b = new TestNode("b");
      const c = new TestNode("c");
      const d = new TestNode("d");

      root.add(a).add(b);
      a.add(c);
      b.add(d);

      const visited: string[] = [];
      root.traverse((n) => visited.push(n.name));

      expect(visited).toEqual(["root", "a", "c", "b", "d"]);
    });

    it("traverseBF visits nodes in breadth-first order", () => {
      const root = new TestNode("root");
      const a = new TestNode("a");
      const b = new TestNode("b");
      const c = new TestNode("c");
      const d = new TestNode("d");

      root.add(a).add(b);
      a.add(c);
      b.add(d);

      const visited: string[] = [];
      root.traverseBF((n) => visited.push(n.name));

      expect(visited).toEqual(["root", "a", "b", "c", "d"]);
    });

    it("traverse visits all nodes in subtree", () => {
      const root = new TestNode("root");
      const child1 = new TestNode("child1");
      const child2 = new TestNode("child2");
      const grandchild = new TestNode("grandchild");

      root.add(child1).add(child2);
      child1.add(grandchild);

      let count = 0;
      root.traverse(() => count++);
      expect(count).toBe(4);
    });
  });

  describe("Search", () => {
    it("find returns first matching node", () => {
      const root = new TestNode("root");
      const a = new TestNode("a");
      const b = new TestNode("b");
      const c = new TestNode("c");

      root.add(a).add(b).add(c);

      const found = root.find((n) => n.name === "b");
      expect(found).toBe(b);
    });

    it("find returns null when no match", () => {
      const root = new TestNode("root");
      const child = new TestNode("child");

      root.add(child);
      expect(root.find((n) => n.name === "nonexistent")).toBeNull();
    });

    it("find returns self if matches", () => {
      const root = new TestNode("root");
      expect(root.find((n) => n.name === "root")).toBe(root);
    });

    it("findAll returns all matching nodes", () => {
      const root = new TestNode("root");
      const a1 = new TestNode("a");
      const a2 = new TestNode("a");
      const b = new TestNode("b");

      root.add(a1).add(b).add(a2);

      const all = root.findAll((n) => n.name === "a");
      expect(all).toEqual([a1, a2]);
    });

    it("findAll returns empty array when no matches", () => {
      const root = new TestNode("root");
      const child = new TestNode("child");

      root.add(child);
      expect(root.findAll((n) => n.name === "nonexistent")).toEqual([]);
    });
  });

  describe("Edge Cases", () => {
    it("handles empty tree", () => {
      const root = new TestNode("root");
      expect(root.children).toEqual([]);
      expect(root.isRoot).toBe(true);
      expect(root.isLeaf).toBe(true);
      expect(root.size()).toBe(1);
      expect(root.descendants()).toEqual([]);
    });

    it("handles single child", () => {
      const parent = new TestNode("parent");
      const child = new TestNode("child");

      parent.add(child);
      expect(parent.children).toEqual([child]);
      expect(child.siblings()).toEqual([]);
      expect(child.prevSibling()).toBeNull();
      expect(child.nextSibling()).toBeNull();
    });

    it("handles deep nesting", () => {
      const root = new TestNode("root");
      let current = root;

      for (let i = 0; i < 10; i++) {
        const child = new TestNode(`level${i}`);
        current.add(child);
        current = child;
      }

      expect(root.size()).toBe(11);
      expect(current.depth).toBe(10);
      expect(root.level).toBe(10);
    });

    it("handles wide tree", () => {
      const root = new TestNode("root");

      for (let i = 0; i < 100; i++) {
        root.add(new TestNode(`child${i}`));
      }

      expect(root.children.length).toBe(100);
      expect(root.size()).toBe(101);
      expect(root.level).toBe(1);
    });
  });
});
