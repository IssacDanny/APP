// scripts/test-visitor.js

// Using Node's built-in assertion library for testing
import assert from 'assert/strict';

// We need to import our compiler components. Since this is a Node script
// and not part of the Vite build, we use relative paths from the root.
import { parseAdminPanelSchema } from '../src/compiler/parser.js';
import { UIGeneratorVisitor } from '../src/compiler/visitor.js';

// --- Test Data ---
// A minimal but complete schema for testing purposes.
const testSchema = {
  panelName: "Test Panel",
  navigation: [
    {
      type: "resourceGroup",
      id: "test-group",
      title: "TESTING",
      resources: [
        {
          id: "widgets",
          name: "Widgets",
          endpoint: "/api/widgets",
          views: {
            listView: {
              type: "table",
              columns: [{ field: "name", header: "Widget Name" }],
            },
          },
          actions: [
            {
              type: "form",
              id: "create-widget",
              name: "Create",
              target: "global",
              method: "POST",
              endpoint: "/api/widgets",
              formSchema: { schema: { title: "New Widget" } },
            },
            {
              type: "simpleAction",
              id: "delete-widget",
              name: "Delete",
              target: "item",
              method: "DELETE",
              endpoint: "/api/widgets/{id}",
              confirmationText: "Are you sure?",
            },
          ],
        },
      ],
    },
    {
        type: "userMenu",
        id: "user",
        title: "USER",
        items: [{
            type: "navigationLink",
            id: "profile",
            name: "My Profile",
            targetResource: "users"
        }]
    }
  ],
};


// --- Test Runner Logic ---
function runTests() {
  console.log("🚀 Starting UIGeneratorVisitor tests...");
  let astRoot, visitor, ir;

  try {
    // Setup: Parse the schema into an AST
    const schemaString = JSON.stringify(testSchema);
    astRoot = parseAdminPanelSchema(schemaString);
    
    // Instantiate the visitor
    visitor = new UIGeneratorVisitor();
    
    // Action: Run the visitor on the AST root
    ir = astRoot.accept(visitor);
  } catch(e) {
    console.error("❌ Test setup failed:", e.message);
    process.exit(1); // Exit with an error code
  }
  
  // --- Assertions ---

  // Test 1: Check the root AppShell component
  assert.strictEqual(ir.component, 'AppShell', 'Test 1 Failed: Root component should be AppShell');
  assert.strictEqual(ir.props.title, 'Test Panel', 'Test 1 Failed: Panel title is incorrect');
  console.log("✅ Test 1 Passed: Root AppShell IR is correct.");

  // Test 2: Check the navigation structure
  assert.strictEqual(ir.props.navigation.length, 2, 'Test 2 Failed: Should be 2 top-level nav items');
  const navGroup = ir.props.navigation[0];
  const userMenu = ir.props.navigation[1];
  assert.strictEqual(navGroup.component, 'NavMenuGroup', 'Test 2 Failed: First nav item should be NavMenuGroup');
  assert.strictEqual(userMenu.component, 'UserMenu', 'Test 2 Failed: Second nav item should be UserMenu');
  console.log("✅ Test 2 Passed: Navigation structure is correct.");

  // Test 3: Check the NavLink within the NavMenuGroup
  const navLink = navGroup.props.children[0];
  assert.strictEqual(navLink.component, 'NavLink', 'Test 3 Failed: NavMenuGroup child should be a NavLink');
  assert.strictEqual(navLink.props.text, 'Widgets', 'Test 3 Failed: NavLink text is incorrect');
  assert.strictEqual(navLink.props.to, '/resources/widgets', 'Test 3 Failed: NavLink "to" path is incorrect');
  console.log("✅ Test 3 Passed: NavLink generation is correct.");
  
  // Test 4: Check the routes collected by the visitor
  const routes = ir.props.routes;
  assert.strictEqual(routes.length, 1, 'Test 4 Failed: Should have collected 1 route');
  const widgetRoute = routes[0];
  assert.strictEqual(widgetRoute.path, '/resources/widgets', 'Test 4 Failed: Route path is incorrect');
  assert.strictEqual(widgetRoute.element.component, 'ResourcePageLayout', 'Test 4 Failed: Route element should be a ResourcePageLayout');
  console.log("✅ Test 4 Passed: Route collection is correct.");
  
  // Test 5: Check the actions on the resource page
  const pageLayout = widgetRoute.element;
  const globalActions = pageLayout.props.globalActions;
  const itemActions = pageLayout.props.listView.props.itemActions;

  assert.strictEqual(globalActions.length, 1, 'Test 5 Failed: Should have 1 global action');
  assert.strictEqual(itemActions.length, 1, 'Test 5 Failed: Should have 1 item action');
  assert.strictEqual(globalActions[0].component, 'FormButton', 'Test 5 Failed: Global action should be a FormButton');
  assert.strictEqual(itemActions[0].component, 'ActionButton', 'Test 5 Failed: Item action should be an ActionButton');
  console.log("✅ Test 5 Passed: Global and item actions are correctly separated.");

  // Test 6: Check the data inside an action's config
  const formActionConfig = globalActions[0].props.actionConfig;
  assert.deepStrictEqual(formActionConfig.formSchema, { schema: { title: "New Widget" } }, 'Test 6 Failed: Form schema was not passed correctly');
  assert.strictEqual(formActionConfig.method, 'POST', 'Test 6 Failed: Form action method is incorrect');
  console.log("✅ Test 6 Passed: Action configuration data is correct.");

  console.log("\n🎉 All visitor tests passed successfully!");
}

// Run the tests
runTests();