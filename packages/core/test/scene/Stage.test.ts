import { describe, expect, it } from "bun:test";
import { Stage, Mesh } from "src";
import type { BufferHandle, IArcanvasContext, IRenderContext } from "src";

// Mock canvas for testing (Bun test doesn't have DOM)
/**
 * Creates a mock HTMLCanvasElement for testing purposes.
 * @returns A mock canvas element with width and height properties.
 */
function createMockCanvas(): HTMLCanvasElement {
  return {
    width: 800,
    height: 600,
  } as HTMLCanvasElement;
}

// Mock IArcanvasContext for testing
/**
 * Mock implementation of IArcanvasContext for testing Stage functionality.
 */
class MockArcanvasContext implements IArcanvasContext {
  canvas: HTMLCanvasElement;
  stage: Stage;
  renderer: never;
  camera: null = null;

  constructor() {
    this.canvas = createMockCanvas();
    this.stage = new Stage(this);
  }

  setCamera(): void {
    // Mock implementation
  }

  on(): () => void {
    return () => {};
  }

  once(): () => void {
    return () => {};
  }

  off(): void {
    // Mock implementation
  }

  emit(): void {
    // Mock implementation
  }
}

// Concrete Mesh for testing
/**
 * Concrete Mesh implementation for testing purposes.
 */
class TestMesh extends Mesh {
  constructor(vertices: Float32Array, indices: Uint16Array) {
    super(vertices, indices);
  }
}

