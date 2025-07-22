const Ajv = require('ajv');
// Add support for custom error messages
const ajvErrors = require('ajv-errors');
const ajv = new Ajv({
  allErrors: true,
  strict: "log", // Keep strict mode on, but just log warnings instead of throwing errors for this type of issue.
  allowMatchingProperties: true // This is the key that explicitly allows the overlap.
});
ajvErrors(ajv);

// --- Load ALL Grammars ---
const resourceManifestGrammar = require('../schemas/grammars/resourceManifestGrammar.json');
const formSchemaGrammar = require('../schemas/grammars/formSchemaGrammar.json');
const listSchemaGrammar = require('../schemas/grammars/listSchemaGrammar.json');

// --- Pre-compile the validators ---
const validateResourceManifest = ajv.compile(resourceManifestGrammar);
const validateFormSchema = ajv.compile(formSchemaGrammar);
const validateListSchema = ajv.compile(listSchemaGrammar);

// The function is now more generic
function validate(grammarType, dataToValidate) {
  let validator;
  switch (grammarType) {
    case 'manifest':
      validator = validateResourceManifest;
      break;
    case 'form':
      validator = validateFormSchema;
      break;
    case 'list':
      validator = validateListSchema;
      break;
    default:
      throw new Error(`Unknown grammar type: ${grammarType}`);
  }

  const isValid = validator(dataToValidate);
  return {
    valid: isValid,
    errors: isValid ? null : validator.errors,
  };
}

module.exports = { validate };