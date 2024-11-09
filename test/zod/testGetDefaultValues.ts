import { assertEquals } from "jsr:@std/assert@1.0.6";
import { z } from "npm:zod";
import { getDefaultValues } from "../../src/zod/lib/utils.ts";

Deno.test("getDefaultValues should return an empty map given an object with no default values", () => {
  const testSchema = z.object({
    name: z.string(),
    age: z.number(),
  });

  const defaults = getDefaultValues(testSchema);

  assertEquals(defaults, new Map());
});

Deno.test("getDefaultValues should return a map with default values given an object with default values", () => {
  const defaultName = "John Doe";
  const defaultAge = 30;

  const testSchema = z.object({
    name: z.string().default(defaultName),
    age: z.number().default(defaultAge),
  });

  const defaults = getDefaultValues(testSchema);

  assertEquals(defaults.get("name"), defaultName);
  assertEquals(defaults.get("age"), 30);
});
