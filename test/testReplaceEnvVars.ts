import { assertEquals, assertThrows } from "jsr:@std/assert@1.0.6";
import { replaceEnvVars } from "../src/common/utils.ts";
import { MissingEnvVarError } from "../src/common/errors/missingEnvVarError.ts";

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

Deno.test("replaceEnvVars should handle default values from YAML", () => {
  Deno.env.delete("DEFAULT_VAR");
  const input = "${DEFAULT_VAR:-default_value}";
  const expected = "default_value";
  assertEquals(replaceEnvVars(input), expected);
});

Deno.test("replaceEnvVars should handle default values from schema", () => {
  Deno.env.delete("DEFAULT_VAR");
  const defaults = new Map([["DEFAULT_VAR", "default_value"]]);
  const input = "${DEFAULT_VAR}";
  const expected = "default_value";
  assertEquals(replaceEnvVars(input, defaults), expected);
});

Deno.test("replaceEnvVars should handle escape characters", () => {
  Deno.env.set("ESCAPE_VAR", "escape_value");
  const input = "\\${ESCAPE_VAR}";
  const expected = "${ESCAPE_VAR}";
  assertEquals(replaceEnvVars(input), expected);
});

Deno.test("replaceEnvVars should handle multiple variables", () => {
  Deno.env.set("VAR1", "value1");
  Deno.env.set("VAR2", "value2");
  const input = "${VAR1} and ${VAR2}";
  const expected = "value1 and value2";
  assertEquals(replaceEnvVars(input), expected);
});

Deno.test("replaceEnvVars should handle multiple variables with default values", () => {
  Deno.env.delete("VAR1");
  Deno.env.set("VAR2", "value2");
  const input = "${VAR1:-default1} and ${VAR2}";
  const expected = "default1 and value2";
  assertEquals(replaceEnvVars(input), expected);
});

Deno.test("replaceEnvVars should handle multiple variables with schema default values", () => {
  Deno.env.delete("VAR1");
  Deno.env.set("VAR2", "value2");
  const defaults = new Map([["VAR1", "default1"]]);
  const input = "${VAR1} and ${VAR2}";
  const expected = "default1 and value2";
  assertEquals(replaceEnvVars(input, defaults), expected);
});
