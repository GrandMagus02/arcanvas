import { existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitepress";
import { atlasGeneratePlugin } from "./atlasGeneratePlugin";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../..");

interface SidebarItem {
  text: string;
  link?: string;
  items?: SidebarItem[];
  collapsed?: boolean;
}

/**
 * Format a camelCase/PascalCase name for display.
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
 */
function buildApiSidebar(): Array<SidebarItem> {
  const apiDir = join(__dirname, "../api");
  if (!existsSync(apiDir)) return [];

  const packages = readdirSync(apiDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("."))
    .map((d) => d.name);

  const sidebar: Array<SidebarItem> = [];

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

    const items: Array<SidebarItem> = [];
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

// --- Package Docs Auto-Discovery ---

/**
 * Generate rewrite rules for package docs.
 */
function getPackageRewrites() {
  const packagesDir = resolve(ROOT, "packages");
  if (!existsSync(packagesDir)) return {};

  const rewrites: Record<string, string> = {};
  const packages = readdirSync(packagesDir).filter((f) => statSync(join(packagesDir, f)).isDirectory());

  for (const pkg of packages) {
    const docsDir = join(packagesDir, pkg, "docs");
    if (existsSync(docsDir)) {
      // Find all MD files recursively
      const files = findFilesRecursively(docsDir, ".md");
      for (const file of files) {
        const relPath = relative(docsDir, file);
        // Normalize path separators to forward slash for consistency
        const normalizedRelPath = relPath.split("\\").join("/");

        // Source path relative to VitePress root (docs folder)
        const sourcePath = relative(resolve(__dirname, ".."), file).split("\\").join("/");

        let destPath: string;
        if (normalizedRelPath.startsWith("examples/") || normalizedRelPath === "examples") {
          // It's an example, map to examples/<pkg>/...
          const exampleRelPath = normalizedRelPath.replace(/^examples\//, "");
          destPath = `examples/${pkg}/${exampleRelPath}`;
        } else {
          // Regular doc, map to packages/<pkg>/...
          destPath = `packages/${pkg}/${normalizedRelPath}`;
        }

        rewrites[sourcePath] = destPath;
      }
    }
  }
  return rewrites;
}

/**
 * Find files recursively in a directory.
 */
function findFilesRecursively(dir: string, ext: string, fileList: string[] = []) {
  const files = readdirSync(dir);
  for (const file of files) {
    const filePath = join(dir, file);
    if (statSync(filePath).isDirectory()) {
      findFilesRecursively(filePath, ext, fileList);
    } else if (file.endsWith(ext)) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

/**
 * Build sidebar for a specific package's docs.
 * Adapts links based on whether they are examples or regular docs.
 */
function buildPackageDocsSidebar(pkg: string): SidebarItem[] {
  const docsDir = resolve(ROOT, "packages", pkg, "docs");
  if (!existsSync(docsDir)) return [];

  // Custom walker for sidebar structure
  /**
   * Walk directory to build sidebar structure.
   */
  function walk(dir: string, prefix: string): SidebarItem[] {
    const entries = readdirSync(dir, { withFileTypes: true });
    const result: SidebarItem[] = [];

    // Separate index.md, other files, and directories
    const indexFile = entries.find((e) => e.isFile() && e.name === "index.md");
    const otherFiles = entries.filter((e) => e.isFile() && e.name.endsWith(".md") && e.name !== "index.md");
    const directories = entries.filter((e) => e.isDirectory());

    // Helper to generate correct link
    const getLink = (subPath: string) => {
      const fullRelPath = prefix ? `${prefix}/${subPath}` : subPath;
      // Normalize check
      const normalized = fullRelPath.split("\\").join("/");
      if (normalized.startsWith("examples/") || normalized === "examples") {
        const exRelPath = normalized.replace(/^examples\/?/, "");
        return `/examples/${pkg}/${exRelPath}`;
      }
      return `/packages/${pkg}/${fullRelPath}`;
    };

    // 1. Handle index.md
    if (indexFile) {
      let text = formatDisplayName(prefix.split("/").pop() || pkg);
      if (dir === docsDir) text = formatDisplayName(pkg);

      result.push({
        text,
        link: getLink(""), // Points to index.md
      });
    }

    // 2. Handle other files
    for (const file of otherFiles) {
      const name = file.name.replace(".md", "");
      result.push({
        text: formatDisplayName(name),
        link: getLink(name),
      });
    }

    // 3. Handle directories
    for (const d of directories) {
      const subItems = walk(join(dir, d.name), prefix ? `${prefix}/${d.name}` : d.name);
      if (subItems.length > 0) {
        result.push({
          text: formatDisplayName(d.name),
          items: subItems,
          collapsed: false,
        });
      }
    }

    return result;
  }

  return walk(docsDir, "");
}

/**
 * Build the Examples sidebar by automatically scanning /docs/examples directory.
 */
function buildExamplesSidebar(): SidebarItem[] {
  const examplesDir = join(__dirname, "../examples");
  if (!existsSync(examplesDir)) {
    return [
      {
        text: "Examples",
        items: [{ text: "Overview", link: "/examples/" }],
      },
    ];
  }

  /**
   * Recursively walk the examples directory to build sidebar structure.
   */
  function walk(dir: string, basePath: string): SidebarItem[] {
    const entries = readdirSync(dir, { withFileTypes: true })
      .filter((e) => !e.name.startsWith("."))
      .sort((a, b) => {
        // Sort: directories first, then files, both alphabetically
        if (a.isDirectory() && !b.isDirectory()) return -1;
        if (!a.isDirectory() && b.isDirectory()) return 1;
        return a.name.localeCompare(b.name);
      });

    const items: SidebarItem[] = [];
    const files: Array<{ text: string; link: string }> = [];
    const directories: Array<{ name: string; items: SidebarItem[] }> = [];

    // Separate files and directories
    for (const ent of entries) {
      const full = join(dir, ent.name);
      if (ent.isDirectory()) {
        const subItems = walk(full, basePath ? `${basePath}/${ent.name}` : ent.name);
        if (subItems.length > 0) {
          directories.push({ name: ent.name, items: subItems });
        }
      } else if (ent.isFile() && ent.name.endsWith(".md")) {
        const name = ent.name.replace(/\.md$/, "");
        const link = `/examples${basePath ? `/${basePath}` : ""}${name === "index" ? "" : `/${name}`}`;
        const displayName = formatDisplayName(name === "index" ? (basePath ? basePath.split("/").pop() || "Overview" : "Overview") : name);
        files.push({ text: displayName, link });
      }
    }

    // Add files first (sorted)
    files.sort((a, b) => a.text.localeCompare(b.text)).forEach((item) => items.push(item));

    // Add directories as collapsible groups (sorted)
    directories
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach(({ name, items: dirItems }) => {
        items.push({
          text: formatDisplayName(name),
          collapsed: false,
          items: dirItems,
        });
      });

    return items;
  }

  const items = walk(examplesDir, "");

  return [
    {
      text: "Examples",
      items: items.length > 0 ? items : [{ text: "Overview", link: "/examples/" }],
    },
  ];
}

// Get list of packages with docs
const packagesDir = resolve(ROOT, "packages");
const packagesWithDocs = existsSync(packagesDir) ? readdirSync(packagesDir).filter((pkg) => existsSync(join(packagesDir, pkg, "docs"))) : [];

// Build sidebar config for packages
const packageSidebars: Record<string, SidebarItem[]> = {};
for (const pkg of packagesWithDocs) {
  packageSidebars[`/packages/${pkg}/`] = buildPackageDocsSidebar(pkg);
}

export default defineConfig({
  title: "Arcanvas",
  description: "WebGL canvas engine",
  lastUpdated: true,
  cleanUrls: true,
  appearance: true,
  rewrites: {
    ...getPackageRewrites(),
  },
  themeConfig: {
    logo: undefined,
    nav: [
      { text: "Overview", link: "/guide/overview" },
      { text: "Examples", link: "/examples/" },
      { text: "API", link: getFirstApiLink("gfx") },
      {
        text: "Packages",
        items: packagesWithDocs.map((pkg) => ({
          text: pkg,
          link: `/packages/${pkg}/`,
        })),
      },
    ],
    sidebar: {
      "/api/": buildApiSidebar(),
      ...packageSidebars,
      "/examples/": buildExamplesSidebar(),
      "/": [
        {
          text: "Guide",
          items: [
            { text: "Overview", link: "/guide/overview" },
            { text: "Architecture", link: "/guide/architecture" },
            { text: "Getting Started", link: "/guide/getting-started" },
          ],
        },
        {
          text: "Packages",
          items: [
            { text: "gfx (Graphics API)", link: "/packages/gfx" },
            { text: "webgpu (WebGPU Backend)", link: "/packages/webgpu" },
            { text: "webgl2 (WebGL2 Backend)", link: "/packages/webgl2" },
            { text: "runtime (App Infrastructure)", link: "/packages/runtime" },
            { text: "scene (Scene Graph)", link: "/packages/scene" },
            { text: "math (Vector/Matrix)", link: "/packages/math" },
            { text: "color (Color Spaces)", link: "/packages/color" },
            { text: "selection (Selection)", link: "/packages/selection" },
            { text: "interaction (Input)", link: "/packages/interaction" },
            { text: "typography (Text)", link: "/packages/typography" },
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
        // Foundation
        "@arcanvas/math": resolve(ROOT, "packages/math/index.ts"),
        "@arcanvas/color": resolve(ROOT, "packages/color/index.ts"),
        "@arcanvas/interaction": resolve(ROOT, "packages/interaction/index.ts"),
        // Kernel
        "@arcanvas/gfx": resolve(ROOT, "packages/gfx/index.ts"),
        // Adapters
        "@arcanvas/webgpu": resolve(ROOT, "packages/webgpu/index.ts"),
        "@arcanvas/webgl2": resolve(ROOT, "packages/webgl2/index.ts"),
        // Scene/Runtime
        "@arcanvas/scene": resolve(ROOT, "packages/scene/index.ts"),
        "@arcanvas/runtime": resolve(ROOT, "packages/runtime/index.ts"),
        // Features
        "@arcanvas/selection": resolve(ROOT, "packages/selection/index.ts"),
        "@arcanvas/typography": resolve(ROOT, "packages/typography/index.ts"),
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
