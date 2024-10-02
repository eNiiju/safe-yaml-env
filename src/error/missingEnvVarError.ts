/**
 * Custom error class for missing environment variables.
 * This error is thrown when an expected environment variable is not set.
 */
export class MissingEnvVarError extends Error {
  /**
   * The name of the missing environment variable.
   */
  public readonly envVarKey: string;

  /**
   * Creates a new MissingEnvVarError instance.
   *
   * @param envVarName The name of the missing environment variable.
   * @param message Optional custom error message. If not provided, a default message is used.
   */
  constructor(envVarKey: string, message?: string) {
    super(message || `Environment variable "${envVarKey}" is not set`);
    this.name = "MissingEnvVarError";
    this.envVarKey = envVarKey;

    // This line is necessary for proper prototype chain setup in TypeScript
    Object.setPrototypeOf(this, MissingEnvVarError.prototype);
  }

  /**
   * Returns a string representation of the error.
   *
   * @returns A string describing the error.
   */
  override toString(): string {
    return `${this.name}: ${this.message}`;
  }
}
