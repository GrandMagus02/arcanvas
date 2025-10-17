
import type { ServerWebSocket } from "bun";
import { watch } from "fs";
import { join } from "path";

const root = Bun.fileURLToPath(new URL(".", import.meta.url));
const distDir = join(root, "dist");
const srcDir = join(root, "src");
const projectRoot = Bun.fileURLToPath(new URL("../../", import.meta.url));
const coreDir = join(projectRoot, "packages/core");

/** Build the playground bundle using Bun.build */
async function build() {
  const result = await Bun.build({
    entrypoints: [join(srcDir, "main.ts")],
    outdir: distDir,
    target: "browser",
    sourcemap: "inline",
    minify: false,
  });
  if (!result.success) {
    console.error("Build failed:");
    for (const m of result.logs) {
      console.error(m);
    }
  } else {
    console.log("Built", new Date().toLocaleTimeString());
  }
  return result.success;
}

type LRData = { pathname: string };
/** Live reload clients */
const sockets = new Set<ServerWebSocket<LRData>>();

/** HTTP + WebSocket server for the playground */
const server = Bun.serve<LRData>({
  port: 3000,
  async fetch(req, srv) {
    const url = new URL(req.url);

    if (url.pathname === "/livereload") {
      const upgraded = srv.upgrade(req, { data: { pathname: url.pathname } });
      if (!upgraded) {
        return new Response("Upgrade failed", { status: 500 });
      }
      return new Response();
    }

    const path = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
    const filePath = join(root, path);
    const file = Bun.file(filePath);
    const exists = await file.exists();
    if (file.size === 0 && !exists) {
      return new Response("Not found", { status: 404 });
    }
    return new Response(file);
  },
  websocket: {
    open(ws: ServerWebSocket<LRData>) {
      sockets.add(ws);
    },
    close(ws: ServerWebSocket<LRData>) {
      sockets.delete(ws);
    },
    message() {},
  },
});

console.log(`Playground at http://localhost:${server.port}`);

await build();

/** Notify connected clients to reload */
function triggerReload() {
  for (const ws of sockets) {
    try {
      ws.send("reload");
    } catch {
      // ignore send errors (client may be closed)
    }
  }
}

/** Rebuild and broadcast reload on change */
function onChange() {
  void build().then((ok) => {
    if (ok) {
      triggerReload();
    }
  });
}

watch(srcDir, { recursive: true }, onChange);
watch(coreDir, { recursive: true }, onChange);
watch(join(root, "index.html"), onChange);


