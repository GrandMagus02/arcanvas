export default {
  semi: true,
  singleQuote: false,
  trailingComma: "es5",
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  bracketSpacing: true,
  arrowParens: "always",
  endOfLine: "lf",
  plugins: ["prettier-plugin-glsl"],
  overrides: [
    {
      files: "bun.lock",
      options: { parser: "json" },
    },
    {
      files: ["**/*.frag", "**/*.vert", "**/*.glsl", "**/*.fsh"],
      options: { parser: "glsl-parser" },
    },
  ],
};
