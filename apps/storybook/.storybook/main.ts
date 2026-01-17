import type { StorybookConfig } from "@storybook/html-vite";
import { mergeConfig } from "vite";
import { resolve } from "path";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|js)"],
  addons: ["@storybook/addon-essentials"],
  framework: {
    name: "@storybook/html-vite",
    options: {},
  },
  viteFinal(config) {
    return mergeConfig(config, {
      resolve: {
        alias: {
          "@arcanvas/core": resolve(__dirname, "../../../packages/core/index.ts"),
          "@arcanvas/matrix": resolve(__dirname, "../../../packages/matrix/index.ts"),
          "@arcanvas/vector": resolve(__dirname, "../../../packages/vector/index.ts"),
          "@arcanvas/document": resolve(__dirname, "../../../packages/document/index.ts"),
          "@arcanvas/feature-2d": resolve(__dirname, "../../../packages/feature-2d/index.ts"),
          "@arcanvas/feature-document-2d": resolve(__dirname, "../../../packages/feature-document-2d/index.ts"),
          "@arcanvas/graphics": resolve(__dirname, "../../../packages/graphics/index.ts"),
          "@arcanvas/interaction": resolve(__dirname, "../../../packages/interaction/index.ts"),
          "@arcanvas/scene": resolve(__dirname, "../../../packages/scene/index.ts"),
          // Resolve internal src/ imports in core package (using baseUrl from tsconfig)
          "src/systems": resolve(__dirname, "../../../packages/core/src/systems/index.ts"),
          "src/utils/mixins": resolve(__dirname, "../../../packages/core/src/utils/mixins/index.ts"),
        },
      },
      optimizeDeps: {
        exclude: [
          "@arcanvas/core",
          "@arcanvas/matrix",
          "@arcanvas/vector",
          "@arcanvas/document",
          "@arcanvas/feature-2d",
          "@arcanvas/feature-document-2d",
          "@arcanvas/graphics",
          "@arcanvas/interaction",
          "@arcanvas/scene",
        ],
        esbuildOptions: {
          target: "es2020",
        },
      },
      build: {
        commonjsOptions: {
          include: [/node_modules/],
        },
      },
      server: {
        fs: {
          allow: ["../../.."],
        },
      },
      define: {
        "process.env": {},
      },
    });
  },
};

export default config;
