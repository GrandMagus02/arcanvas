import { Entity } from "@arcanvas/scene";
import type { Document, BaseLayer, RasterLayer } from "@arcanvas/document";
import { GroupLayer } from "@arcanvas/document";
import { LayerNode } from "./LayerNode";
import { LayerRenderCache } from "../rendering/LayerRenderCache";
import type { IRenderContext } from "@arcanvas/core";

/**
 * Root view for document rendering (bridges Document to Scene).
 * Manages layer nodes and syncs them with document layers.
 */
export class DocumentView extends Entity {
  document: Document;
  layerNodes: Map<string, LayerNode>;
  renderCache: LayerRenderCache;

  constructor(document: Document) {
    super("DocumentView");
    this.document = document;
    this.layerNodes = new Map();
    this.renderCache = new LayerRenderCache();

    // Listen to document events
    this.document.on("layerChanged", (layerId: string) => {
      const node = this.layerNodes.get(layerId);
      if (node) {
        node.syncFromLayer(this.document);
        this.renderCache.invalidate(this.document.getLayerById(layerId)!);
      }
    });

    this.document.on("structureChanged", () => {
      this.syncLayers();
    });

    // Initial sync
    this.syncLayers();
  }

  /**
   * Syncs layer nodes with document layers.
   */
  syncLayers(): void {
    // Note: existingIds tracking removed as it's not currently used
    const documentLayers = this.collectLayers(this.document.root);

    // Remove nodes for layers that no longer exist
    for (const [id, node] of this.layerNodes.entries()) {
      if (!documentLayers.has(id)) {
        this.removeChild(node);
        this.layerNodes.delete(id);
        this.renderCache.invalidate({ id } as BaseLayer);
      }
    }

    // Add nodes for new layers
    for (const layer of documentLayers.values()) {
      if (!this.layerNodes.has(layer.id)) {
        const node = new LayerNode(layer.id, this.document, this.document.width, this.document.height);
        this.add(node);
        this.layerNodes.set(layer.id, node);
      }
    }

    // Update layer order to match document
    this.updateLayerOrder();
  }

  /**
   * Collect all layers from the document tree.
   */
  private collectLayers(layer: BaseLayer): Map<string, BaseLayer> {
    const layers = new Map<string, BaseLayer>();
    const collect = (l: BaseLayer): void => {
      layers.set(l.id, l);
      if (l instanceof GroupLayer) {
        for (const child of l.children) {
          collect(child);
        }
      }
    };
    collect(layer);
    return layers;
  }

  /**
   * Update layer node order to match document layer order.
   */
  private updateLayerOrder(): void {
    const orderedLayers: BaseLayer[] = [];
    const collect = (layer: BaseLayer): void => {
      if (layer instanceof GroupLayer) {
        for (const child of layer.children) {
          collect(child);
        }
      } else {
        orderedLayers.push(layer);
      }
    };
    collect(this.document.root);

    // Reorder children to match document order
    for (let i = 0; i < orderedLayers.length; i++) {
      const layer = orderedLayers[i];
      const node = this.layerNodes.get(layer.id);
      if (node && this.children.indexOf(node) !== i) {
        this.removeChild(node);
        this.addAt(node, i);
      }
    }
  }

  /**
   * Handles document events and updates rendering.
   */
  onDocumentChanged(): void {
    this.syncLayers();
  }

  /**
   * Get the render cache.
   */
  getRenderCache(): LayerRenderCache {
    return this.renderCache;
  }

  /**
   * Update textures for all dirty layers.
   * Should be called before rendering each frame.
   */
  updateTextures(renderContext: IRenderContext): void {
    const layers = this.collectLayers(this.document.root);
    for (const layer of layers.values()) {
      if (layer.kind() === "raster") {
        const rasterLayer = layer as RasterLayer;
        if (rasterLayer.isDirty() || this.renderCache.isDirty(rasterLayer)) {
          const textureHandle = this.renderCache.updateLayerTexture(rasterLayer, renderContext);
          if (textureHandle) {
            const layerNode = this.layerNodes.get(layer.id);
            if (layerNode) {
              const textureRef = this.renderCache.getTextureRef(layer);
              if (textureRef) {
                layerNode.material.setTexture(textureRef);
              }
            }
          }
        }
      }
    }
  }
}
