import Ajv from "ajv";
import addFormats from "ajv-formats";

// 1. Update the import to use the clean 'ast' module path.
import { AdminPanelNode } from './ast'; 
import adminPanelMetaSchema from '../schemas/adminPanelMetaSchema.json';

// 2. Import our new custom error.
import { ParserError } from './utils/errors.js';

// --- AJV Setup ---
const ajv = new Ajv({ allErrors: true });
addFormats(ajv, ['uri']); // Using 'uri' is generally more robust

const validate = ajv.compile(adminPanelMetaSchema);


/**
 * Orchestrates the parsing and validation of the admin panel schema.
 * @param {string} jsonString The raw JSON schema string.
 * @returns {AdminPanelNode} The root node of the constructed AST.
 * @throws {ParserError} Throws a custom error for specific parsing and validation failures.
 */
export function parseAdminPanelSchema(jsonString) {
  // --- Step 1: Parse ---
  const parsedJson = parseJson(jsonString);

  // --- Step 2: Validate ---
  validateSchema(parsedJson);
  
  // --- Step 3: Construct AST ---
  return constructAst(parsedJson);
}


// --- Helper Functions for Clarity ---

/**
 * Parses a JSON string into a JavaScript object.
 * @param {string} jsonString
 * @returns {object} The parsed object.
 * @throws {ParserError} If the string is not valid JSON.
 */
function parseJson(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("Fatal: Input string is not valid JSON.", e);
    // 3. Use the custom error class.
    throw new ParserError(`Invalid JSON format: ${e.message}`);
  }
}

/**
 * Validates the parsed JSON object against the meta-schema.
 * @param {object} data The parsed JSON data.
 * @throws {ParserError} If schema validation fails.
 */
function validateSchema(data) {
  const isValid = validate(data);
  if (!isValid) {
    const errorDetails = (validate.errors || [])
      .map(err => `  - Path: ${err.instancePath || '/'} | Message: ${err.message}`)
      .join('\n');
      
    console.error("Fatal: Schema validation failed.", validate.errors);
    // 4. Use the custom error, passing the AJV errors as details.
    throw new ParserError(`Schema validation failed. Details:\n${errorDetails}`, validate.errors);
  }
  console.log("Schema validation successful.");
}

/**
 * Constructs the Abstract Syntax Tree from the validated data.
 * @param {object} data The validated JSON data.
 * @returns {AdminPanelNode} The root of the AST.
 * @throws {ParserError} If AST construction fails unexpectedly.
 */
function constructAst(data) {
  try {
    const astRoot = new AdminPanelNode(data);
    console.log("AST construction successful.");
    return astRoot;
  } catch(e) {
    console.error("Fatal: Failed to construct AST even after validation passed.", e);
    // 5. Use the custom error here as well.
    throw new ParserError(`Failed to construct AST: ${e.message}`);
  }
}