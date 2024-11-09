import { assertEquals } from "jsr:@std/assert@1.0.6";
import { FileNotFoundError } from "../../src/common/errors/fileNotFoundError.ts";

Deno.test("FileNotFoundError should have a name property", () => {
  const error = new FileNotFoundError("./config.yaml");
  assertEquals(error.name, "FileNotFoundError");
});

Deno.test("FileNotFoundError should have a message property", () => {
  const error = new FileNotFoundError("./config.yaml");
  assertEquals(error.message, 'File not found: "./config.yaml"');
});

Deno.test("FileNotFoundError should have a toString method", () => {
  const error = new FileNotFoundError("./config.yaml");
  assertEquals(
    error.toString(),
    'FileNotFoundError: File not found: "./config.yaml"',
  );
});
