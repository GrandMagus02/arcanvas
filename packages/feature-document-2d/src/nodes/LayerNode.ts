import type { Document } from "@arcanvas/document";
import { Mesh } from "@arcanvas/graphics";
import { Entity, Transform3D } from "@arcanvas/scene";
import { LayerMaterial } from "../materials/LayerMaterial";
import { createQuadMesh } from "../utils/QuadMesh";

/**
 * Scene node that represents a document layer.
 * Bridges a document layer to the scene graph for rendering.
 */
export class LayerNode extends Entity {
  layerId: string;
  mesh: Mesh;
  material: LayerMaterial;
  transform: Transform3D;

  constructor(layerId: string, document: Document, width: number, height: number) {
    super(`LayerNode-${layerId}`);
    this.layerId = layerId;
    this.mesh = createQuadMesh(width, height);
    this.material = new LayerMaterial({});
    this.transform = new Transform3D();
    this.syncFromLayer(document);
  }

  /**
   * Updates material when layer properties change.
   */
  syncFromLayer(document: Document): void {
    const layer = document.getLayerById(this.layerId);
    if (!layer) return;

    this.material.setOpacity(layer.opacity);
    this.material.setBlendMode(layer.blendMode);
    // Texture will be updated by LayerRenderCache
  }
}
