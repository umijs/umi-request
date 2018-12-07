import nodeResolve from "rollup-plugin-node-resolve";
import babel from "rollup-plugin-babel";
import commonjs from "rollup-plugin-commonjs";
import { eslint } from "rollup-plugin-eslint";
import { uglify } from "rollup-plugin-uglify";

const env = process.env.NODE_ENV;

const config = {
  input: "src/index.js",
  output: {
    format: "umd",
    name: "afx-request",
    file: "dist/index.js",
    exports: "named",
    globals: {
      "query-string": "queryString"
    }
  },

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

if (env === "production") {
  config.plugins.push(uglify());
}

export default config;
