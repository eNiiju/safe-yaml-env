/**
 * Error thrown when something isn't possible in the current JavaScript runtime.
 */
export class UnkownRuntimeError extends Error {
  /**
   * Creates a new UnkownRuntimeError instance.
   *
   * @param message Optional custom error message. If not provided, a default message is used.
   */
  constructor(message?: string) {
    super(message || "Unknown runtime error");
    this.name = "UnkownRuntimeError";

    // This line is necessary for proper prototype chain setup in TypeScript
    Object.setPrototypeOf(this, UnkownRuntimeError.prototype);
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
