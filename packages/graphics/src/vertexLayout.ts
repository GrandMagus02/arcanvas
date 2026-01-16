/**
 * Semantic meaning of a vertex attribute.
 */
export type VertexAttributeSemantic = "position" | "normal" | "uv" | "color" | "tangent";

/**
 * Description of a single vertex attribute.
 */
export interface VertexAttributeDesc {
  semantic: VertexAttributeSemantic;
  components: 2 | 3 | 4;
  type: "float" | "uint8" | "uint16";
  normalized: boolean;
  offset: number;
}

/**
 * Description of vertex data layout.
 */
export interface VertexLayout {
  stride: number;
  attributes: VertexAttributeDesc[];
}

/**
 * Creates a vertex layout with only position attribute.
 * @param components - Number of position components (2 or 3)
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

/**
 * Creates a vertex layout with position and normal attributes.
 */
export function createPositionNormalLayout(): VertexLayout {
  return {
    stride: 6 * Float32Array.BYTES_PER_ELEMENT,
    attributes: [
      {
        semantic: "position",
        components: 3,
        type: "float",
        normalized: false,
        offset: 0,
      },
      {
        semantic: "normal",
        components: 3,
        type: "float",
        normalized: false,
        offset: 3 * Float32Array.BYTES_PER_ELEMENT,
      },
    ],
  };
}

/**
 * Creates a vertex layout with position, normal, and UV attributes.
 */
export function createPositionNormalUVLayout(): VertexLayout {
  return {
    stride: 8 * Float32Array.BYTES_PER_ELEMENT,
    attributes: [
      {
        semantic: "position",
        components: 3,
        type: "float",
        normalized: false,
        offset: 0,
      },
      {
        semantic: "normal",
        components: 3,
        type: "float",
        normalized: false,
        offset: 3 * Float32Array.BYTES_PER_ELEMENT,
      },
      {
        semantic: "uv",
        components: 2,
        type: "float",
        normalized: false,
        offset: 6 * Float32Array.BYTES_PER_ELEMENT,
      },
    ],
  };
}
