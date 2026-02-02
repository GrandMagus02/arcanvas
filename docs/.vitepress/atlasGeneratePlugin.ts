import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = resolve(__dirname, "../..");

const ATLAS_GENERATE_PATH = "/__atlas-generate__";

/**
 * Reads the request body as a string.
 */
function readBody(req: import("node:http").IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

/**
 * Vite plugin that adds a server route for MSDF atlas generation (Node-only).
 * POST /__atlas-generate__ with JSON body: { fontBase64: string, options?: BMFontOptions, filename?: string }
 */
export function atlasGeneratePlugin(): Plugin {
  return {
    name: "atlas-generate-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url !== ATLAS_GENERATE_PATH || req.method !== "POST") {
          return next();
        }

        try {
          const bodyStr = await readBody(req);
          const body = JSON.parse(bodyStr) as {
            fontBase64: string;
            options?: Record<string, unknown>;
            filename?: string;
          };

          if (!body.fontBase64 || typeof body.fontBase64 !== "string") {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Missing fontBase64" }));
            return;
          }

          const { generateFontAtlasFromBuffer } = await import(resolve(ROOT, "packages/typography/src/generate.ts"));
          const { Buffer } = await import("buffer");
          const fontBuffer = Buffer.from(body.fontBase64, "base64");
          const filename = body.filename ?? "font.ttf";
          const options = body.options ?? {};

          const result = await generateFontAtlasFromBuffer(fontBuffer, options, filename);

          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(result));
        } catch (err) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              error: err instanceof Error ? err.message : String(err),
            })
          );
        }
      });
    },
  };
}
