// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    // Edge Functions are Deno code, deployed by the Supabase CLI, not part of the app bundle.
    ignores: ["dist/*", "supabase/functions/*"],
  }
]);
