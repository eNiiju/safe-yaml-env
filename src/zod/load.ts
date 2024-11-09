import { readFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { parse } from "jsr:@std/yaml@1.0.5";
import type { infer as Infer, ZodObject, ZodTypeAny } from "npm:zod";
import { FileNotFoundError } from "../common/errors/fileNotFoundError.ts";
import { replaceEnvVars } from "../common/utils.ts";
import { DataObject } from "../common/types.ts";
import { getDefaultValues } from "./lib/utils.ts";

/**
 * Loads a YAML file, processes environment variables, and validates the data against a schema.
 *
 * @param filePath The path to the YAML file to be loaded.
 * @param schema Zod schema object used to validate the loaded and processed data.
 * @returns The validated data that conforms to the provided schema.
 * @throws {FileNotFoundError} If the file is not found.
 * @throws {SyntaxError} If there's an issue parsing the YAM file.
 * @throws {MissingEnvVarError} If an environment variable is referenced but not set.
 * @throws {ZodError} If the file data doesn't conform to the schema.
 */
export function load(
  filePath: string,
  schema: ZodObject<Record<string, ZodTypeAny>>,
): Infer<typeof schema> {
  // Read and parse the YAML file
  let file: string;
  try {
    file = readFileSync(filePath, "utf8");
  } catch (_error) {
    throw new FileNotFoundError(filePath);
  }

  // Parse the file's content as an object
  const data = parse(file) as DataObject;

  // Retrieve default values from the Zod schema
  const defaultsValues = getDefaultValues(schema);

  // Recursively process the object and replace environment variables
  const processedData = replaceEnvVars(data, defaultsValues);

  // Validate the object using the Zod schema object
  const validatedData = schema.parse(processedData);

  return validatedData;
}

/**
 * Loads a YAML file asynchronously, processes environment variables, and validates the data against a schema.
 *
 * @param filePath The path to the YAML file to be loaded.
 * @param schema Zod schema object used to validate the loaded and processed data.
 * @returns The validated data that conforms to the provided schema.
 * @throws {FileNotFoundError} If the file is not found.
 * @throws {SyntaxError} If there's an issue parsing the YAM file.
 * @throws {MissingEnvVarError} If an environment variable is referenced but not set.
 * @throws {ZodError} If the file data doesn't conform to the schema.
 */
export async function loadAsync(
  filePath: string,
  schema: ZodObject<Record<string, ZodTypeAny>>,
): Promise<Infer<typeof schema>> {
  // Read the YAML file
  let file: string;
  try {
    file = await readFile(filePath, "utf8");
  } catch (_error) {
    throw new FileNotFoundError(filePath);
  }

  // Parse the file's content as an object
  const data = parse(file) as DataObject;

  // Retrieve default values from the Zod schema
  const defaultValues = getDefaultValues(schema);

  // Recursively process the object and replace environment variables
  const processedData = replaceEnvVars(data, defaultValues);

  // Validate the object using the Zod schema object
  const validatedData = schema.parse(processedData);

  return validatedData;
}
