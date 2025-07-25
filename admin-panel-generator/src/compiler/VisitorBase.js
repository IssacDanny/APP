/**
 * The base class for visitors that traverse the Admin Panel AST.
 * It defines a visit method for each type of AST node.
 * This implementation acts as an "interface" and throws errors if a method isn't implemented by a subclass.
 */
export class VisitorBase {
  visitAdminPanelNode(node) { throw new Error("visitAdminPanelNode not implemented"); }
  visitResourceGroupNode(node) { throw new Error("visitResourceGroupNode not implemented"); }
  visitUserMenuNode(node) { throw new Error("visitUserMenuNode not implemented"); }
  visitResourceNode(node) { throw new Error("visitResourceNode not implemented"); }
  visitTableViewNode(node) { throw new Error("visitTableViewNode not implemented"); }
  visitDetailViewNode(node) { throw new Error("visitDetailViewNode not implemented"); }
  visitFormActionNode(node) { throw new Error("visitFormActionNode not implemented"); }
  visitSimpleApiActionNode(node) { throw new Error("visitSimpleApiActionNode not implemented"); }
  visitNavigationLinkActionNode(node) { throw new Error("visitNavigationLinkActionNode not implemented"); }
}