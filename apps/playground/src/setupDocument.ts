import type { Arcanvas } from "@arcanvas/core";
import { createDocument, createRasterLayer } from "@arcanvas/document";
import { DocumentRenderPass } from "@arcanvas/feature-document-2d";
import type { Document } from "@arcanvas/document";

/**
 * Example: Create document, add layers, render.
 * Demonstrates document creation, layer management, and rendering using new packages.
 */
export function setupDocument(arcanvas: Arcanvas): Document {
  // Create a document
  const doc = createDocument(800, 600);

  // Create and add a background layer
  const backgroundLayer = createRasterLayer(doc, { name: "Background", width: 800, height: 600 });
  const bgSurface = backgroundLayer.getSurface();
  if (bgSurface) {
    const ctx = bgSurface.getContext("2d");
    if (ctx) {
      // Draw a simple gradient background
      const gradient = ctx.createLinearGradient(0, 0, 800, 600);
      gradient.addColorStop(0, "#4a90e2");
      gradient.addColorStop(1, "#357abd");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 800, 600);
    }
  }
  doc.addLayer(backgroundLayer);

  // Create and add a foreground layer
  const foregroundLayer = createRasterLayer(doc, { name: "Foreground", width: 800, height: 600 });
  const fgSurface = foregroundLayer.getSurface();
  if (fgSurface) {
    const ctx = fgSurface.getContext("2d");
    if (ctx) {
      // Draw a simple shape
      ctx.fillStyle = "rgba(255, 200, 100, 0.8)";
      ctx.beginPath();
      ctx.arc(400, 300, 100, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  doc.addLayer(foregroundLayer);

  // Set layer properties
  doc.setLayerOpacity(foregroundLayer.id, 0.8);

  // Create document render pass and add to render graph
  const documentPass = new DocumentRenderPass(doc);
  // Note: In a real implementation, you would add this to the render graph
  // For now, this demonstrates the API

  return doc;
}
