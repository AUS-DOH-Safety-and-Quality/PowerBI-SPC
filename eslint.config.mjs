import js from "@eslint/js";
import powerbiVisualsConfigs from "eslint-plugin-powerbi-visuals";
import tseslint from "typescript-eslint";
import eslintConfig from "powerbi-visuals-core/config/eslint";

// Source files resolve to the strict program first, so the type-aware rules see noUncheckedIndexedAccess
export default [
  ...eslintConfig(powerbiVisualsConfigs, js, tseslint, { project: ["./tsconfig.json", "./tsconfig.test.json"], tsconfigRootDir: import.meta.dirname }),
  {
    files: ["src/**/*.ts"],
    rules: {
      // With noUncheckedIndexedAccess on, a check the compiler can prove redundant is noise
      "@typescript-eslint/no-unnecessary-condition": "error"
    }
  }
];
