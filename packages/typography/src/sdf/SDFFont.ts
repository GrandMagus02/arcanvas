/**
 * SDF/MSDF Font Atlas representation.
 *
 * Supports loading font metrics from BMFont format (JSON or text) or MSDF-gen format.
 */

/**
 * Glyph metrics for a single character in the atlas.
 */
export interface SDFGlyph {
  /** Character code (unicode) */
  id: number;
  /** X position in atlas (pixels) */
  x: number;
  /** Y position in atlas (pixels) */
  y: number;
  /** Width in atlas (pixels) */
  width: number;
  /** Height in atlas (pixels) */
  height: number;
  /** X offset when rendering (pixels) */
  xoffset: number;
  /** Y offset when rendering (pixels) */
  yoffset: number;
  /** Advance width for cursor (pixels) */
  xadvance: number;
  /** Atlas page (for multi-page atlases) */
  page: number;
}

/**
 * Kerning pair for adjusting spacing between specific character pairs.
 */
export interface SDFKerning {
  /** First character code */
  first: number;
  /** Second character code */
  second: number;
  /** Kerning amount (pixels) */
  amount: number;
}

/**
 * Font common metrics.
 */
export interface SDFCommon {
  /** Line height (pixels) */
  lineHeight: number;
  /** Distance from top to baseline (pixels) */
  base: number;
  /** Atlas texture width (pixels) */
  scaleW: number;
  /** Atlas texture height (pixels) */
  scaleH: number;
  /** Number of atlas pages */
  pages: number;
}

/**
 * Font info from the generator.
 */
export interface SDFInfo {
  /** Font family name */
  face: string;
  /** Font size used to generate atlas */
  size: number;
  /** Is bold */
  bold: boolean;
  /** Is italic */
  italic: boolean;
  /** Padding around glyphs */
  padding: [number, number, number, number];
  /** Spacing between glyphs */
  spacing: [number, number];
}

/**
 * Distance field specific info.
 */
export interface SDFDistanceField {
  /** Type: "sdf", "msdf", or "mtsdf" */
  fieldType: "sdf" | "msdf" | "mtsdf";
  /** Distance range in pixels */
  distanceRange: number;
}

/**
 * Complete SDF/MSDF font data.
 */
export interface SDFFont {
  /** Font info */
  info: SDFInfo;
  /** Common metrics */
  common: SDFCommon;
  /** Distance field info */
  distanceField?: SDFDistanceField;
  /** Atlas page filenames */
  pages: string[];
  /** Glyph data indexed by character code */
  glyphs: Map<number, SDFGlyph>;
  /** Kerning pairs */
  kernings: Map<string, number>;
}

/**
 * Loads an SDF/MSDF font from JSON (msdf-bmfont-xml or msdfgen JSON format).
 */
