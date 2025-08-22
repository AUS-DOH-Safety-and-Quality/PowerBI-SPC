import powerbiVisualsConfigs from "eslint-plugin-powerbi-visuals";

export default [
    powerbiVisualsConfigs.configs.recommended,
    {
        ignores: [
            "node_modules/**",
            "dist/**",
            ".vscode/**",
            ".tmp/**",
            "test/**",
            "coverage/**",
            "rollup.config.js",
            "karma.conf.ts",
            "test.webpack.config.js"
        ]
    },
];
