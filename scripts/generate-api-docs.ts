import { mkdir, readdir } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { generateDocumentation } from "tsdoc-markdown";

/**
 * Generate API documentation for all packages under `packages/` by discovering
 * a reasonable TypeScript entry file for each package.
 */
async function run() {
  const outDir = join(import.meta.dir, "../docs/api");
  await mkdir(outDir, { recursive: true });

  // Generate one documentation file per package using wildcards
  const packagesDir = join(import.meta.dir, "../packages");
  const dirs = await readdir(packagesDir, { withFileTypes: true });
  /**
   * Iterate packages and generate docs per package.
   */
  for (const d of dirs) {
    if (!d.isDirectory()) continue;
    if (d.name.startsWith(".")) continue;
    const pkgRoot = join(packagesDir, d.name);
    const srcDir = join(pkgRoot, "src");

    /**
     * Recursively collect TypeScript source files under a directory.
     * Excludes test files (*.test.ts) and declaration files (*.d.ts).
     */
    async function collect(dir: string, acc: string[]): Promise<void> {
      const list = await readdir(dir, { withFileTypes: true });
      for (const ent of list) {
        if (ent.name.startsWith(".")) continue;
        if (["node_modules", "dist", "build", ".bun"].includes(ent.name)) continue;
        const full = join(dir, ent.name);
        if (ent.isDirectory()) {
          await collect(full, acc);
        } else if (ent.isFile()) {
          if (ent.name.endsWith(".ts") && !ent.name.endsWith(".test.ts") && !ent.name.endsWith(".d.ts") && ent.name !== "index.ts") {
            acc.push(full);
          }
        }
      }
    }

    const files: string[] = [];
    try {
      await collect(srcDir, files);
    } catch {
      // no src dir; skip package
      continue;
    }
    if (files.length === 0) continue;

    // Generate one markdown file per TypeScript file
    for (const file of files) {
      const relFromSrc = relative(srcDir, file);
      const mdPath = relFromSrc.replace(/\.ts$/i, ".md");
      const outfile = join(outDir, d.name, mdPath);
      await mkdir(dirname(outfile), { recursive: true });

      const inputFile = relative(process.cwd(), file);
      const inputFileRel = inputFile.startsWith(".") ? inputFile : `./${inputFile}`;
      console.log(`Generating API docs: ${d.name}/${relFromSrc} -> ${mdPath}`);
      generateDocumentation({
        inputFiles: [inputFileRel],
        outputFile: outfile,
        markdownOptions: {
          headingLevel: "#",
          emoji: null,
        },
        buildOptions: {
          types: true,
          explore: false,
        },
      });
    }
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
