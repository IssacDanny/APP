#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ADAPTERS_DIR = path.resolve(__dirname, '..', 'src', 'adapters');

// --- TEMPLATE STRINGS ---
const ADAPTER_TEMPLATE = (serviceName, envVarName) => `
import { Router } from 'express';
import { createAdapter } from '../../core/Adapter.js';
import { proxyRequest } from '../../core/utils/proxy.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const schema = require('./schema.json');

// --- 1. Define the function that returns the Express router ---
// This is the main place for a developer to add their custom logic.
function getRoutes() {
  const SERVICE_URL = process.env.${envVarName};

  if (!SERVICE_URL) {
    throw new Error("FATAL: ${envVarName} is not defined for the ${serviceName} service.");
  }

  const router = Router();

  // --- (OPTIONAL) CUSTOM ROUTES ---
  /*
   * To handle a specific path differently, define its route here,
   * ABOVE the generic proxy handler.
   *
   * Example:
   * router.get('/special-route', (req, res, next) => {
   *   res.json({ message: 'This is a custom response!' });
   * });
  */

  // --- GENERIC PROXY HANDLER (Catch-all) ---
  router.all(/^\/.*/, async (req, res, next) => {
    try {
      const { status, data } = await proxyRequest({ serviceUrl: SERVICE_URL, req });
      res.status(status).json(data);
    } catch (error) {
      next(error);
    }
  });
  
  return router;
}

// --- 2. Create and export the adapter using the factory ---
// The developer only needs to edit this configuration object.
const adapter = createAdapter({
  resourcePrefix: '/${serviceName}',
  schema: schema,
  getRoutes: getRoutes,
});

export default adapter;
`;

// --- NEW, HIGHLY-INSTRUCTIONAL SCHEMA TEMPLATE ---
const SCHEMA_TEMPLATE = (serviceName) => {
  const capitalizedName = serviceName.charAt(0).toUpperCase() + serviceName.slice(1);
  return `
{
  "//": "This file defines the UI for the '${serviceName}' service. It conforms to the Admin Panel Meta-Schema.",
  "type": "resourceGroup",
  "display": "section",
  "id": "${serviceName}-group",
  "title": "${capitalizedName} Management",
  "icon": "grid",

  "//": "The 'items' array contains all navigable elements for this service group.",
  "items": [
    {
      "//": "--- EXAMPLE 1: A Standard Resource ---",
      "//": "This is a full-featured example of a resource with list/detail views and actions.",
      "type": "resource",
      "id": "${serviceName}",
      "name": "All ${capitalizedName}",
      "icon": "grid",
      "endpoint": "/${serviceName}",

      "views": {
        "listView": {
          "columns": [
            { "field": "id", "header": "ID" },
            { "field": "name", "header": "Name" }
          ]
        },
        "detailView": {
          "fields": [
            { "field": "id", "label": "Unique ID" },
            { "field": "name", "label": "Full Name" },
            { "field": "createdAt", "label": "Date Created" }
          ]
        }
      },

      "actions": [
        {
          "//": "A 'global' action to create new items (e.g., '+ New ${capitalizedName}' button).",
          "type": "form",
          "id": "create-${serviceName}",
          "name": "New ${capitalizedName}",
          "target": "global",
          "method": "POST",
          "endpoint": "/${serviceName}",
          "formSchema": {
            "schema": {
              "title": "Create ${capitalizedName}",
              "type": "object",
              "properties": { "name": { "type": "string" } },
              "required": ["name"]
            }
          }
        },
        {
          "//": "An 'item' action for each row in the table (e.g., 'Delete' button).",
          "type": "simpleAction",
          "id": "delete-${serviceName}",
          "name": "Delete",
          "variant": "danger",
          "target": "item",
          "method": "DELETE",
          "endpoint": "/${serviceName}/{id}",
          "confirmationText": "Are you sure you want to delete this item?"
        }
      ]
    },
    {
      "//": "--- EXAMPLE 2: A Nested Folder ---",
      "//": "This shows how to create a collapsible folder in the sidebar.",
      "type": "resourceGroup",
      "display": "folder",
      "id": "${serviceName}-reports-folder",
      "title": "Reports",
      "icon": "file-text",
      "items": [
        {
          "type": "resource",
          "id": "${serviceName}-activity",
          "name": "Activity Report",
          "icon": "activity",
          "endpoint": "/${serviceName}/activity",
          "views": { "listView": { "columns": [{ "field": "date", "header": "Date" }] } },
          "actions": []
        }
      ]
    },
    {
      "//": "--- EXAMPLE 3: A User Menu Item (for a separate user-adapter) ---",
      "//": "This shows how to add a link to the User Menu. This would typically live in a 'user-adapter'.",
      "//": "NOTE: This block should be moved to a separate schema file that returns a 'userMenu' type at its root.",
      "//": "type": "navigationLinkAction",
      "//": "id": "view-my-${serviceName}",
      "//": "name": "My ${capitalizedName}",
      "//": "targetResource": "${serviceName}",
      "//": "targetView": "detailView",
      "//": "targetId": "@currentUser"
    }
  ]
}
`;
};

// --- MAIN SCRIPT LOGIC (with improved validation and output) ---
async function main() {
  const serviceName = process.argv[2];

  if (!serviceName || !/^[a-z0-9-]+$/.test(serviceName)) {
    console.error('❌ Error: Please provide a valid service name (lowercase, letters, numbers, and hyphens only).');
    console.log('   Example: npm run gen:adapter products');
    process.exit(1);
  }

  console.log(`🚀 Scaffolding new adapter: "${serviceName}"...`);

  const serviceDir = path.join(ADAPTERS_DIR, `${serviceName}-adapter`);
  // Generate a CamelCase class name from a kebab-case service name
  const className = serviceName
    .replace(/-(\w)/g, (_, c) => c.toUpperCase())
    .replace(/^(\w)/, c => c.toUpperCase()) + 'Adapter';
  const envVarName = serviceName.toUpperCase().replace(/-/g, '_') + '_SERVICE_URL';

  try {
    await fs.access(serviceDir);
    console.error(`❌ Error: An adapter directory named "${serviceName}-adapter" already exists.`);
    process.exit(1);
  } catch (e) {
    // This is good, the directory doesn't exist.
  }

  try {
    await fs.mkdir(serviceDir, { recursive: true });
    console.log(`   ✅ Created directory: ${path.relative(process.cwd(), serviceDir)}`);

    const adapterPath = path.join(serviceDir, 'adapter.js');
    await fs.writeFile(adapterPath, ADAPTER_TEMPLATE(serviceName, envVarName));
    console.log(`   ✅ Created adapter file: adapter.js`);

    const schemaPath = path.join(serviceDir, 'schema.json');
    await fs.writeFile(schemaPath, SCHEMA_TEMPLATE(serviceName));
    console.log(`   ✅ Created schema file: schema.json`);

    console.log('\n🎉 Scaffolding complete! Next steps:');
    console.log(`   1. Edit \x1b[33msrc/adapters/${serviceName}-adapter/schema.json\x1b[0m to define your UI.`);
    console.log(`   2. Add the following line to your \x1b[33m.env\x1b[0m file:`);
    console.log(`      \x1b[36m${envVarName}=http://your-real-service-url.com\x1b[0m`);
    console.log(`   3. If needed, add custom route logic in the adapter.js file.`);
    console.log('   4. Restart the gateway server.');

  } catch (error) {
    console.error('💥 An unexpected error occurred during scaffolding:', error);
    process.exit(1);
  }
}

main();