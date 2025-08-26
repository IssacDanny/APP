// scripts/test-parser.js

// We use dynamic import() for our local modules because we are in a CommonJS context by default
// or need to handle ES Modules in Node correctly. A simpler way is to add "type": "module"
// to package.json, but this works universally.
async function runTests() {
  console.log('--- RUNNING PARSER UNIT TEST ---');

  // Dynamically import the parser function.
  // Note the path is relative to the project root.
  const { parseAdminPanelSchema } = await import('../src/compiler/parser.js');

  // --- Test Case 1: Valid Schema ---
  console.log('\n[TEST 1] Parsing a valid schema...');
  const validSchema = {
    panelName: "Terminal Test Panel",
    navigation: [{
      type: "resourceGroup",
      id: "test-group",
      title: "TESTING",
      resources: [{
        id: "items",
        name: "Test Items",
        endpoint: "/api/items",
        views: { listView: { type: "table", columns: [{ field: "id", header: "ID" }] } },
        actions: []
      }]
    }]
  };

  try {
    const ast = parseAdminPanelSchema(JSON.stringify(validSchema));
    console.log('✅ SUCCESS: Parser returned an AST object.');
    // To keep the output clean, we won't print the whole AST here,
    // but you could uncomment the next line for deep inspection.
    // console.log(JSON.stringify(ast, null, 2));
  } catch (e) {
    console.error('❌ FAILURE: Parser threw an error on a valid schema:', e.message);
  }


  // --- Test Case 2: Invalid Schema (Missing required property 'name') ---
  console.log('\n[TEST 2] Parsing an invalid schema (missing required property)...');
  const invalidSchema = {
    panelName: "Broken Panel",
    navigation: [{
      type: "resourceGroup",
      id: "test-group",
      title: "TESTING",
      resources: [{
        id: "items",
        // "name": "Test Items", // <-- Missing 'name'
        endpoint: "/api/items",
        views: { listView: { type: "table", columns: [] } },
        actions: []
      }]
    }]
  };

  try {
    parseAdminPanelSchema(JSON.stringify(invalidSchema));
    console.error('❌ FAILURE: Parser did NOT throw an error on an invalid schema.');
  } catch (e) {
    console.log('✅ SUCCESS: Parser correctly threw an error.');
    // We can even check if the error message is what we expect.
    if (e.message.includes("must have required property 'name'")) {
        console.log('   -> Error message is correct.');
    } else {
        console.error('   -> Unexpected error message:', e.message);
    }
  }


  // --- Test Case 3: Malformed JSON ---
  console.log('\n[TEST 3] Parsing a malformed JSON string...');
  const malformedJson = '{"panelName": "Test"'; // Missing closing brace and navigation

  try {
    parseAdminPanelSchema(malformedJson);
    console.error('❌ FAILURE: Parser did NOT throw an error on malformed JSON.');
  } catch(e) {
    console.log('✅ SUCCESS: Parser correctly threw an error.');
    if (e.message.includes('Invalid JSON format')) {
        console.log('   -> Error message is correct.');
    } else {
        console.error('   -> Unexpected error message:', e.message);
    }
  }

  console.log('\n--- PARSER UNIT TEST COMPLETE ---');
}

runTests();