export async function loadSDFFont(jsonUrl: string): Promise<SDFFont> {
  const response = await fetch(jsonUrl);
  if (!response.ok) {
    throw new Error(`Failed to load SDF font: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return parseSDFFontJSON(data);
}

/**
 * Parses SDF font JSON data.
 * Supports both msdf-bmfont-xml format and msdfgen JSON format.
 */
export function parseSDFFontJSON(data: unknown): SDFFont {
  const json = data as Record<string, unknown>;

  // Detect format and parse accordingly
  if (json.atlas && json.metrics) {
    // msdfgen format
    return parseMsdfgenFormat(json);
  } else if (json.chars || json.glyphs) {
    // BMFont JSON format (from msdf-bmfont-xml or similar)
    return parseBMFontFormat(json);
  }

  throw new Error("Unknown SDF font format");
}

/**
 * Parses msdfgen JSON format.
 */
function parseMsdfgenFormat(json: Record<string, unknown>): SDFFont {
  const atlas = json.atlas as Record<string, unknown>;
  const metrics = json.metrics as Record<string, unknown>;
  const glyphsArray = json.glyphs as Array<Record<string, unknown>>;

  const info: SDFInfo = {
    face: (metrics.family as string) || "Unknown",
    size: (metrics.emSize as number) || 32,
    bold: false,
    italic: false,
    padding: [0, 0, 0, 0],
    spacing: [0, 0],
  };

  const common: SDFCommon = {
    lineHeight: ((metrics.lineHeight as number) || 1) * info.size,
    base: ((metrics.ascender as number) || 0.8) * info.size,
    scaleW: (atlas.width as number) || 512,
    scaleH: (atlas.height as number) || 512,
    pages: 1,
  };

  const distanceField: SDFDistanceField = {
    fieldType: ((atlas.type as string) || "msdf") as "sdf" | "msdf" | "mtsdf",
    distanceRange: (atlas.distanceRange as number) || 4,
  };

  const glyphs = new Map<number, SDFGlyph>();
  const kernings = new Map<string, number>();

  for (const g of glyphsArray || []) {
    const unicode = g.unicode as number;
    const atlasBounds = g.atlasBounds as Record<string, number> | undefined;
    const planeBounds = g.planeBounds as Record<string, number> | undefined;

    if (atlasBounds) {
      glyphs.set(unicode, {
        id: unicode,
        x: atlasBounds.left || 0,
        y: atlasBounds.bottom || 0, // msdfgen uses bottom-left origin
        width: (atlasBounds.right || 0) - (atlasBounds.left || 0),
        height: (atlasBounds.top || 0) - (atlasBounds.bottom || 0),
        xoffset: planeBounds ? (planeBounds.left || 0) * info.size : 0,
        yoffset: planeBounds ? (1 - (planeBounds.top || 0)) * info.size : 0,
        xadvance: ((g.advance as number) || 0.5) * info.size,
        page: 0,
      });
    }
  }

  return {
    info,
    common,
    distanceField,
    pages: [(atlas.filename as string) || "atlas.png"],
    glyphs,
    kernings,
  };
}

/**
 * Parses BMFont JSON format.
 */
function parseBMFontFormat(json: Record<string, unknown>): SDFFont {
  const infoData = json.info as Record<string, unknown> | undefined;
  const commonData = json.common as Record<string, unknown> | undefined;
  const dfData = json.distanceField as Record<string, unknown> | undefined;
  const pagesData = json.pages as string[] | undefined;
  const charsData = (json.chars as Array<Record<string, unknown>>) || (json.glyphs as Array<Record<string, unknown>>);
  const kerningsData = json.kernings as Array<Record<string, unknown>> | undefined;

  const info: SDFInfo = {
    face: (infoData?.face as string) || "Unknown",
    size: (infoData?.size as number) || 32,
    bold: !!(infoData?.bold as number),
    italic: !!(infoData?.italic as number),
    padding: (infoData?.padding as [number, number, number, number]) || [0, 0, 0, 0],
    spacing: (infoData?.spacing as [number, number]) || [0, 0],
  };

  const common: SDFCommon = {
    lineHeight: (commonData?.lineHeight as number) || info.size,
    base: (commonData?.base as number) || info.size * 0.8,
    scaleW: (commonData?.scaleW as number) || 512,
    scaleH: (commonData?.scaleH as number) || 512,
    pages: (commonData?.pages as number) || 1,
  };

  // A-Frame MSDF fonts don't include distanceField metadata, but are MSDF with range ~4
  const distanceField: SDFDistanceField = dfData
    ? {
        fieldType: (dfData.fieldType as "sdf" | "msdf" | "mtsdf") || "msdf",
        distanceRange: (dfData.distanceRange as number) || 4,
      }
    : {
        // Default for A-Frame style MSDF fonts
        fieldType: "msdf",
        distanceRange: 4,
      };

  const glyphs = new Map<number, SDFGlyph>();
  for (const c of charsData || []) {
    const id = (c.id as number) || (c.unicode as number);
    glyphs.set(id, {
      id,
      x: (c.x as number) || 0,
      y: (c.y as number) || 0,
      width: (c.width as number) || 0,
      height: (c.height as number) || 0,
      xoffset: (c.xoffset as number) || 0,
      yoffset: (c.yoffset as number) || 0,
      xadvance: (c.xadvance as number) || 0,
      page: (c.page as number) || 0,
    });
  }

  const kernings = new Map<string, number>();
  for (const k of kerningsData || []) {
    const key = `${k.first}-${k.second}`;
    kernings.set(key, (k.amount as number) || 0);
  }

  return {
    info,
    common,
    distanceField,
    pages: pagesData || ["atlas.png"],
    glyphs,
    kernings,
  };
}

/**
 * Gets kerning amount between two characters.
 */
export function getKerning(font: SDFFont, first: number, second: number): number {
  return font.kernings.get(`${first}-${second}`) || 0;
}
