declare module "msdf-bmfont-xml" {
  /**
   * Options for generating BMFont
   */
  export interface BMFontOptions {
    /** Output font file format. Available: xml(default), json, txt */
    outputType?: "xml" | "json" | "txt";
    /** Filename of both font file and font textures */
    filename?: string;
    /** Font size for generated textures (default 42) */
    fontSize?: number;
    /** Charset in generated font, could be array or string (default is Western) */
    charset?: string | string[];
    /** Width of generated textures (default 512) */
    textureWidth?: number;
    /** Height of generated textures (default 512) */
    textureHeight?: number;
    /** [width, height] of generated textures */
    textureSize?: [number, number];
    /** Distance range for computing signed distance field (default 4) */
    distanceRange?: number;
    /** "msdf"(default), "sdf", "psdf" */
    fieldType?: "msdf" | "sdf" | "psdf";
    /** Rounded digits of the output font file. (Default is null) */
    roundDecimal?: number;
    /** Shrink atlas to the smallest possible square (Default: false) */
    smartSize?: boolean;
    /** Atlas size shall be power of 2 (Default: false) */
    pot?: boolean;
    /** Atlas size shall be square (Default: false) */
    square?: boolean;
    /** Allow 90-degree rotation while packing (Default: false) */
    rot?: boolean;
    /** Use RTL characters fix (Default: false) */
    rtl?: boolean;
    /** Tolerance for simplifying contours (Default: 0) */
    tolerance?: number;
    /** Border width (Default: 0) */
    border?: number;
    /** Reuse config file or object */
    reuse?: string | boolean | { opt: BMFontOptions };
    /** Font spacing [x, y] (default [0, 0]) */
    fontSpacing?: [number, number];
    /** Font padding [up, right, down, left] (default based on distanceRange) */
    fontPadding?: [number, number, number, number];
  }

  /**
   * Generated texture object
   */
  export interface Texture {
    filename: string;
    texture: Buffer;
  }

  /**
   * Generated font data
   */
  export interface Font {
    filename: string;
    data: string;
    settings: {
      opt: BMFontOptions;
      pages: string[];
      packer: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        bins: any[];
      };
    };
  }

  /**
   * Callback function for generation
   */
  export type Callback = (error: Error | null, textures: Texture[], font: Font) => void;

  /**
   * Generates a BMFont from a font file
   * @param fontPath Path to the font file or Buffer
   * @param opt Options
   * @param callback Callback function
   */
  export default function generateBMFont(fontPath: string | Buffer, opt: BMFontOptions, callback: Callback): void;
}
