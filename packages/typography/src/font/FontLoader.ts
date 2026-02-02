import * as opentype from "opentype.js";

/**
 * Utility class for loading TTF/OTF fonts.
 *
 * Uses opentype.js for parsing font files.
 */
export class FontLoader {
  /**
   * Load a font from a URL.
   *
   * @param url - URL to the font file (TTF/OTF)
   * @returns Parsed opentype.js Font object
   */
  static async load(url: string): Promise<opentype.Font> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch font: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return this.parse(arrayBuffer);
  }

  /**
   * Parse a font from an ArrayBuffer.
   *
   * @param buffer - ArrayBuffer containing font data
   * @returns Parsed opentype.js Font object
   */
  static parse(buffer: ArrayBuffer): opentype.Font {
    const font = opentype.parse(buffer);
    if (!font) {
      throw new Error("Failed to parse font data");
    }
    return font;
  }

  /**
   * Load a font from a File object (for file upload support).
   *
   * @param file - File object containing font data
   * @returns Parsed opentype.js Font object
   */
  static async fromFile(file: File): Promise<opentype.Font> {
    const buffer = await file.arrayBuffer();
    return this.parse(buffer);
  }
}

export type { Font } from "opentype.js";
