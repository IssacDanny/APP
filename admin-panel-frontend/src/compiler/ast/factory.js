// Import the node classes this factory will create.
import { ResourceGroupNode, ResourceNode, UserMenuNode } from './structuralNodes.js';
import { FormActionNode, SimpleApiActionNode, NavigationLinkActionNode } from './actionNodes.js';

/**
 * A factory function that creates the appropriate AST node from a raw JSON object.
 * This is used to handle polymorphism defined by 'oneOf' in the meta-schema.
 * @param {object} jsonObject A raw JSON object with a 'type' property.
 * @returns {import('./astNode').ASTNode} An instance of a concrete ASTNode subclass.
 */
export function createNode(jsonObject) {
  if (!jsonObject || !jsonObject.type) {
    throw new Error("Cannot create a node from an object without a 'type' property.");
  }

  // A map of types to their corresponding node classes.
  const nodeMap = {
    resourceGroup: ResourceGroupNode,
    resource: ResourceNode,
    userMenu: UserMenuNode,
    form: FormActionNode,
    simpleAction: SimpleApiActionNode,
    navigationLink: NavigationLinkActionNode,
  };

  const NodeClass = nodeMap[jsonObject.type];

  if (NodeClass) {
    return new NodeClass(jsonObject);
  }

  throw new Error(`Unknown node type: '${jsonObject.type}'`);
}