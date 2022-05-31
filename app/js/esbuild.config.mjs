import esbuild from "esbuild";
import babel from "esbuild-plugin-babel";

esbuild
  .build({
    entryPoints: ["index.js"],
    bundle: true,
    outfile: "main.js",
    plugins: [
      babel({
        filter: /.*/,
        namespace: "",
        config: {
          presets: [
            [
              "@babel/preset-env",
              {
                useBuiltIns: "entry",
                corejs: "3.22",
              },
            ],
          ],
        },
      }),
    ],
    target: ["es5"],
    minify: true,
  })
  .catch(() => process.exit(1));
