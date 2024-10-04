/**
 * Custom error class for missing files.
 * This error is thrown when a file is not found.
 */
export class FileNotFoundError extends Error {
  /**
   * The path to the missing file.
   */
  public readonly filePath: string;

  /**
   * Creates a new FileNotFoundError instance.
   *
   * @param filePath The path to the missing file.
   * @param message Optional custom error message. If not provided, a default message is used.
   */
  constructor(filePath: string, message?: string) {
    super(message || `File not found: "${filePath}"`);
    this.name = "FileNotFoundError";
    this.filePath = filePath;

    // This line is necessary for proper prototype chain setup in TypeScript
    Object.setPrototypeOf(this, FileNotFoundError.prototype);
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
