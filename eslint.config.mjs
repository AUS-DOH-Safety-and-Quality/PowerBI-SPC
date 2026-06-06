import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import pbi from "eslint-plugin-powerbi-visuals";

export default defineConfig({
  files: ['./src/**/*.{js,ts}'],
  extends: [
    js.configs.recommended,
    tseslint.configs.strict,
    tseslint.configs.stylistic,
    pbi.configs.recommended
  ],
  rules: {
    "@typescript-eslint/prefer-for-of": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-explicit-any": "off"
  },
  languageOptions: {
    parserOptions: {
      projectService: true
    }
  }
});
