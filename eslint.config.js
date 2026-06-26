// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const globals = require("globals");
// Prettier imports
const prettierConfig = require("eslint-config-prettier/flat");
const prettierPlugin = require("eslint-plugin-prettier");

module.exports = defineConfig([
  expoConfig,
  {
    // dist/* is build output; munsellData.ts is generated (see
    // scripts/generateMunsellData.js) and must not be hand-formatted.
    ignores: ["dist/*", "utils/munsellData.ts"],
  },
  {
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  // CommonJS build scripts run under Node; expose Node globals there.
  {
    files: ["scripts/**/*.js"],
    languageOptions: {
      globals: globals.node,
      sourceType: "commonjs",
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
