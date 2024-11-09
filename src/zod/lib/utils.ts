import type { ZodObject, ZodTypeAny } from "npm:zod@3.23.8";
import { Data } from "../../common/types.ts";

/**
 * Retrieves default values from a Zod schema object.
 * @param schema The Zod schema object to retrieve default values from.
 * @returns A map of default values for the schema object.
 */
export function getDefaultValues(
  schema: ZodObject<Record<string, ZodTypeAny>>,
): Map<string, Data> {
  const defaults = new Map<string, Data>();

  for (const key in schema.shape) {
    const fieldSchema = schema.shape[key];

    if (fieldSchema._def.defaultValue !== undefined) {
      defaults.set(key, fieldSchema._def.defaultValue());
    }
  }

  return defaults;
}
