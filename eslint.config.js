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
    ignores: ["**/node_modules/**", "**/dist/**", "**/build/**", "**/.bun/**"],
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
      semi: ["error", "always"],
      "no-trailing-spaces": "error",
      "eol-last": ["error", "always"],
      curly: ["error", "all"],
      eqeqeq: ["error", "always"],
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
      "jsonc/no-trailing-commas": "error",
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
