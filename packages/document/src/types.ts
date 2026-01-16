/**
 * Type representing different layer types in a document.
 */
export type LayerType = "raster" | "vector" | "text" | "group" | "adjustment";

export type { BaseLayer, GroupLayer, RasterLayer, VectorLayer, TextLayer, AdjustmentLayer } from "./Layer";
export type { Transform2D, LayerMask } from "./Layer";
export type { RasterSourceRef } from "./RasterSource";
export { BlendMode } from "./BlendMode";
