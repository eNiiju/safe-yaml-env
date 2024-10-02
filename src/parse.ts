import { parse } from "jsr:@std/yaml@1.0.5";
import { ZodSchema } from "npm:zod@3.23.8";
import { MissingEnvVarError } from "./error/missingEnvVarError.ts";

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
 * @throws {Deno.errors.NotFound} If the file is not found.
 * @throws {SyntaxError} If there's an issue parsing the YAM file.
 * @throws {MissingEnvVarError} If an environment variable is not set.
 * @throws {ZodError} If the file data doesn't conform to the schema.
 */
export async function loadYamlAsync(
  filePath: string,
  schema: ZodSchema,
): Promise<unknown> {
  // Read and parse the YAML file
  const file = await Deno.readTextFile(filePath);
  const data = parse(file) as DataObject;

  // Recursively process the object and replace environment variables
  const processedData = replaceEnvVars(data);

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
 * @throws {Deno.errors.NotFound} If the file is not found.
 * @throws {SyntaxError} If there's an issue parsing the YAM file.
 * @throws {MissingEnvVarError} If an environment variable is not set.
 * @throws {ZodError} If the file data doesn't conform to the schema.
 */
export function loadYaml(filePath: string, schema: ZodSchema): unknown {
  // Read and parse the YAML file
  const file = Deno.readTextFileSync(filePath);
  const data = parse(file) as DataObject;

  // Recursively process the object and replace environment variables
  const processedData = replaceEnvVars(data);

  // Validate the object using the Zod schema object
  const validatedData = schema.parse(processedData);

  return validatedData;
}

/**
 * Recursively process an object and replace any `${VAR}` with
 * the corresponding environment variable.
 *
 * @param data The input data to process.
 * @returns The processed data with environment variables replaced.
 * @throws {MissingEnvVarError} If an environment variable is not set.
 */
export function replaceEnvVars(data: Data): Data {
  // Replace environment variables in strings
  if (typeof data === "string") {
    return data.replace(/\\?\${(\w+)}/g, (match, envKey) => {
      // If the match starts with a backslash, ignore it (escaped)
      if (match.startsWith("\\")) {
        return match.slice(1);
      }

      const envValue = Deno.env.get(envKey);

      if (envValue === undefined) {
        throw new MissingEnvVarError(envKey);
      }

      return envValue;
    });
  }

  // Recursively process array elements
  if (Array.isArray(data)) {
    return data.map(replaceEnvVars);
  }

  // Recursively process object keys and values
  if (typeof data === "object" && data !== null) {
    const result: Record<string, Data> = {};
    for (const [key, value] of Object.entries(data)) {
      result[key] = replaceEnvVars(value);
    }
    return result;
  }

  // Return all other types as-is
  return data;
}
