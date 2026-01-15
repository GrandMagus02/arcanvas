import { describe, expect, it } from "bun:test";
import type { BufferHandle, IRenderContext } from "src/rendering/context";
import { Mesh } from "src/scene/Mesh";

// Concrete Mesh implementation for testing
/**
 *
 */
class TestMesh extends Mesh {
  constructor(vertices: Float32Array, indices: Uint16Array) {
    super(vertices, indices);
  }
}

describe("Mesh", () => {
  describe("Initialization", () => {
    it("initializes with vertices and indices", () => {
      const vertices = new Float32Array([0, 0, 1, 1, 0, 0]);
      const indices = new Uint16Array([0, 1, 2]);
      const mesh = new TestMesh(vertices, indices);

      expect(mesh.vertices).toBe(vertices);
      expect(mesh.indices).toBe(indices);
    });

    it("extends Entity", () => {
      const vertices = new Float32Array([0, 0]);
      const indices = new Uint16Array([0]);
      const mesh = new TestMesh(vertices, indices);

      expect(mesh.id).toBeDefined();
      expect(mesh.parent).toBeNull();
      expect(mesh.children).toEqual([]);
    });
  });

  describe("Vertex and Index Management", () => {
    it("gets and sets vertices", () => {
      const vertices1 = new Float32Array([0, 0, 1, 1]);
      const vertices2 = new Float32Array([2, 2, 3, 3]);
      const indices = new Uint16Array([0, 1]);
      const mesh = new TestMesh(vertices1, indices);

      expect(mesh.vertices).toBe(vertices1);
      mesh.vertices = vertices2;
      expect(mesh.vertices).toBe(vertices2);
    });

    it("gets and sets indices", () => {
      const vertices = new Float32Array([0, 0]);
      const indices1 = new Uint16Array([0, 1]);
      const indices2 = new Uint16Array([2, 3]);
      const mesh = new TestMesh(vertices, indices1);

      expect(mesh.indices).toBe(indices1);
      mesh.indices = indices2;
      expect(mesh.indices).toBe(indices2);
    });

    it("marks buffers as dirty when vertices are updated", () => {
      const vertices = new Float32Array([0, 0]);
      const indices = new Uint16Array([0]);
      const mesh = new TestMesh(vertices, indices);

      // Access protected property via type assertion for testing
      const meshAny = mesh as unknown as { _vertexBuffer: unknown };
      expect(meshAny._vertexBuffer).toBeNull();

      // After setting vertices, buffer should be marked dirty (null)
      mesh.vertices = new Float32Array([1, 1]);
      expect(meshAny._vertexBuffer).toBeNull();
    });

    it("marks buffers as dirty when indices are updated", () => {
      const vertices = new Float32Array([0, 0]);
      const indices = new Uint16Array([0]);
      const mesh = new TestMesh(vertices, indices);

      const meshAny = mesh as unknown as { _indexBuffer: unknown };
      expect(meshAny._indexBuffer).toBeNull();

      mesh.indices = new Uint16Array([1]);
      expect(meshAny._indexBuffer).toBeNull();
    });
  });

  describe("Rendering", () => {
    it("creates vertex buffer on first render", () => {
      const vertices = new Float32Array([0, 0, 1, 1, 0, 0]);
      const indices = new Uint16Array([0, 1, 2]);
      const mesh = new TestMesh(vertices, indices);

      const mockContext: IRenderContext = {
        createVertexBuffer: (data: Float32Array) => {
          expect(data).toBe(vertices);
          return { type: "vertex" } as BufferHandle;
        },
        bindVertexBuffer: () => {},
        createIndexBuffer: (data: Uint16Array) => {
          expect(data).toBe(indices);
          return { type: "index" } as BufferHandle;
        },
        bindIndexBuffer: () => {},
        vertexAttribPointer: () => {},
        enableVertexAttribArray: () => {},
        disableVertexAttribArray: () => {},
        useProgram: () => {},
        drawIndexed: () => {},
        drawArrays: () => {},
        uniform1f: () => {},
        uniform2f: () => {},
        uniform3f: () => {},
        uniform4f: () => {},
        uniform1i: () => {},
        uniformMatrix4fv: () => {},
        clearColor: () => {},
        colorMask: () => {},
        clear: () => {},
        getWebGLContext: () => null,
      };

      mesh.render(mockContext);

      const meshAny = mesh as unknown as { _vertexBuffer: unknown; _indexBuffer: unknown };
      expect(meshAny._vertexBuffer).not.toBeNull();
      expect(meshAny._indexBuffer).not.toBeNull();
    });

    it("binds existing buffers on subsequent renders", () => {
      const vertices = new Float32Array([0, 0]);
      const indices = new Uint16Array([0]);
      const mesh = new TestMesh(vertices, indices);

      let bindVertexCalled = false;
      let bindIndexCalled = false;
      let createVertexCalled = false;
      let createIndexCalled = false;

      const mockContext: IRenderContext = {
        createVertexBuffer: () => {
          createVertexCalled = true;
          return { type: "vertex" } as BufferHandle;
        },
        bindVertexBuffer: () => {
          bindVertexCalled = true;
        },
        createIndexBuffer: () => {
          createIndexCalled = true;
          return { type: "index" } as BufferHandle;
        },
        bindIndexBuffer: () => {
          bindIndexCalled = true;
        },
        vertexAttribPointer: () => {},
        enableVertexAttribArray: () => {},
        disableVertexAttribArray: () => {},
        useProgram: () => {},
        drawIndexed: () => {},
        drawArrays: () => {},
        uniform1f: () => {},
        uniform2f: () => {},
        uniform3f: () => {},
        uniform4f: () => {},
        uniform1i: () => {},
        uniformMatrix4fv: () => {},
        clearColor: () => {},
        colorMask: () => {},
        clear: () => {},
        getWebGLContext: () => null,
      };

      // First render - creates buffers
      mesh.render(mockContext);
      expect(createVertexCalled).toBe(true);
      expect(createIndexCalled).toBe(true);

      // Reset flags
      createVertexCalled = false;
      createIndexCalled = false;

      // Second render - binds existing buffers
      mesh.render(mockContext);
      expect(bindVertexCalled).toBe(true);
      expect(bindIndexCalled).toBe(true);
      expect(createVertexCalled).toBe(false);
      expect(createIndexCalled).toBe(false);
    });

    it("recreates buffers after vertices update", () => {
      const vertices = new Float32Array([0, 0]);
      const indices = new Uint16Array([0]);
      const mesh = new TestMesh(vertices, indices);

      let createVertexCallCount = 0;

      const mockContext: IRenderContext = {
        createVertexBuffer: () => {
          createVertexCallCount++;
          return { type: "vertex" } as BufferHandle;
        },
        bindVertexBuffer: () => {},
        createIndexBuffer: () => {
          return { type: "index" } as BufferHandle;
        },
        bindIndexBuffer: () => {},
        vertexAttribPointer: () => {},
        enableVertexAttribArray: () => {},
        disableVertexAttribArray: () => {},
        useProgram: () => {},
        drawIndexed: () => {},
        drawArrays: () => {},
        uniform1f: () => {},
        uniform2f: () => {},
        uniform3f: () => {},
        uniform4f: () => {},
        uniform1i: () => {},
        uniformMatrix4fv: () => {},
        clearColor: () => {},
        colorMask: () => {},
        clear: () => {},
        getWebGLContext: () => null,
      };

      mesh.render(mockContext);
      expect(createVertexCallCount).toBe(1);

      mesh.vertices = new Float32Array([1, 1]);
      mesh.render(mockContext);
      expect(createVertexCallCount).toBe(2);
    });

    it("recreates buffers after indices update", () => {
      const vertices = new Float32Array([0, 0]);
      const indices = new Uint16Array([0]);
      const mesh = new TestMesh(vertices, indices);

      let createIndexCallCount = 0;

      const mockContext: IRenderContext = {
        createVertexBuffer: () => {
          return { type: "vertex" } as BufferHandle;
        },
        bindVertexBuffer: () => {},
        createIndexBuffer: () => {
          createIndexCallCount++;
          return { type: "index" } as BufferHandle;
        },
        bindIndexBuffer: () => {},
        vertexAttribPointer: () => {},
        enableVertexAttribArray: () => {},
        disableVertexAttribArray: () => {},
        useProgram: () => {},
        drawIndexed: () => {},
        drawArrays: () => {},
        uniform1f: () => {},
        uniform2f: () => {},
        uniform3f: () => {},
        uniform4f: () => {},
        uniform1i: () => {},
        uniformMatrix4fv: () => {},
        clearColor: () => {},
        colorMask: () => {},
        clear: () => {},
        getWebGLContext: () => null,
      };

      mesh.render(mockContext);
      expect(createIndexCallCount).toBe(1);

      mesh.indices = new Uint16Array([1]);
      mesh.render(mockContext);
      expect(createIndexCallCount).toBe(2);
    });
  });

  describe("Inheritance from Entity", () => {
    it("can be added to scene graph", () => {
      const parent = new TestMesh(new Float32Array([0]), new Uint16Array([0]));
      const child = new TestMesh(new Float32Array([1]), new Uint16Array([1]));

      parent.add(child);
      expect(parent.children).toEqual([child]);
      expect(child.parent).toBe(parent);
    });

    it("maintains Entity properties", () => {
      const mesh = new TestMesh(new Float32Array([0]), new Uint16Array([0]));
      mesh.name = "test-mesh";

      expect(mesh.id).toBeDefined();
      expect(mesh.name).toBe("test-mesh");
    });
  });
});
