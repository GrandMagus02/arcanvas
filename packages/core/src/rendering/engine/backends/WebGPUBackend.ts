import type { IRenderBackend, DrawArgs } from "../IRenderBackend";
import type { Mesh } from "../Mesh";
import type { BaseMaterial } from "../materials";

/**
 *
 */
export class WebGPUBackend implements IRenderBackend {
  constructor() {
    throw new Error("WebGPU backend is not implemented yet");
  }

  beginFrame(_viewportWidth: number, _viewportHeight: number): void {
    throw new Error("WebGPU backend is not implemented yet");
  }

  endFrame(): void {
    throw new Error("WebGPU backend is not implemented yet");
  }

  prepareMesh(_mesh: Mesh): void {
    throw new Error("WebGPU backend is not implemented yet");
  }

  prepareMaterial(_material: BaseMaterial): void {
    throw new Error("WebGPU backend is not implemented yet");
  }

  drawMesh(_args: DrawArgs): void {
    throw new Error("WebGPU backend is not implemented yet");
  }
}
