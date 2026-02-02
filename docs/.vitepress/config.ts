import { existsSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitepress";
import { atlasGeneratePlugin } from "./atlasGeneratePlugin";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../..");

/**
 * Format a camelCase/PascalCase name for display.
 * Adds spaces only at word boundaries (lowercase to uppercase), preserving abbreviations.
 * Example: "ColorRGB" -> "Color RGB", "MyClass" -> "My Class"
 */
function formatDisplayName(name: string): string {
  return (
    name.charAt(0).toUpperCase() +
    name
      .slice(1)
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .trim()
  );
}

/**
 * Build sidebar structure from API directory.
 * Top-level files become categories, subdirectories become nested groups.
 */
function buildApiSidebar(): Array<{ text: string; items: Array<{ text: string; link: string } | { text: string; collapsed?: boolean; items: Array<{ text: string; link: string }> }> }> {
  const apiDir = join(__dirname, "../api");
  if (!existsSync(apiDir)) return [];

  const packages = readdirSync(apiDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("."))
    .map((d) => d.name);

  const sidebar: Array<{ text: string; items: Array<{ text: string; link: string } | { text: string; collapsed?: boolean; items: Array<{ text: string; link: string }> }> }> = [];

  for (const pkg of packages) {
    const pkgDir = join(apiDir, pkg);
    const topLevelFiles: Array<{ text: string; link: string }> = [];
    const subdirs = new Map<string, Array<{ text: string; link: string }>>();

    /**
     * Recursively walk directory structure.
     */
    function walk(dir: string, basePath: string, isTopLevel: boolean): void {
      const entries = readdirSync(dir, { withFileTypes: true });
      for (const ent of entries) {
        if (ent.name.startsWith(".")) continue;
        const full = join(dir, ent.name);
        if (ent.isDirectory()) {
          walk(full, `${basePath}/${ent.name}`, false);
        } else if (ent.isFile() && ent.name.endsWith(".md")) {
          const name = ent.name.replace(/\.md$/, "");
          const link = `/api/${pkg}${basePath === "" ? "" : basePath}/${name}`;
          const displayName = formatDisplayName(name);
          if (isTopLevel) {
            topLevelFiles.push({ text: displayName, link });
          } else {
            const dirKey = basePath.split("/").filter(Boolean).join("/");
            if (!subdirs.has(dirKey)) subdirs.set(dirKey, []);
            subdirs.get(dirKey)!.push({ text: displayName, link });
          }
        }
      }
    }

    walk(pkgDir, "", true);

    const items: Array<{ text: string; link: string } | { text: string; collapsed?: boolean; items: Array<{ text: string; link: string }> }> = [];
    // Add top-level files first (categories)
    topLevelFiles.sort((a, b) => a.text.localeCompare(b.text)).forEach((item) => items.push(item));
    // Add subdirectories as collapsible groups
    Array.from(subdirs.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([dirPath, dirItems]) => {
        const dirName = dirPath.split("/").pop() || dirPath;
        const displayDirName = formatDisplayName(dirName);
        const sortedItems = dirItems.sort((a, b) => a.text.localeCompare(b.text));
        items.push({
          text: displayDirName,
          collapsed: false,
          items: sortedItems,
        });
      });

    if (items.length > 0) {
      sidebar.push({
        text: `@arcanvas/${pkg}`,
        items,
      });
    }
  }

  return sidebar;
}

/**
 * Get the first API file link for a package, or fallback to the package directory.
 */
function getFirstApiLink(pkg: string): string {
  const apiDir = join(__dirname, "../api", pkg);
  if (!existsSync(apiDir)) return `/api/${pkg}`;

  /**
   * Find the first API file in a directory.
   */
  function findFirstFile(dir: string, relPath: string): string | null {
    const entries = readdirSync(dir, { withFileTypes: true })
      .filter((e) => !e.name.startsWith("."))
      .sort((a, b) => a.name.localeCompare(b.name));
    // Check files first (top-level files are categories)
    for (const ent of entries) {
      if (ent.isFile() && ent.name.endsWith(".md")) {
        const name = ent.name.replace(/\.md$/, "");
        return `/api/${pkg}${relPath === "" ? "" : relPath}/${name}`;
      }
    }
    // Then check subdirectories
    for (const ent of entries) {
      if (ent.isDirectory()) {
        const full = join(dir, ent.name);
        const found = findFirstFile(full, `${relPath}/${ent.name}`);
        if (found) return found;
      }
    }
    return null;
  }

  return findFirstFile(apiDir, "") || `/api/${pkg}`;
}

export default defineConfig({
  title: "Arcanvas",
  description: "WebGL canvas engine",
  lastUpdated: true,
  cleanUrls: true,
  appearance: true,
  themeConfig: {
    logo: undefined,
    nav: [
      { text: "Overview", link: "/core/overview" },
      { text: "Examples", link: "/examples/" },
      { text: "API", link: getFirstApiLink("core") },
    ],
    sidebar: {
      "/api/": buildApiSidebar(),
      "/examples/": [
        {
          text: "Examples",
          items: [
            { text: "Overview", link: "/examples/" },
            { text: "Getting Started", link: "/examples/getting-started" },
            {
              text: "2D Graphics",
              items: [
                { text: "Basic Shapes", link: "/examples/basic-shapes" },
                { text: "Grid", link: "/examples/grid" },
                { text: "Selection", link: "/examples/selection" },
                { text: "Selection on Grid", link: "/examples/selection-grid" },
              ],
            },
            {
              text: "Typography",
              items: [
                { text: "Text Rendering", link: "/examples/typography" },
                { text: "MSDF Generator", link: "/examples/msdf-generator" },
              ],
            },
          ],
        },
      ],
      "/": [
        {
          text: "Core",
          items: [
            { text: "Overview", link: "/core/overview" },
            { text: "Classes", link: "/core/classes" },
            { text: "Utils", link: "/core/utils" },
          ],
        },
        {
          text: "Color",
          items: [
            { text: "Overview", link: "/color/overview" },
            { text: "Classes", link: "/color/classes" },
            { text: "Utils", link: "/color/utils" },
          ],
        },
        {
          text: "Matrix",
          items: [
            { text: "Overview", link: "/matrix/overview" },
            { text: "Classes", link: "/matrix/classes" },
            { text: "Utils", link: "/matrix/utils" },
          ],
        },
        {
          text: "Vector",
          items: [
            { text: "Overview", link: "/vector/overview" },
            { text: "Classes", link: "/vector/classes" },
            { text: "Utils", link: "/vector/utils" },
          ],
        },
      ],
    },
    socialLinks: [
      // { icon: "github", link: "https://github.com/<org>/<repo>" }
    ],
  },
  head: [
    [
      "style",
      {},
      `
        :root {
          --vp-c-brand-1: #9333ea;
          --vp-c-brand-2: #a855f7;
          --vp-c-brand-3: #c084fc;
          --vp-c-brand-soft: rgba(147, 51, 234, 0.14);
        }
        .dark {
          --vp-c-brand-1: #d8b4fe;
          --vp-c-brand-2: #c084fc;
          --vp-c-brand-3: #a855f7;
          --vp-c-brand-soft: rgba(168, 85, 247, 0.16);
        }
      `,
    ],
  ],
  vite: {
    plugins: [atlasGeneratePlugin()],
    resolve: {
      alias: {
        "@arcanvas/backend-webgl": resolve(ROOT, "packages/backend-webgl/index.ts"),
        "@arcanvas/core": resolve(ROOT, "packages/core/index.ts"),
        "@arcanvas/feature-2d": resolve(ROOT, "packages/feature-2d/index.ts"),
        "@arcanvas/graphics": resolve(ROOT, "packages/graphics/index.ts"),
        "@arcanvas/math": resolve(ROOT, "packages/math/index.ts"),
        "@arcanvas/scene": resolve(ROOT, "packages/scene/index.ts"),
        "@arcanvas/selection": resolve(ROOT, "packages/selection/index.ts"),
        "@arcanvas/typography": resolve(ROOT, "packages/typography/index.ts"),
        "@arcanvas/tools": resolve(ROOT, "packages/tools/index.ts"),
        "@arcanvas/interaction": resolve(ROOT, "packages/interaction/index.ts"),
        "@arcanvas/color": resolve(ROOT, "packages/color/index.ts"),
        // WASM package - requires building first: cd packages/msdf-generator-rs && bun run build
        "@arcanvas/msdf-generator-rs": resolve(ROOT, "packages/msdf-generator-rs/pkg/msdf_generator_rs.js"),
      },
    },
    // Required to properly load assets from packages
    server: {
      fs: {
        allow: [ROOT],
      },
    },
  },
});
