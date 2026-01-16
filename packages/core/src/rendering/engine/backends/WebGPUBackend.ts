import type { DrawArgs, IRenderBackend } from "../IRenderBackend";
import type { Mesh } from "../Mesh";
import type { BaseMaterial } from "../materials";

/**
 * WebGPU rendering backend implementation (stub).
 * Not yet implemented - throws errors on all operations.
 */
export class WebGPUBackend implements IRenderBackend {
  constructor() {
    throw new Error("WebGPU backend is not implemented yet");
  }

  beginFrame(_viewportWidth: number, _viewportHeight: number): void {
    void _viewportWidth;
    void _viewportHeight;
    throw new Error("WebGPU backend is not implemented yet");
  }

  endFrame(): void {
    throw new Error("WebGPU backend is not implemented yet");
  }

  prepareMesh(_mesh: Mesh): void {
    void _mesh;
    throw new Error("WebGPU backend is not implemented yet");
  }

  prepareMaterial(_material: BaseMaterial): void {
    void _material;
    throw new Error("WebGPU backend is not implemented yet");
  }

  drawMesh(_args: DrawArgs): void {
    void _args;
    throw new Error("WebGPU backend is not implemented yet");
  }
}
