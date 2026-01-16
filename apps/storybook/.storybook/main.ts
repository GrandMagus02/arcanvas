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
  async viteFinal(config) {
    return mergeConfig(config, {
      resolve: {
        alias: {
          "@arcanvas/core": resolve(__dirname, "../../../packages/core/index.ts"),
          "@arcanvas/matrix": resolve(__dirname, "../../../packages/matrix/index.ts"),
          "@arcanvas/vector": resolve(__dirname, "../../../packages/vector/index.ts"),
          // Resolve internal src/ imports in core package (using baseUrl from tsconfig)
          "src/systems": resolve(__dirname, "../../../packages/core/src/systems/index.ts"),
          "src/utils/mixins": resolve(__dirname, "../../../packages/core/src/utils/mixins/index.ts"),
        },
      },
      optimizeDeps: {
        exclude: ["@arcanvas/core", "@arcanvas/matrix", "@arcanvas/vector"],
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
