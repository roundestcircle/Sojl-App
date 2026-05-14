// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
// Prettier imports
const prettierConfig = require("eslint-config-prettier/flat");
const prettierPlugin = require("eslint-plugin-prettier");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  // 1. Disable ESLint rules that conflict with Prettier
  prettierConfig,
  // 2. Add Prettier as an ESLint rule (must come after prettierConfig)
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      "prettier/prettier": "error",
    },
  },
]);