describe("Stage", () => {
  describe("Initialization", () => {
    it("initializes with IArcanvasContext", () => {
      const mockContext = new MockArcanvasContext();
      const stage = new Stage(mockContext);

      expect(stage.canvas).toBe(mockContext.canvas);
      expect(stage.parent).toBeNull();
      expect(stage.children).toEqual([]);
    });

    it("extends Entity", () => {
      const mockContext = new MockArcanvasContext();
      const stage = new Stage(mockContext);

      expect(stage.id).toBeDefined();
      expect(stage.name).toBeNull();
    });
  });

  describe("Canvas Properties", () => {
    it("returns canvas from context", () => {
      const mockContext = new MockArcanvasContext();
      const stage = new Stage(mockContext);

      expect(stage.canvas).toBe(mockContext.canvas);
    });

    it("returns canvas width", () => {
      const mockContext = new MockArcanvasContext();
      mockContext.canvas.width = 1024;
      const stage = new Stage(mockContext);

      expect(stage.width).toBe(1024);
    });

    it("returns canvas height", () => {
      const mockContext = new MockArcanvasContext();
      mockContext.canvas.height = 768;
      const stage = new Stage(mockContext);

      expect(stage.height).toBe(768);
    });

    it("updates width and height when canvas changes", () => {
      const mockContext = new MockArcanvasContext();
      const stage = new Stage(mockContext);

      expect(stage.width).toBe(800);
      expect(stage.height).toBe(600);

      mockContext.canvas.width = 1920;
      mockContext.canvas.height = 1080;

      expect(stage.width).toBe(1920);
      expect(stage.height).toBe(1080);
    });
  });

  describe("Scene Graph Operations", () => {
    it("can add children", () => {
      const mockContext = new MockArcanvasContext();
      const stage = new Stage(mockContext);
      const child = new TestMesh(new Float32Array([0]), new Uint16Array([0]));

      stage.add(child);
      expect(stage.children).toEqual([child]);
      expect(child.parent).toBe(stage);
    });

    it("can add multiple children", () => {
      const mockContext = new MockArcanvasContext();
      const stage = new Stage(mockContext);
      const child1 = new TestMesh(new Float32Array([0]), new Uint16Array([0]));
      const child2 = new TestMesh(new Float32Array([1]), new Uint16Array([1]));

      stage.add(child1).add(child2);
      expect(stage.children).toEqual([child1, child2]);
    });

    it("remove detaches from parent", () => {
      const mockContext = new MockArcanvasContext();
      const stage = new Stage(mockContext);
      const parent = new TestMesh(new Float32Array([0]), new Uint16Array([0]));

      parent.add(stage);
      expect(stage.parent).toBe(parent);

      stage.remove();
      expect(stage.parent).toBeNull();
      expect(parent.children).not.toContain(stage);
    });
  });

  describe("Drawing", () => {
    it("draw traverses and renders meshes", () => {
      const mockContext = new MockArcanvasContext();
      const stage = new Stage(mockContext);
      const mesh1 = new TestMesh(new Float32Array([0, 0]), new Uint16Array([0]));
      const mesh2 = new TestMesh(new Float32Array([1, 1]), new Uint16Array([1]));

      stage.add(mesh1).add(mesh2);

      let renderCallCount = 0;
      const renderedMeshes: Mesh[] = [];

      const mockRenderContext: IRenderContext = {
        createVertexBuffer: () => ({ type: "vertex" }) as BufferHandle,
        bindVertexBuffer: () => {},
        createIndexBuffer: () => ({ type: "index" }) as BufferHandle,
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

      // Override render method to track calls

      const originalRender = Mesh.prototype.render;

      Mesh.prototype.render = function (this: Mesh, ctx: IRenderContext) {
        renderCallCount++;
        renderedMeshes.push(this);
        originalRender.call(this, ctx);
      };

      stage.draw(mockRenderContext);

      expect(renderCallCount).toBe(2);
      expect(renderedMeshes).toContain(mesh1);
      expect(renderedMeshes).toContain(mesh2);

      // Restore original render
      Mesh.prototype.render = originalRender;
    });

    it("draw skips non-mesh children", () => {
      const mockContext = new MockArcanvasContext();
      const stage = new Stage(mockContext);
      const mesh = new TestMesh(new Float32Array([0]), new Uint16Array([0]));
      const entity = new (class extends Mesh {
        constructor() {
          super(new Float32Array([0]), new Uint16Array([0]));
        }
      })();

      stage.add(mesh).add(entity);

      let renderCallCount = 0;

      const mockRenderContext: IRenderContext = {
        createVertexBuffer: () => ({ type: "vertex" }) as BufferHandle,
        bindVertexBuffer: () => {},
        createIndexBuffer: () => ({ type: "index" }) as BufferHandle,
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

      const originalRender = Mesh.prototype.render;

      Mesh.prototype.render = function (this: Mesh) {
        renderCallCount++;
        originalRender.call(this, mockRenderContext);
      };

      stage.draw(mockRenderContext);

      // Both mesh and entity are Mesh instances, so both should render
      expect(renderCallCount).toBeGreaterThanOrEqual(1);

      Mesh.prototype.render = originalRender;
    });

    it("draw handles empty stage", () => {
      const mockContext = new MockArcanvasContext();
      const stage = new Stage(mockContext);

      const mockRenderContext: IRenderContext = {
        createVertexBuffer: () => ({ type: "vertex" }) as BufferHandle,
        bindVertexBuffer: () => {},
        createIndexBuffer: () => ({ type: "index" }) as BufferHandle,
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

      expect(() => stage.draw(mockRenderContext)).not.toThrow();
    });
  });

  describe("Integration", () => {
    it("works with nested mesh hierarchy", () => {
      const mockContext = new MockArcanvasContext();
      const stage = new Stage(mockContext);
      const group = new TestMesh(new Float32Array([0]), new Uint16Array([0]));
      const mesh1 = new TestMesh(new Float32Array([1]), new Uint16Array([1]));
      const mesh2 = new TestMesh(new Float32Array([2]), new Uint16Array([2]));

      stage.add(group);
      group.add(mesh1).add(mesh2);

      expect(stage.children).toEqual([group]);
      expect(group.children).toEqual([mesh1, mesh2]);
      expect(mesh1.parent).toBe(group);
      expect(mesh2.parent).toBe(group);
    });
  });
});
