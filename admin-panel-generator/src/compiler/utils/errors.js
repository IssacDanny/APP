/**
 * A custom error class for parsing-related failures.
 * This allows for more specific error handling in the application.
 */
export class ParserError extends Error {
  constructor(message, details = null) {
    super(message);
    this.name = "ParserError";
    // `details` can hold extra information, like the array of AJV validation errors.
    this.details = details;
  }
}

// You could add other custom errors here later, e.g., LinkerError