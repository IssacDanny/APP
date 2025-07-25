import Ajv from "ajv";
import addFormats from "ajv-formats";

// Import the root of our AST and the factory which it uses internally.
import { AdminPanelNode } from './astNodes.js'; 

// Import the grammar (the meta-schema) we will validate against.
import adminPanelMetaSchema from '../schemas/adminPanelMetaSchema.json';

// --- AJV Setup ---
// Initialize and configure AJV once for the module. This is more efficient
// than creating a new instance for every parse operation.
const ajv = new Ajv({ allErrors: true });
addFormats(ajv, ['uri-relative']); // For formats like 'uri-relative'

// Compile the schema into a validation function. This is a significant
// performance optimization, as AJV doesn't have to re-process the schema every time.
const validate = ajv.compile(adminPanelMetaSchema);


/**
 * The main parser function for the Admin Panel generator.
 * It orchestrates the entire "compilation" pipeline:
 * 1. Parses the raw JSON string into a JavaScript object.
 * 2. Validates the object against the official admin panel meta-schema.
 * 3. Constructs a rich Abstract Syntax Tree (AST) from the validated object.
 *
 * @param {string} jsonString The raw JSON schema string received from the backend.
 * @returns {AdminPanelNode} The root node of the constructed AST.
 * @throws {Error} Throws an error if the JSON is malformed, if schema validation fails,
 *                 or if AST construction fails.
 */
export function parseAdminPanelSchema(jsonString) {
  let parsedJson;

  // --- Step 1: Parse the raw JSON string ---
  try {
    parsedJson = JSON.parse(jsonString);
  } catch (e) {
    // This catches errors like unclosed brackets, etc.
    console.error("Fatal: Input string is not valid JSON.", e);
    throw new Error(`Invalid JSON format: ${e.message}`);
  }

  // --- Step 2: Validate against the meta-schema (the "grammar") ---
  const isValid = validate(parsedJson);
  if (!isValid) {
    // Format the errors from AJV to be more readable.
    const errorDetails = validate.errors
      .map(err => `  - Path: ${err.instancePath || '/'} | Message: ${err.message}`)
      .join('\n');
      
    console.error("Fatal: Schema validation failed. The provided schema does not conform to the grammar.", validate.errors);
    throw new Error(`Schema validation failed. Details:\n${errorDetails}`);
  }

  console.log("Schema validation successful.");

  // --- Step 3: Construct the AST ---
  // If validation passed, we can proceed with confidence that the structure is correct
  // and our AST node constructors will not fail on missing properties.
  try {
    const astRoot = new AdminPanelNode(parsedJson);
    console.log("AST construction successful.");
    return astRoot;
  } catch(e) {
    // This is a safety net. If an error occurs here, it likely indicates a mismatch
    // between the meta-schema and the AST node constructor logic.
    console.error("Fatal: Failed to construct AST even after validation passed.", e);
    throw new Error(`Failed to construct AST: ${e.message}`);
  }
}