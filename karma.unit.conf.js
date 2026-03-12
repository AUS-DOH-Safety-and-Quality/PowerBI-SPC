"use strict";

const baseConfigFn = require("./karma.conf");

const unitTestPaths = [
  "test/functions/**/*.spec.ts",
  "test/outlier-flagging/**/*.spec.ts",
  "test/limit-calculations/**/*.spec.ts",
  "test/helpers/*.spec.ts",
];

module.exports = (config) => {
  baseConfigFn(config);
  config.set({
    files: [
      ...unitTestPaths,
      {
        pattern: "src/**/*.ts",
        included: false,
        served: true
      },
      {
        pattern: "./capabilities.json",
        watched: false,
        served: true,
        included: false
      }
    ],
    preprocessors: {
      "test/functions/**/*.spec.ts": ["webpack"],
      "test/outlier-flagging/**/*.spec.ts": ["webpack"],
      "test/limit-calculations/**/*.spec.ts": ["webpack"],
      "test/helpers/*.spec.ts": ["webpack"],
    },
    // Relax coverage thresholds for unit-only runs (less source covered)
    coverageIstanbulReporter: {
      ...config.coverageIstanbulReporter,
      thresholds: {
        global: {
          statements: 0,
          branches: 0,
          functions: 0,
          lines: 0
        }
      }
    }
  });
};
