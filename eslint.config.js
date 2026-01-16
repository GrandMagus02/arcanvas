import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import jsdoc from "eslint-plugin-jsdoc";
import jsonc from "eslint-plugin-jsonc";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import unusedImports from "eslint-plugin-unused-imports";
import jsoncParser from "jsonc-eslint-parser";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: ["**/node_modules/**", "**/dist/**", "**/build/**", "**/.bun/**", "**/.vitepress/cache/**", "docs/.vitepress/cache/**", "eslint.config.js", "prettier.config.js"],
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
        project: ["./tsconfig.json", "./apps/*/tsconfig.json", "./packages/*/tsconfig.json", "./docs/tsconfig.json"],
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
      semi: ["error", "always"],
      "no-trailing-spaces": "error",
      "eol-last": ["error", "always"],
      curly: ["error", "all"],
      eqeqeq: ["error", "always"],
      // Prefer single-line arrays (collapse when possible). If an array
      // is written without a trailing comma, enforce single-line form.
      "comma-dangle": [
        "error",
        {
          arrays: "never",
          objects: "only-multiline",
          imports: "only-multiline",
          exports: "only-multiline",
          functions: "never",
        },
      ],
      "array-bracket-newline": ["error", "never"],
      "array-element-newline": ["error", "consistent"],
      "no-multiple-empty-lines": ["error", { max: 1, maxEOF: 1, maxBOF: 0 }],
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
    files: ["bun.lock"],
    languageOptions: {
      parser: jsoncParser,
    },
    plugins: {
      jsonc,
    },
    rules: {
      "jsonc/comma-dangle": ["error", "never"],
    },
  },
  {
    files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
    plugins: {
      "unused-imports": unusedImports,
      jsdoc,
    },
    rules: {
      semi: ["error", "always"],
      "no-trailing-spaces": "error",
      "eol-last": ["error", "always"],
      curly: ["error", "all"],
      eqeqeq: ["error", "always"],
      "comma-dangle": [
        "error",
        {
          arrays: "never",
          objects: "only-multiline",
          imports: "only-multiline",
          exports: "only-multiline",
          functions: "never",
        },
      ],
      "array-bracket-newline": ["error", "never"],
      "array-element-newline": ["error", "consistent"],
      "no-multiple-empty-lines": ["error", { max: 1, maxEOF: 1, maxBOF: 0 }],
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
