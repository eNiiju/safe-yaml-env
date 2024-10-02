import { UnkownRuntimeError } from "./error/unknownRuntimeError.ts";

/**
 * Get the value of an environment variable.
 * Works with Node.js, Deno, Bun and Cloudflare Workers.
 * @param envKey The key of the environment variable to retrieve.
 * @returns The value of the environment variable, or `undefined` if it is not set.
 * @throws {Error} If the environment is unknown and environment variables cannot be retrieved.
 */
export function getEnvVar(envKey: string): string | undefined {
  const g = globalThis as {
    process?: unknown;
    Deno?: unknown;
    Bun?: unknown;
    addEventListener?: unknown;
  };

  if (typeof g.process !== "undefined") {
    // deno-lint-ignore no-explicit-any
    return (g.process as any).env[envKey];
  } else if (typeof g.Deno !== "undefined") {
    // deno-lint-ignore no-explicit-any
    return (g.Deno as any).env.get(envKey);
  } else if (typeof g.Bun !== "undefined") {
    // deno-lint-ignore no-explicit-any
    return (g.process as any).env[envKey];
  } else if (typeof g.addEventListener !== "undefined") {
    // deno-lint-ignore no-explicit-any
    return (g as any)[envKey];
  } else {
    throw new UnkownRuntimeError(
      "Could not find environment variables.",
    );
  }
}
