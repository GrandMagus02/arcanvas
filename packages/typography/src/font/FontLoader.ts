import * as opentype from "opentype.js";

export class FontLoader {
  static async load(url: string): Promise<opentype.Font> {
    try {
      // Fetch the file first to get better error messages
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch font: ${response.status} ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();

      // Check the first few bytes to verify it's a font file
      const view = new Uint8Array(arrayBuffer);
      const signature = String.fromCharCode(...view.slice(0, 4));

      // TTF/OTF files start with specific signatures
      // TTF: 0x00 0x01 0x00 0x00 or 'OTTO' for CFF
      // OTF: 'OTTO' or 'true'
      const isValidFont =
        (view[0] === 0x00 && view[1] === 0x01 && view[2] === 0x00 && view[3] === 0x00) || // TTF
        signature === "OTTO" || // OTF/CFF
        signature === "true"; // OTF with 'true' type

      if (!isValidFont && arrayBuffer.byteLength > 0) {
        // Try to read as text to see if it's an error page
        const textDecoder = new TextDecoder();
        const text = textDecoder.decode(view.slice(0, Math.min(100, view.length)));
        if (text.includes("<html") || text.includes("404") || text.includes("Not Found")) {
          throw new Error(`URL returned HTML instead of font file. URL: ${url}`);
        }
        throw new Error(`Invalid font file signature: "${signature}". Expected TTF/OTF file. URL: ${url}`);
      }

      return opentype.parse(arrayBuffer);
    } catch (err) {
      if (err instanceof Error) {
        throw err;
      }
      throw new Error(`Failed to load font from ${url}: ${err}`);
    }
  }

  static parse(buffer: ArrayBuffer): opentype.Font {
    return opentype.parse(buffer);
  }
}
