import { assertEquals, assertRejects } from "jsr:@std/assert@1.0.6";
import { z, ZodError } from "npm:zod@3.23.8";
import { loadAsync } from "../../src/zod/load.ts";
import { MissingEnvVarError } from "../../src/common/errors/missingEnvVarError.ts";
import { FileNotFoundError } from "../../src/common/errors/fileNotFoundError.ts";

Deno.test("loadAsync should load and validates YAML file", async () => {
  const testSchema = z.object({
    name: z.string(),
    age: z.number(),
  });

  // Create a temporary YAML file for testing
  const testName = "TestUser";
  const testAge = 30;
  const yamlContent = `
      name: ${testName}
      age: ${testAge}
    `;
  const tempFile = await Deno.makeTempFile({ suffix: ".yaml" });
  await Deno.writeTextFile(tempFile, yamlContent);

  // Load and validate the YAML file
  try {
    const result = await loadAsync(tempFile, testSchema);
    assertEquals(result, {
      name: testName,
      age: testAge,
    });
  } finally {
    await Deno.remove(tempFile);
  }
});

Deno.test("loadAsync should throw error for invalid schema", async () => {
  const invalidSchema = z.object({
    name: z.number(), // Intentionally wrong type
  });

  // Create a temporary YAML file for testing
  const testName = "TestUser";
  const yamlContent = `
      name: ${testName}
    `;
  const tempFile = await Deno.makeTempFile({ suffix: ".yaml" });
  await Deno.writeTextFile(tempFile, yamlContent);

  // Load and validate the YAML file
  try {
    assertRejects(
      () => loadAsync(tempFile, invalidSchema),
      ZodError,
    );
  } finally {
    await Deno.remove(tempFile);
  }
});

Deno.test("loadAsync should throw error for missing file", () => {
  assertRejects(
    () => loadAsync("nonexistent.yaml", z.object({})),
    FileNotFoundError,
  );
});

Deno.test("loadAsync should throw error for missing environment variable", async () => {
  const testSchema = z.object({
    name: z.string(),
  });

  // Create a temporary YAML file for testing
  Deno.env.delete("TEST_NAME");
  const testName = "${TEST_NAME}";
  const yamlContent = `
      name: ${testName}
    `;
  const tempFile = await Deno.makeTempFile({ suffix: ".yaml" });
  await Deno.writeTextFile(tempFile, yamlContent);

  // Load and validate the YAML file
  assertRejects(
    () => loadAsync(tempFile, testSchema),
    MissingEnvVarError,
  );

  await Deno.remove(tempFile);
});

Deno.test("loadAsync should throw error when there are two yaml documents in one file", async () => {
  const testSchema = z.object({
    name: z.string(),
  });

  // Create a temporary YAML file for testing
  const yamlContent = `
      ---
      name: TestUser
      ---
      name: TestUser2
    `;
  const tempFile = await Deno.makeTempFile({ suffix: ".yaml" });
  await Deno.writeTextFile(tempFile, yamlContent);

  // Load and validate the YAML file
  assertRejects(
    () => loadAsync(tempFile, testSchema),
    SyntaxError,
  );

  await Deno.remove(tempFile);
});

Deno.test("loadAsync should replace environment variables in strings", async () => {
  const testSchema = z.object({
    name: z.string(),
  });

  // Create a temporary YAML file for testing
  const testNameEnv = "TestUser";
  Deno.env.set("TEST_NAME", testNameEnv);
  const testName = "${TEST_NAME}";
  const yamlContent = `
      name: ${testName}
    `;
  const tempFile = await Deno.makeTempFile({ suffix: ".yaml" });
  await Deno.writeTextFile(tempFile, yamlContent);

  // Load and validate the YAML file
  const result = await loadAsync(tempFile, testSchema);
  assertEquals(result, {
    name: testNameEnv,
  });

  await Deno.remove(tempFile);
});

Deno.test("loadAsync should handle default values from the Zod schema", async () => {
  const testSchema = z.object({
    name: z.string(),
    age: z.number().default(25),
  });

  // Create a temporary YAML file for testing
  const yamlContent = `
      name: Loris Ipsum
    `;
  const tempFile = await Deno.makeTempFile({ suffix: ".yaml" });
  await Deno.writeTextFile(tempFile, yamlContent);

  // Load and validate the YAML file
  const result = await loadAsync(tempFile, testSchema);
  assertEquals(result, {
    name: "Loris Ipsum",
    age: 25,
  });

  await Deno.remove(tempFile);
});
