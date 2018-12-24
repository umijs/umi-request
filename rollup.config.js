import nodeResolve from "rollup-plugin-node-resolve";
import babel from "rollup-plugin-babel";
import commonjs from "rollup-plugin-commonjs";
import { eslint } from "rollup-plugin-eslint";
import { terser } from "rollup-plugin-terser";
import { uglify } from "rollup-plugin-uglify";
import pkg from "./package.json";

const env = process.env.NODE_ENV;

const outputOpts = {
  name: "umi-request",
  exports: "named",
  globals: {
    "query-string": "queryString"
  }
};

const config = {
  input: "src/index.js",
  plugins: [
    nodeResolve(),
    babel({
      exclude: "node_modules/**",
      runtimeHelpers: true
    }),
    commonjs(),
    eslint({
      include: "./src"
    })
  ],
  external: ["query-string", "whatwg-fetch"]
};

/**
 * 这样分开写是由于 terser 一个 Bug. https://github.com/TrySound/rollup-plugin-terser/issues/5
 * 同时 umd 包用 uglify 是为了避免打包进 es6 语法, 导致 IE 等出错.
 * */
export default [
  {
    output: {
      ...outputOpts,
      format: "umd",
      file: pkg.main
    },
    ...config,
    plugins: [...config.plugins, ...(env === "production" ? [uglify()] : [])]
  },
  {
    output: {
      ...outputOpts,
      format: "es",
      file: pkg.module
    },
    ...config,
    plugins: [...config.plugins, ...(env === "production" ? [terser()] : [])]
  }
];
