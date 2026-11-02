// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    // Edge Functions are Deno code, deployed by the Supabase CLI, not part of the app bundle.
    ignores: ["dist/*", "supabase/functions/*"],
  },
  {
    // TypeScript knows the browser's globals (window.close, window.name...), but on a phone they don't
    // exist, so a missing variable with one of these names type-checks and then crashes. A Close button
    // calling an out-of-scope `close` did exactly that on two assessment summaries.
    rules: {
      "no-restricted-globals": [
        "error",
        ...["blur", "close", "closed", "event", "focus", "frames", "history", "length", "location", "name",
          "open", "opener", "origin", "parent", "print", "scroll", "self", "status", "stop", "top"].map((name) => ({
          name,
          message: `'${name}' is a browser global that doesn't exist in the app. Is a variable missing?`,
        })),
      ],
    },
  },
]);
