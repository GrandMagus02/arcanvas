import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import jsdoc from "eslint-plugin-jsdoc";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import unusedImports from "eslint-plugin-unused-imports";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/storybook-static/**",
      "**/.bun/**",
      "**/.vitepress/cache/**",
      "docs/.vitepress/cache/**",
      "docs/.vitepress/atlasGeneratePlugin.ts",
      "apps/playground/**",
      "eslint.config.js",
      "prettier.config.js",
      "bun.lock",
    ],
  },
  js.configs.recommended,
  prettier,
  ...tseslint.configs.recommendedTypeChecked.map((c) => ({
    ...c,
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      ...(c.languageOptions ?? {}),
      parser: tseslint.parser,
      parserOptions: {
        ...((c.languageOptions && c.languageOptions.parserOptions) ?? {}),
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        sourceType: "module",
      },
    },
  })),
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      "unused-imports": unusedImports,
      jsdoc,
    },
    rules: {
      // Formatting rules (semi, eol-last, no-trailing-spaces, comma-dangle, etc.) are handled by Prettier
      curly: ["error", "all"],
      eqeqeq: ["error", "always"],
      "padding-line-between-statements": [
        "error",
        { blankLine: "always", prev: "class", next: "class" },
        { blankLine: "always", prev: "*", next: "class" },
        { blankLine: "always", prev: "class", next: "*" },
      ],
      "lines-around-comment": [
        "error",
        {
          beforeBlockComment: true,
          afterBlockComment: false,
          allowArrayStart: true,
          allowObjectStart: true,
          allowBlockStart: true,
        },
      ],
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "error",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
      "jsdoc/require-jsdoc": [
        "error",
        {
          contexts: [
            "ExportNamedDeclaration > FunctionDeclaration",
            "ExportNamedDeclaration > ClassDeclaration",
            "ExportNamedDeclaration > TSInterfaceDeclaration",
            "ExportNamedDeclaration > TSTypeAliasDeclaration",
            "ExportDefaultDeclaration > FunctionDeclaration",
            "ExportDefaultDeclaration > ClassDeclaration",
            "ExportDefaultDeclaration > TSInterfaceDeclaration",
            "ExportDefaultDeclaration > TSTypeAliasDeclaration",
          ],
          require: {
            FunctionDeclaration: true,
            MethodDefinition: false,
            ClassDeclaration: true,
          },
        },
      ],
      "jsdoc/require-description": "error",
      // TypeScript type-checking rules (enforced via recommendedTypeChecked above, but explicit here for clarity)
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      "@typescript-eslint/no-unsafe-argument": "error",
    },
  },
  eslintPluginPrettierRecommended,
  {
    files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
    plugins: {
      "unused-imports": unusedImports,
      jsdoc,
    },
    rules: {
      // Formatting rules (semi, eol-last, no-trailing-spaces, comma-dangle, etc.) are handled by Prettier
      curly: ["error", "all"],
      eqeqeq: ["error", "always"],
      "padding-line-between-statements": [
        "error",
        { blankLine: "always", prev: "class", next: "class" },
        { blankLine: "always", prev: "*", next: "class" },
        { blankLine: "always", prev: "class", next: "*" },
      ],
      "lines-around-comment": [
        "error",
        {
          beforeBlockComment: true,
          afterBlockComment: false,
          allowArrayStart: true,
          allowObjectStart: true,
          allowBlockStart: true,
        },
      ],
      "no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "error",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
      "jsdoc/require-jsdoc": [
        "error",
        {
          contexts: [
            "ExportNamedDeclaration > FunctionDeclaration",
            "ExportNamedDeclaration > ClassDeclaration",
            "ExportDefaultDeclaration > FunctionDeclaration",
            "ExportDefaultDeclaration > ClassDeclaration",
          ],
          require: {
            FunctionDeclaration: true,
            MethodDefinition: false,
            ClassDeclaration: true,
          },
        },
      ],
      "jsdoc/require-description": "error",
    },
  },
];
