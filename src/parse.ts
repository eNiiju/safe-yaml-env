import { parse } from "jsr:@std/yaml@1.0.5";
import { z, ZodObject, type ZodTypeAny } from "npm:zod@3.23.8";
import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { MissingEnvVarError } from "./error/missingEnvVarError.ts";
import { getEnvVar } from "./utils.ts";

/* Types */

type Data =
  | string
  | number
  | boolean
  | null
  | undefined
  | DataArray
  | DataObject;
interface DataArray extends Array<Data> {}
interface DataObject {
  [key: string]: Data;
}

/* Functions */

/**
 * Loads a YAML file asynchronously, processes environment variables, and validates the data against a schema.
 *
 * @param filePath The path to the YAML file to be loaded.
 * @param schema Zod schema object used to validate the loaded and processed data.
 * @returns The validated data that conforms to the provided schema.
 * @throws {NotFound} If the file is not found.
 * @throws {SyntaxError} If there's an issue parsing the YAM file.
 * @throws {UnkownRuntimeError} If the environment variables cannot be retrieved in the current JavaScript runtime.
 * @throws {MissingEnvVarError} If an environment variable is referenced but not set.
 * @throws {ZodError} If the file data doesn't conform to the schema.
 */
export async function loadYamlAsync(
  filePath: string,
  schema: ZodObject<Record<string, ZodTypeAny>>,
): Promise<z.infer<typeof schema>> {
  const file = await readFile(filePath, "utf8");
  const data = parse(file) as DataObject;

  // Retrieve default values from the Zod schema
  const defaults = getDefaultValues(schema);

  // Recursively process the object and replace environment variables
  const processedData = replaceEnvVars(data, defaults);

  // Validate the object using the Zod schema object
  const validatedData = schema.parse(processedData);

  return validatedData;
}

/**
 * Loads a YAML file, processes environment variables, and validates the data against a schema.
 *
 * @param filePath The path to the YAML file to be loaded.
 * @param schema Zod schema object used to validate the loaded and processed data.
 * @returns The validated data that conforms to the provided schema.
 * @throws {NotFound} If the file is not found.
 * @throws {SyntaxError} If there's an issue parsing the YAM file.
 * @throws {UnkownRuntimeError} If the environment variables cannot be retrieved in the current JavaScript runtime.
 * @throws {MissingEnvVarError} If an environment variable is referenced but not set.
 * @throws {ZodError} If the file data doesn't conform to the schema.
 */
export function loadYaml(
  filePath: string,
  schema: ZodObject<Record<string, ZodTypeAny>>,
): z.infer<typeof schema> {
  // Read and parse the YAML file
  const file = readFileSync(filePath, "utf8");
  const data = parse(file) as DataObject;

  // Retrieve default values from the Zod schema
  const defaults = getDefaultValues(schema);

  // Recursively process the object and replace environment variables
  const processedData = replaceEnvVars(data, defaults);

  // Validate the object using the Zod schema object
  const validatedData = schema.parse(processedData);

  return validatedData;
}

/**
 * Retrieves default values from a Zod schema object.
 * @param schema The Zod schema object to retrieve default values from.
 * @returns A map of default values for the schema object.
 */
export function getDefaultValues(
  schema: ZodObject<Record<string, ZodTypeAny>>,
): Map<string, unknown> {
  const defaults = new Map<string, unknown>();

  for (const key in schema.shape) {
    const fieldSchema = schema.shape[key] as ZodTypeAny;

    if (fieldSchema._def.defaultValue !== undefined) {
      defaults.set(key, fieldSchema._def.defaultValue());
    }
  }

  return defaults;
}

/**
 * Recursively process an object and replace any `${VAR}` with
 * the corresponding environment variable.
 *
 * @param data The input data to process.
 * @param defaults Default values for environment variables, used if no default
 * value is provided with the environment variable in the data.
 * @returns The processed data with environment variables replaced.
 * @throws {UnkownRuntimeError} If the environment variables cannot be retrieved in the current JavaScript runtime.
 * @throws {MissingEnvVarError} If an environment variable is referenced but not set.
 */
export function replaceEnvVars(
  data: Data,
  defaults?: Map<string, unknown>,
): Data {
  // Replace environment variables in strings
  if (typeof data === "string") {
    // Matches ${VAR} and ${VAR:-default_value}, taking into account escape character (\)
    const envVarRegex = /\\?\${(\w+)(?::-(.*?))?}/g;

    return data.replace(envVarRegex, (match, envKey, defaultValueFromYaml) => {
      // If the match starts with a backslash, ignore it (escaped)
      if (match.startsWith("\\")) {
        return match.slice(1);
      }

      const envValue = getEnvVar(envKey);
      const defaultEnvValueFromSchema = defaults
        ? defaults.get(envKey)
        : undefined;
      const defaultEnvValue = defaultValueFromYaml ?? defaultEnvValueFromSchema;

      if (envValue === undefined && defaultEnvValue === undefined) {
        throw new MissingEnvVarError(envKey);
      } else if (envValue === undefined) {
        // If there is a default value from the YAML file or the Zod schema, use it
        return defaultEnvValue;
      }

      return envValue;
    });
  }

  // Recursively process array elements
  if (Array.isArray(data)) {
    return data.map((d) => replaceEnvVars(d, defaults));
  }

  // Recursively process object keys and values
  if (typeof data === "object" && data !== null) {
    const result: Record<string, Data> = {};
    for (const [key, value] of Object.entries(data)) {
      result[key] = replaceEnvVars(value, defaults);
    }
    return result;
  }

  // Return all other types as-is
  return data;
}
