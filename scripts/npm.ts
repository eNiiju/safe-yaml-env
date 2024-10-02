import { build, emptyDir } from "@deno/dnt";

await emptyDir("./npm");

await build({
  entryPoints: ["./src/mod.ts"],
  outDir: "./npm",
  shims: {
    // see JS docs for overview and more options
    deno: true,
  },
  package: {
    // package.json properties
    name: "safe-yaml-env",
    version: Deno.args[0],
    description:
      "Parse YAML files safely using Zod with environment variables and default values support.",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/eNiiju/safe-yaml-env.git",
    },
    bugs: {
      url: "https://github.com/eNiiju/safe-yaml-env/issues",
    },
  },
  postBuild() {
    // steps to run after building and before running the tests
    Deno.copyFileSync("LICENSE", "npm/LICENSE");
    Deno.copyFileSync("README.md", "npm/README.md");
  },
});
