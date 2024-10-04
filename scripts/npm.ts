import { build, emptyDir } from "@deno/dnt";

const VERSION = JSON.parse(Deno.readTextFileSync("./jsr.json")).version;
const OUT_DIR = "./dist_npm";

if (!VERSION) {
  throw new Error("Version not found in jsr.json");
}

console.log(`Building npm package version ${VERSION}...`);

await emptyDir(OUT_DIR);

await build({
  entryPoints: ["./src/mod.ts"],
  outDir: OUT_DIR,
  shims: {
    // see JS docs for overview and more options
    deno: true,
  },
  package: {
    // package.json properties
    name: "safe-yaml-env",
    version: VERSION,
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
    Deno.copyFileSync("LICENSE", `${OUT_DIR}/LICENSE`);
    Deno.copyFileSync("npm/README.md", `${OUT_DIR}/README.md`);

    console.log(`NPM package built successfully inside ${OUT_DIR}!`);
  },
});
