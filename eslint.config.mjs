import js from "@eslint/js";
import powerbiVisualsConfigs from "eslint-plugin-powerbi-visuals";
import tseslint from "typescript-eslint";
import eslintConfig from "powerbi-visuals-core/config/eslint";

export default eslintConfig(powerbiVisualsConfigs, js, tseslint, { project: "./tsconfig.test.json", tsconfigRootDir: import.meta.dirname });
