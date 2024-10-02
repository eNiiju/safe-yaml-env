import { assertEquals, assertThrows } from "jsr:@std/assert@1.0.6";
import { replaceEnvVars } from "../src/parse.ts";
import { MissingEnvVarError } from "../src/error/missingEnvVarError.ts";

Deno.test("replaceEnvVars should replace environment variables in strings", () => {
  Deno.env.set("TEST_VAR", "test_value");
  const input = "Hello ${TEST_VAR}!";
  const expected = "Hello test_value!";
  assertEquals(replaceEnvVars(input), expected);
});

Deno.test("replaceEnvVars should throw MissingEnvVarError for undefined variables", () => {
  Deno.env.delete("UNDEFINED_VAR");
  assertThrows(
    () => replaceEnvVars("${UNDEFINED_VAR}"),
    MissingEnvVarError,
  );
});

Deno.test("replaceEnvVars should handle nested objects and arrays", () => {
  Deno.env.set("NESTED_VAR", "nested_value");
  const input = {
    key1: "Value with ${NESTED_VAR}",
    key2: [1, "${NESTED_VAR}", { nestedKey: "${NESTED_VAR}" }],
  };
  const expected = {
    key1: "Value with nested_value",
    key2: [1, "nested_value", { nestedKey: "nested_value" }],
  };
  assertEquals(replaceEnvVars(input), expected);
});
