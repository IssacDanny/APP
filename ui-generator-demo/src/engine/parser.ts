import {
  Resource,
  TableViewSchema,
  FormAction,
  RetrieveAction,
  Action,
  ViewSchema
} from './model';

// Parses the top-level resource from our manifest file
export function parseResource(manifest: any, resourceName: string): Resource {
  const resourceDef = manifest[resourceName];
  if (!resourceDef) {
    throw new Error(`Resource "${resourceName}" not found in manifest.`);
  }

  // 1. Parse View Schema
  const viewSchemaDef = resourceDef.viewSchema;
  let viewSchema: ViewSchema;
  if (viewSchemaDef.viewType === 'table') {
    viewSchema = new TableViewSchema(viewSchemaDef.title, viewSchemaDef.columns);
  } else {
    throw new Error(`Unsupported viewType: ${viewSchemaDef.viewType}`);
  }

  // 2. Parse Actions
  const actions = new Map<string, Action>();
  for (const actionName in resourceDef.actions) {
    const actionDef = resourceDef.actions[actionName];
    let action: Action;
    if (actionDef.formSchema) {
      action = new FormAction(actionName, actionDef.label, actionDef.formSchema);
    } else {
      action = new RetrieveAction(actionName, actionDef.label);
    }
    actions.set(actionName, action);
  }

  return new Resource(resourceName, viewSchema, actions);
}