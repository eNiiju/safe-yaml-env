import { z } from "npm:zod@3.23.8";
import { assertEquals } from "jsr:@std/assert@1.0.6";
import { getDefaultValues } from "../src/parse.ts";

Deno.test("getDefaultValues should return default values from Zod schema", () => {
  const schema = z.object({
    name: z.string().default("John Doe"),
    age: z.number().default(30),
    isStudent: z.boolean().default(true),
  });

  const expected = new Map<string, unknown>();
  expected.set("name", "John Doe");
  expected.set("age", 30);
  expected.set("isStudent", true);

  assertEquals(getDefaultValues(schema), expected);
});

Deno.test("getDefaultValues should only return the default values", () => {
  const schema = z.object({
    name: z.string().default("John Doe"),
    age: z.number(),
    isStudent: z.boolean().default(true),
  });

  const expected = new Map<string, unknown>();
  expected.set("name", "John Doe");
  expected.set("isStudent", true);

  assertEquals(getDefaultValues(schema), expected);
});

Deno.test("getDefaultValues should return empty map for schema without defaults", () => {
  const schema = z.object({
    name: z.string(),
    age: z.number(),
    isStudent: z.boolean(),
  });

  assertEquals(getDefaultValues(schema), new Map<string, unknown>());
});

Deno.test("getDefaultValues should return empty map for empty schema", () => {
  const schema = z.object({});

  assertEquals(getDefaultValues(schema), new Map<string, unknown>());
});
