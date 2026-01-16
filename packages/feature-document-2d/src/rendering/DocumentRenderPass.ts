import { RenderPass, type PassContext } from "@arcanvas/core";
import type { Document, BaseLayer, RasterLayer } from "@arcanvas/document";
import { GroupLayer } from "@arcanvas/document";
import { DocumentView } from "../nodes/DocumentView";
import { LayerRenderCache } from "./LayerRenderCache";
import { RasterLayerRenderer } from "./LayerRenderers";

/**
 * RenderPass that composites document layers.
 * Renders layers bottom-to-top with blend modes and opacity.
 */
export class DocumentRenderPass extends RenderPass {
  private documentView: DocumentView;
  private renderCache: LayerRenderCache;
  private rasterRenderer: RasterLayerRenderer;

  constructor(document: Document) {
    super();
    this.documentView = new DocumentView(document);
    this.renderCache = this.documentView.getRenderCache();
    this.rasterRenderer = new RasterLayerRenderer();
  }

  name(): string {
    return "DocumentRender";
  }

  execute(ctx: PassContext): void {
    const { renderContext } = ctx;

    // Sync layers if document structure changed
    if (this.documentView.document.isDirty()) {
      this.documentView.syncLayers();
      this.documentView.document.clearDirty();
    }

    // Collect all layers in render order (bottom to top)
    const layers = this.collectLayersInOrder(this.documentView.document.root);

    // For each layer (bottom to top):
    for (const layer of layers) {
      if (!layer.visible || layer.opacity <= 0) continue;

      // Update layer texture if dirty
      if (layer.kind() === "raster") {
        const rasterLayer = layer as RasterLayer;
        const textureHandle = this.renderCache.updateLayerTexture(rasterLayer, renderContext);
        if (textureHandle) {
          const layerNode = this.documentView.layerNodes.get(layer.id);
          if (layerNode) {
            const textureRef = this.renderCache.getTextureRef(layer);
            if (textureRef) {
              layerNode.material.setTexture(textureRef);
            }
            layerNode.syncFromLayer(this.documentView.document);
          }
        }
      }

      // Render the layer node
      const layerNode = this.documentView.layerNodes.get(layer.id);
      if (layerNode) {
        // Apply blend mode and opacity
        // Note: Actual blend mode application happens in the shader/material
        // For MVP, we'll render each layer node
        // The actual compositing with blend modes will be handled by the material/shader system
        this.renderLayerNode(layerNode, renderContext);
      }
    }
  }

  /**
   * Collect all layers in render order (bottom to top, depth-first).
   */
  private collectLayersInOrder(layer: BaseLayer): BaseLayer[] {
    const layers: BaseLayer[] = [];

    const collect = (l: BaseLayer): void => {
      if (l instanceof GroupLayer) {
        for (const child of l.children) {
          collect(child);
        }
      } else {
        layers.push(l);
      }
    };

    collect(layer);
    return layers;
  }

  /**
   * Render a single layer node.
   * For MVP, this is a placeholder - actual rendering will be handled by the material system.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private renderLayerNode(_layerNode: unknown, _ctx: unknown): void {
    // TODO: Implement actual rendering with blend modes
    // This will require shader support for blend modes
    // For now, this is a placeholder
  }

  /**
   * Get the document view.
   */
  getDocumentView(): DocumentView {
    return this.documentView;
  }
}
