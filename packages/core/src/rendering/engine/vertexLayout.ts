/**
 *
 */
export type VertexAttributeSemantic = "position" | "normal" | "uv" | "color" | "tangent";

/**
 *
 */
export interface VertexAttributeDesc {
  semantic: VertexAttributeSemantic;
  components: 2 | 3 | 4;
  type: "float" | "uint8" | "uint16";
  normalized: boolean;
  offset: number;
}

/**
 *
 */
export interface VertexLayout {
  stride: number;
  attributes: VertexAttributeDesc[];
}

/**
 * Creates a vertex layout with only position attribute.
 * @param components - Number of position components (2 or 3)
 * @returns Vertex layout configuration
 */
export function createPositionLayout(components: 2 | 3 = 3): VertexLayout {
  return {
    stride: components * Float32Array.BYTES_PER_ELEMENT,
    attributes: [
      {
        semantic: "position",
        components,
        type: "float",
        normalized: false,
        offset: 0,
      },
    ],
  };
}
