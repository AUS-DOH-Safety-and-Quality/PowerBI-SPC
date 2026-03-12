"use strict";

const baseConfigFn = require("./karma.conf");

const integrationTestPaths = [
  "test/chart-types/**/*.spec.ts",
  "test/integration/**/*.spec.ts",
];

module.exports = (config) => {
  baseConfigFn(config);
  config.set({
    files: [
      ...integrationTestPaths,
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
      "test/chart-types/**/*.spec.ts": ["webpack"],
      "test/integration/**/*.spec.ts": ["webpack"],
    },
    // Relax coverage thresholds for integration-only runs
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
