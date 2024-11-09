import process from "node:process";
import type { Data } from "./types.ts";
import { MissingEnvVarError } from "./errors/missingEnvVarError.ts";

/**
 * Recursively process an object and replace any `${VAR}` with
 * the corresponding environment variable.
 *
 * @param data The input data to process.
 * @param defaultValues Default values for environment variables, used if no default
 * value is provided with the environment variable in the data.
 * @returns The processed data with environment variables replaced.
 * @throws {MissingEnvVarError} If an environment variable is referenced but not set.
 */
export function replaceEnvVars(
  data: Data,
  defaultValues?: Map<string, Data>,
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

      const envValue = process.env[envKey];
      const defaultEnvValueFromSchema = defaultValues
        ? defaultValues.get(envKey)
        : undefined;
      const defaultEnvValue = defaultValueFromYaml ?? defaultEnvValueFromSchema;

      if (envValue === undefined && defaultEnvValue === undefined) {
        // If there is no env value nor default value, throw an error
        throw new MissingEnvVarError(envKey);
      } else if (envValue === undefined) {
        // If there is no env value but there is a default value from the YAML file or the Zod schema, use it
        return defaultEnvValue;
      }

      return envValue;
    });
  }

  // Recursively process array elements
  if (Array.isArray(data)) {
    return data.map((d) => replaceEnvVars(d, defaultValues));
  }

  // Recursively process object keys and values
  if (typeof data === "object" && data !== null) {
    const result: Record<string, Data> = {};
    for (const [key, value] of Object.entries(data)) {
      result[key] = replaceEnvVars(value, defaultValues);
    }
    return result;
  }

  // Return all other types as-is
  return data;
}
