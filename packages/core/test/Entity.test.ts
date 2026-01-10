import { Entity, EntityCycleError, EntitySelfAttachmentError } from "@arcanvas/core";
import { describe, expect, it } from "bun:test";

describe("Entity", () => {
  it("initializes properly with defaults and custom values", () => {
    const n = new Entity();
    expect(n.id).toBeDefined();
    expect(typeof n.id).toBe("string");
    expect(n.name).toBeNull();
    expect(n.parent).toBeNull();
    expect(n.children).toEqual([]);

    const n2 = new Entity("foo", "custom-id");
    expect(n2.name).toBe("foo");
    expect(n2.id).toBe("custom-id");
  });

  it("adds children and updates parent relationships", () => {
    const parent = new Entity("parent");
    const child1 = new Entity("child1");
    const child2 = new Entity("child2");

    const ret = parent.add(child1);
    expect(ret).toBe(parent);
    expect(parent.children).toEqual([child1]);
    expect(child1.parent).toBe(parent);

    parent.add(child2);
    expect(parent.children).toEqual([child1, child2]);
    expect(child2.parent).toBe(parent);
  });

  it("reparents children when added to a new parent", () => {
    const p1 = new Entity("p1");
    const p2 = new Entity("p2");
    const child = new Entity("child");

    p1.add(child);
    expect(child.parent).toBe(p1);
    expect(p1.children).toEqual([child]);

    p2.add(child);
    expect(child.parent).toBe(p2);
    expect(p1.children).toEqual([]);
    expect(p2.children).toEqual([child]);
  });

  it("throws when attempting to add an entity to itself", () => {
    const n = new Entity("self");
    expect(() => n.add(n)).toThrow(EntitySelfAttachmentError);
  });

  it("prevents creating cycles when adding an ancestor as a child", () => {
    const root = new Entity("root");
    const child = new Entity("child");

    root.add(child);
    // child already has root as ancestor; now try to attach root under child
    expect(() => child.add(root)).toThrow(EntityCycleError);
  });

  it("adds children at specific indices using addAt", () => {
    const parent = new Entity("parent");
    const a = new Entity("a");
    const b = new Entity("b");
    const c = new Entity("c");

    parent.add(a);
    parent.add(c);
    // insert b at index 1
    parent.addAt(b, 1);
    expect(parent.children.map((n) => n.name)).toEqual(["a", "b", "c"]);
    expect(b.parent).toBe(parent);

    // index less than 0 clamps to 0
    const d = new Entity("d");
    parent.addAt(d, -10);
    expect(parent.children[0]).toBe(d);

    // index greater than length clamps to end
    const e = new Entity("e");
    parent.addAt(e, 999);
    expect(parent.children[parent.children.length - 1]).toBe(e);
  });

  it("removes entity from its parent using remove", () => {
    const parent = new Entity("parent");
    const child = new Entity("child");
    parent.add(child);

    child.remove();
    expect(child.parent).toBeNull();
    expect(parent.children).toEqual([]);

    // removing a root entity should be a no-op
    const root = new Entity("root");
    root.remove();
    expect(root.parent).toBeNull();
  });

  it("removes a specific child using removeChild", () => {
    const parent = new Entity("parent");
    const a = new Entity("a");
    const b = new Entity("b");
    const c = new Entity("c");
    parent.add(a).add(b).add(c);

    parent.removeChild(b);
    expect(parent.children).toEqual([a, c]);
    expect(b.parent).toBeNull();

    // removing non-child is a no-op
    const other = new Entity("other");
    parent.removeChild(other);
    expect(parent.children).toEqual([a, c]);
  });

  it("removes all children using removeChildren", () => {
    const parent = new Entity("parent");
    const a = new Entity("a");
    const b = new Entity("b");
    parent.add(a).add(b);

    parent.removeChildren();
    expect(parent.children).toEqual([]);
    expect(a.parent).toBeNull();
    expect(b.parent).toBeNull();
  });

  it("replaces children using replaceChild and replaceWith", () => {
    const parent = new Entity("parent");
    const a = new Entity("a");
    const b = new Entity("b");
    const c = new Entity("c");

    parent.add(a).add(b);

    // no-op when oldChild === newChild
    parent.replaceChild(a, a);
    expect(parent.children.map((n) => n.name)).toEqual(["a", "b"]);

    // no-op when oldChild not found
    parent.replaceChild(c, a);
    expect(parent.children.map((n) => n.name)).toEqual(["a", "b"]);

    // replace b with c
    parent.replaceChild(b, c);
    expect(parent.children.map((n) => n.name)).toEqual(["a", "c"]);
    expect(b.parent).toBeNull();
    expect(c.parent).toBe(parent);

    // replaceWith on child
    const d = new Entity("d");
    a.replaceWith(d);
    expect(parent.children.map((n) => n.name)).toEqual(["d", "c"]);
    expect(d.parent).toBe(parent);
    expect(a.parent).toBeNull();

    // replaceWith on root (no parent) is a no-op
    const root = new Entity("root");
    const other = new Entity("other");
    root.replaceWith(other);
    expect(root.parent).toBeNull();
    expect(other.parent).toBeNull();
  });

  it("moves entities between parents using moveTo", () => {
    const p1 = new Entity("p1");
    const p2 = new Entity("p2");
    const a = new Entity("a");
    const b = new Entity("b");
    const c = new Entity("c");

    p1.add(a).add(b).add(c);

    // no-op when moving to same parent with undefined index
    a.moveTo(p1);
    expect(p1.children.map((n) => n.name)).toEqual(["a", "b", "c"]);

    // move b to p2 at default index (append)
    b.moveTo(p2);
    expect(p1.children.map((n) => n.name)).toEqual(["a", "c"]);
    expect(p2.children.map((n) => n.name)).toEqual(["b"]);
    expect(b.parent).toBe(p2);

    // move c to p2 at index 0
    c.moveTo(p2, 0);
    expect(p1.children.map((n) => n.name)).toEqual(["a"]);
    expect(p2.children.map((n) => n.name)).toEqual(["c", "b"]);
  });

  it("throws when moveTo would create a cycle", () => {
    const root = new Entity("root");
    const child = new Entity("child");
    root.add(child);

    // moving root under child would create a cycle
    expect(() => root.moveTo(child)).toThrow(EntityCycleError);
  });

  it("computes isRoot, isLeaf, root, depth, height, size, index and sibling helpers", () => {
    const root = new Entity("root");
    const child1 = new Entity("child1");
    const child2 = new Entity("child2");
    const grandchild = new Entity("grandchild");

    root.add(child1).add(child2);
    child1.add(grandchild);

    expect(root.isRoot).toBe(true);
    expect(child1.isRoot).toBe(false);
    expect(grandchild.root).toBe(root);

    expect(root.depth).toBe(0);
    expect(child1.depth).toBe(1);
    expect(grandchild.depth).toBe(2);

    expect(root.height).toBe(2);
    expect(child1.height).toBe(1);
    expect(child2.height).toBe(0);

    expect(root.size()).toBe(4);
    expect(child1.size()).toBe(2);
    expect(child2.size()).toBe(1);

    expect(root.index()).toBe(-1);
    expect(child1.index()).toBe(0);
    expect(child2.index()).toBe(1);

    expect(root.siblings()).toEqual([]);
    expect(child1.siblings()).toEqual([child2]);
    expect(child2.siblings()).toEqual([child1]);

    expect(child1.prevSibling()).toBeNull();
    expect(child1.nextSibling()).toBe(child2);
    expect(child2.prevSibling()).toBe(child1);
    expect(child2.nextSibling()).toBeNull();

    expect(root.isLeaf).toBe(false);
    expect(child1.isLeaf).toBe(false);
    expect(child2.isLeaf).toBe(true);
    expect(grandchild.isLeaf).toBe(true);

    const lone = new Entity("lone");
    expect(lone.prevSibling()).toBeNull();
    expect(lone.nextSibling()).toBeNull();
  });

  it("computes ancestors, descendants and pathFromRoot", () => {
    const root = new Entity("root");
    const a = new Entity("a");
    const b = new Entity("b");
    const c = new Entity("c");
    const d = new Entity("d");

    root.add(a);
    a.add(b);
    b.add(c);
    a.add(d);

    expect(c.ancestors().map((n) => n.name)).toEqual(["b", "a", "root"]);
    expect(a.ancestors().map((n) => n.name)).toEqual(["root"]);

    expect(root.descendants().map((n) => n.name)).toEqual(["a", "b", "c", "d"]);
    expect(a.descendants().map((n) => n.name)).toEqual(["b", "c", "d"]);

    expect(c.pathFromRoot().map((n) => n.name)).toEqual(["root", "a", "b", "c"]);
    expect(root.pathFromRoot().map((n) => n.name)).toEqual(["root"]);
  });

  it("checks ancestor/descendant relationships and containment", () => {
    const root = new Entity("root");
    const a = new Entity("a");
    const b = new Entity("b");

    root.add(a);
    a.add(b);

    expect(root.isAncestorOf(a)).toBe(true);
    expect(root.isAncestorOf(b)).toBe(true);
    expect(a.isAncestorOf(b)).toBe(true);
    expect(a.isAncestorOf(root)).toBe(false);

    expect(b.isDescendantOf(a)).toBe(true);
    expect(b.isDescendantOf(root)).toBe(true);
    expect(root.isDescendantOf(b)).toBe(false);

    expect(root.contains(root)).toBe(true);
    expect(root.contains(a)).toBe(true);
    expect(root.contains(b)).toBe(true);
    expect(a.contains(root)).toBe(false);
  });

  it("traverses depth-first and breadth-first", () => {
    const root = new Entity("root");
    const a = new Entity("a");
    const b = new Entity("b");
    const c = new Entity("c");
    const d = new Entity("d");

    root.add(a).add(b);
    a.add(c);
    b.add(d);

    const dfs: string[] = [];
    root.traverse((n) => dfs.push(n.name ?? "root"));
    expect(dfs).toEqual(["root", "a", "c", "b", "d"]);

    const bfs: string[] = [];
    root.traverseBF((n) => bfs.push(n.name ?? "root"));
    expect(bfs).toEqual(["root", "a", "b", "c", "d"]);
  });

  it("finds entities using find, findAll, findById and findByName", () => {
    const root = new Entity("root");
    const a1 = new Entity("a");
    const a2 = new Entity("a");
    const b = new Entity("b");

    root.add(a1).add(b);
    a1.add(a2);

    const foundA = root.find((n) => n.name === "a");
    expect(foundA).toBe(a1);

    const allA = root.findAll((n) => n.name === "a");
    expect(allA).toEqual([a1, a2]);

    const targetId = b.id;
    expect(root.findById(targetId)).toBe(b);
    expect(root.findById("non-existent")).toBeNull();

    expect(root.findByName("a")).toEqual([a1, a2]);
    expect(root.findByName("missing")).toEqual([]);
  });

  it("serializes to JSON and deserializes from JSON", () => {
    const root = new Entity("root");
    const a = new Entity("a");
    const b = new Entity("b");
    root.add(a).add(b);

    const json = root.toJSON();
    expect(json.id).toBe(root.id);
    expect(json.name).toBe("root");
    expect(json.parent).toBeUndefined();
    expect(json.children?.length).toBe(2);
    expect(json.children?.map((c) => c.name)).toEqual(["a", "b"]);

    const roundTripped = Entity.fromJSON(json);
    expect(roundTripped.name).toBe("root");
    expect(roundTripped.children.length).toBe(2);
    expect(roundTripped.children.map((c) => c.name)).toEqual(["a", "b"]);
    const firstChild = roundTripped.children[0]!;
    expect(firstChild.parent).toBe(roundTripped);
  });

  it("clones entities (shallow and deep)", () => {
    const root = new Entity("root");
    const child = new Entity("child");
    root.add(child);

    const shallow = root.clone(false);
    expect(shallow).not.toBe(root);
    expect(shallow.name).toBe(root.name);
    expect(shallow.id).not.toBe(root.id);
    expect(shallow.children).toEqual([]);
    expect(shallow.parent).toBeNull();

    const deep = root.clone(true);
    expect(deep).not.toBe(root);
    expect(deep.children.length).toBe(1);
    const deepChild = deep.children[0]!;
    expect(deepChild.name).toBe("child");
    expect(deepChild).not.toBe(child);
    expect(deepChild.parent).toBe(deep);

    const deep2 = root.deepClone();
    expect(deep2.children.length).toBe(1);
    const deep2Child = deep2.children[0]!;
    expect(deep2Child.name).toBe("child");
  });
});
