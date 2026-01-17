import { describe, expect, it } from "bun:test";
import { Entity } from "../../src/scene/Entity";

describe("Entity", () => {
  describe("Initialization", () => {
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
  });

  describe("ID Management", () => {
    it("generates unique IDs for each entity", () => {
      const e1 = new Entity();
      const e2 = new Entity();
      const e3 = new Entity();
      expect(e1.id).not.toBe(e2.id);
      expect(e2.id).not.toBe(e3.id);
      expect(e1.id).not.toBe(e3.id);
    });
  });

  describe("Name Handling", () => {
    it("handles null and empty string names", () => {
      const e1 = new Entity(null);
      const e2 = new Entity("");
      expect(e1.name).toBeNull();
      expect(e2.name).toBe("");
    });
  });

  describe("Search", () => {
    it("finds nodes by ID using findById", () => {
      const root = new Entity("root");
      const a1 = new Entity("a");
      const a2 = new Entity("a");
      const b = new Entity("b");

      root.add(a1).add(b);
      a1.add(a2);

      const targetId = b.id;
      expect(root.findById(targetId)).toBe(b);
      expect(root.findById("non-existent")).toBeNull();
      expect(root.findById("")).toBeNull();
    });

    it("findById searches nested hierarchies correctly", () => {
      const root = new Entity("root");
      const level1 = new Entity("level1");
      const level2a = new Entity("level2a");
      const level2b = new Entity("level2b");
      const level3 = new Entity("level3");

      root.add(level1);
      level1.add(level2a).add(level2b);
      level2a.add(level3);

      expect(root.findById(level3.id)).toBe(level3);
      expect(root.findById(level2b.id)).toBe(level2b);
      expect(level1.findById(level3.id)).toBe(level3);
      expect(level2a.findById(level3.id)).toBe(level3);
      expect(level3.findById(level3.id)).toBe(level3);
      expect(level3.findById(root.id)).toBeNull();
    });

    it("finds nodes by name using findByName", () => {
      const root = new Entity("root");
      const a1 = new Entity("a");
      const a2 = new Entity("a");
      const b = new Entity("b");

      root.add(a1).add(b);
      a1.add(a2);

      expect(root.findByName("a")).toEqual([a1, a2]);
      expect(root.findByName("missing")).toEqual([]);
      expect(root.findByName("")).toEqual([]);
    });

    it("findByName handles null names correctly", () => {
      const root = new Entity("root");
      const named1 = new Entity("test");
      const named2 = new Entity("test");
      const unnamed1 = new Entity(null);
      const unnamed2 = new Entity(null);

      root.add(named1).add(named2).add(unnamed1).add(unnamed2);

      expect(root.findByName("test")).toEqual([named1, named2]);
      // findByName with null will find entities where name === null
      expect(root.findByName(null as unknown as string)).toEqual([unnamed1, unnamed2]);
    });
  });

  describe("JSON Serialization", () => {
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

    it("toJSON handles null names correctly", () => {
      const root = new Entity(null);
      const child = new Entity("child");
      root.add(child);

      const json = root.toJSON();
      expect(json.name).toBeUndefined();
      expect(json.children?.[0]?.name).toBe("child");
    });

    it("fromJSON reconstructs complex hierarchies", () => {
      const json = {
        id: "root-id",
        name: "root",
        children: [
          {
            id: "child1-id",
            name: "child1",
            children: [
              { id: "grandchild1-id", name: "grandchild1" },
              { id: "grandchild2-id", name: "grandchild2" },
            ],
          },
          {
            id: "child2-id",
            name: "child2",
          },
        ],
      };

      const entity = Entity.fromJSON(json);
      expect(entity.id).toBe("root-id");
      expect(entity.name).toBe("root");
      expect(entity.children.length).toBe(2);
      expect(entity.children[0]!.name).toBe("child1");
      expect(entity.children[0]!.children.length).toBe(2);
      expect(entity.children[1]!.name).toBe("child2");
      expect(entity.children[1]!.children.length).toBe(0);
    });

    it("fromJSON handles empty children array", () => {
      const json = {
        id: "root-id",
        name: "root",
        children: [],
      };

      const entity = Entity.fromJSON(json);
      expect(entity.children).toEqual([]);
    });

    it("fromJSON handles missing children property", () => {
      const json = {
        id: "root-id",
        name: "root",
      };

      const entity = Entity.fromJSON(json);
      expect(entity.children).toEqual([]);
    });
  });

  describe("Cloning", () => {
    it("clones nodes (shallow and deep)", () => {
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
      expect(deepChild.id).not.toBe(child.id);

      const deep2 = root.deepClone();
      expect(deep2.children.length).toBe(1);
      const deep2Child = deep2.children[0]!;
      expect(deep2Child.name).toBe("child");
    });

    it("clone creates independent copies", () => {
      const root = new Entity("root");
      const child1 = new Entity("child1");
      const child2 = new Entity("child2");
      root.add(child1).add(child2);

      const cloned = root.deepClone();
      expect(cloned.id).not.toBe(root.id);
      expect(cloned.children[0]!.id).not.toBe(child1.id);
      expect(cloned.children[1]!.id).not.toBe(child2.id);

      // Modifying clone should not affect original
      cloned.name = "cloned-root";
      cloned.children[0]!.name = "cloned-child1";
      expect(root.name).toBe("root");
      expect(child1.name).toBe("child1");
    });

    it("createCloneInstance creates entity with same name but new ID", () => {
      const original = new Entity("test", "original-id");
      const clone = original.clone(false);
      expect(clone.name).toBe("test");
      expect(clone.id).not.toBe("original-id");
      expect(clone.id).toBeDefined();
    });
  });
});
