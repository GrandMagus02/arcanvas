import { Buffer } from "buffer";
import type { BMFontOptions, Font, Texture } from "msdf-bmfont-xml";
import generateBMFont from "msdf-bmfont-xml";

export type { BMFontOptions, Font, Texture };

/**
 * Result of the font atlas generation
 */
export interface FontAtlasResult {
  imageData: ImageData;
  json: Font;
  dataUrl: string;
}

/**
 * Generates an MSDF font atlas from a font file using msdf-bmfont-xml.
 * Note: This function requires a Node.js environment (for msdf-bmfont-xml)
 * AND a DOM environment (for ImageData generation), e.g., Electron.
 *
 * @param fontFile The font file (e.g. from an HTML input)
 * @param options Generation options
 * @returns Promise resolving to the generated atlas data
 */
export async function generateFontAtlas(fontFile: File, options?: BMFontOptions): Promise<FontAtlasResult> {
  const arrayBuffer = await fontFile.arrayBuffer();
  const fontBuffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    generateBMFont(fontBuffer, options || {}, (error, textures, font) => {
      if (error) {
        reject(error);
        return;
      }

      if (!textures || textures.length === 0) {
        reject(new Error("No textures generated"));
        return;
      }

      // We currently only support single-page atlases
      const texture = textures[0];
      if (!texture) {
        reject(new Error("Invalid texture data"));
        return;
      }

      const base64 = texture.texture.toString("base64");
      const dataUrl = `data:image/png;base64,${base64}`;

      if (typeof Image === "undefined" || typeof document === "undefined") {
        reject(new Error("DOM environment required to generate ImageData from texture"));
        return;
      }

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Failed to get 2D context"));
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);

        resolve({
          imageData,
          json: font,
          dataUrl,
        });
      };
      img.onerror = () => reject(new Error("Failed to load generated texture image"));
      img.src = dataUrl;
    });
  });
}

/**
 * Result of atlas generation in Node (no DOM/ImageData).
 */
export interface FontAtlasNodeResult {
  dataUrl: string;
  json: Font;
}

/**
 * Generates an MSDF font atlas from a buffer using msdf-bmfont-xml.
 * For Node.js only (e.g. server, build scripts). Returns dataUrl and font json.
 *
 * @param fontBuffer Font file contents as Buffer
 * @param options Generation options
 * @param filename Optional filename (required when fontBuffer is not from a path)
 * @returns Promise resolving to dataUrl and font json
 */
export function generateFontAtlasFromBuffer(fontBuffer: Buffer, options?: BMFontOptions, filename?: string): Promise<FontAtlasNodeResult> {
  const opt = { ...options, filename: filename ?? options?.filename };

  return new Promise((resolve, reject) => {
    generateBMFont(fontBuffer, opt, (error, textures, font) => {
      if (error) {
        reject(error);
        return;
      }

      if (!textures || textures.length === 0) {
        reject(new Error("No textures generated"));
        return;
      }

      const texture = textures[0];
      if (!texture) {
        reject(new Error("Invalid texture data"));
        return;
      }

      const base64 = texture.texture.toString("base64");
      const dataUrl = `data:image/png;base64,${base64}`;

      resolve({
        dataUrl,
        json: font,
      });
    });
  });
}
