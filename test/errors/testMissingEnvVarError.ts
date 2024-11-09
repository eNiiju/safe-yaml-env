import { assertEquals } from "jsr:@std/assert@1.0.6";
import { MissingEnvVarError } from "../../src/common/errors/missingEnvVarError.ts";

Deno.test("MissingEnvVarError should have a name property", () => {
  const error = new MissingEnvVarError("TEST_VAR");
  assertEquals(error.name, "MissingEnvVarError");
});

Deno.test("MissingEnvVarError should have a message property", () => {
  const error = new MissingEnvVarError("TEST_VAR");
  assertEquals(error.message, 'Environment variable "TEST_VAR" is not set');
});

Deno.test("MissingEnvVarError should have a toString method", () => {
  const error = new MissingEnvVarError("TEST_VAR");
  assertEquals(
    error.toString(),
    'MissingEnvVarError: Environment variable "TEST_VAR" is not set',
  );
});
