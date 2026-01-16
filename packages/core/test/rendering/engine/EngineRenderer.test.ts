import { describe, expect, it } from "bun:test";
import { Camera } from "src/camera/Camera";
import type { DrawArgs, IRenderBackend } from "src/rendering/engine/IRenderBackend";
import { Mesh } from "src/rendering/engine/Mesh";
import { Renderer } from "src/rendering/engine/Renderer";
import { UnlitColorMaterial } from "src/rendering/engine/materials";
import { createPositionLayout } from "src/rendering/engine/vertexLayout";
import { RenderObject } from "src/scene/RenderObject";
import { Scene } from "src/scene/Scene";

/**
 *
 */
class MockBackend implements IRenderBackend {
  beginArgs: { width: number; height: number } | null = null;
  preparedMeshes: Mesh[] = [];
  preparedMaterials: UnlitColorMaterial[] = [];
  drawCalls: DrawArgs[] = [];

  beginFrame(viewportWidth: number, viewportHeight: number): void {
    this.beginArgs = { width: viewportWidth, height: viewportHeight };
  }

  endFrame(): void {}

  prepareMesh(mesh: Mesh): void {
    this.preparedMeshes.push(mesh);
  }

  prepareMaterial(material: UnlitColorMaterial): void {
    this.preparedMaterials.push(material);
  }

  drawMesh(args: DrawArgs): void {
    this.drawCalls.push(args);
  }
}

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
describe("Engine Renderer", () => {
  it("tracks mesh version changes", () => {
    const layout = createPositionLayout(3);
    const mesh = new Mesh(new Float32Array([0, 0, 0]), new Uint16Array(0), layout);

    expect(mesh.version).toBe(0);
    mesh.vertices = new Float32Array([1, 0, 0]);
    expect(mesh.version).toBe(1);
    mesh.indices = new Uint16Array([0, 1, 2]);
    expect(mesh.version).toBe(2);
    mesh.layout = createPositionLayout(2);
    expect(mesh.version).toBe(3);
  });

  it("renders scene objects through backend", () => {
    const scene = new Scene({ width: 640, height: 480 });
    const mesh = new Mesh(new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]), new Uint16Array(0), createPositionLayout(3));
    const material = new UnlitColorMaterial({ baseColor: [1, 0, 0, 1] });
    const obj = new RenderObject(mesh, material);
    scene.addObject(obj);

    const backend = new MockBackend();
    const renderer = new Renderer(backend);
    const camera = new Camera();

    renderer.render(scene, camera);

    expect(backend.beginArgs).toEqual({ width: 640, height: 480 });
    expect(backend.preparedMeshes).toEqual([mesh]);
    expect(backend.preparedMaterials).toEqual([material]);
    expect(backend.drawCalls.length).toBe(1);
    expect(backend.drawCalls[0]?.mesh).toBe(mesh);
    expect(backend.drawCalls[0]?.material).toBe(material);
    expect(backend.drawCalls[0]?.modelMatrix.length).toBe(16);
    expect(backend.drawCalls[0]?.viewMatrix.length).toBe(16);
    expect(backend.drawCalls[0]?.projMatrix.length).toBe(16);
  });

  // TODO: add tests for multiple lights and material variants per shading model.
  // TODO: add integration tests for WebGLBackend and Canvas2DBackend output.
});
/* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
