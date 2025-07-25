// src/compiler/visitor.js

import { VisitorBase } from './VisitorBase.js';

/**
 * The UIGeneratorVisitor traverses the AST and produces a declarative
 * Intermediate Representation (IR) of the UI. This IR is a simple object
 * structure that can be consumed by a renderer.
 */
export class UIGeneratorVisitor extends VisitorBase {

  /**
   * Visits the root of the AST.
   * @param {import('./astNodes').AdminPanelNode} node
   * @returns {object} The IR for the entire application shell.
   */
  visitAdminPanelNode(node) {
    // 1. Visit children first (post-order traversal) to get their IR.
    const navItemsIR = node.navigation.map(navNode => navNode.accept(this));

    // 2. Construct this node's IR from its own data and its children's IR.
    return {
      component: 'AppShell',
      props: {
        title: node.panelName,
        navigation: navItemsIR,
        routes: this.collectRoutes(node),
      }
    };
  }

  /**
   * Recursively visits a resource group, creating a "NavSection" or "NavFolder" IR.
   * @param {import('./astNodes').ResourceGroupNode} node
   * @returns {object} The IR for a navigation section or folder.
   */
  visitResourceGroupNode(node) {
    // 1. Visit all children first (post-order traversal)
    const childrenIR = node.items.map(itemNode => itemNode.accept(this));

    // 2. Determine the component type based on the 'display' property
    const componentType = node.display === 'section' ? 'NavSection' : 'NavFolder';

    return {
      component: componentType,
      props: {
        title: node.title,
        children: childrenIR,
      }
    };
  }
  
  /**
   * Visits a ResourceNode when it's part of the navigation tree.
   * This is a "leaf" in the navigation hierarchy.
   * @param {import('./astNodes').ResourceNode} node
   * @returns {object} The IR for a direct navigation link.
   */
  visitResourceNode(node) {
    return {
      component: 'NavLink',
      props: {
        text: node.name,
        to: `/resources/${node.id}`
      }
    };
  }
  
  /**
   * Visits the user menu.
   * @param {import('./astNodes').UserMenuNode} node
   * @returns {object} The IR for a user dropdown menu.
   */
  visitUserMenuNode(node) {
    const menuItemsIR = node.items.map(itemNode => itemNode.accept(this));
    return {
      component: 'UserMenu',
      props: {
        title: node.title,
        children: menuItemsIR
      }
    };
  }

  /**
   * Generates the IR for a resource's main page content.
   * NOTE: This is NOT a standard visit method. It's a helper called by `collectRoutes`
   * to generate the content for a specific route.
   * @param {import('./astNodes').ResourceNode} node
   * @returns {object} The IR for a resource's main page.
   */
  generateResourcePageIR(node) {
    const listViewIR = node.views.listView.accept(this);
    const globalActions = node.actions
      .filter(action => action.target === 'global')
      .map(action => action.accept(this));
    
    // Pass the item-specific actions down to the table view
    const itemActions = node.actions
      .filter(action => action.target === 'item')
      .map(action => action.accept(this));

    // We inject the item actions and resource ID into the list view's props
    listViewIR.props.itemActions = itemActions;
    listViewIR.props.resourceId = node.id;
    listViewIR.props.resourceEndpoint = node.endpoint;

    return {
      component: 'ResourcePageLayout',
      props: {
        title: node.name,
        globalActions: globalActions,
        listView: listViewIR,
      }
    };
  }

  /**
   * Visits a table view definition.
   * @param {import('./astNodes').TableViewNode} node
   * @returns {object} The IR for a data table component.
   */
  visitTableViewNode(node) {
    return {
      component: 'DataTable',
      props: {
        columns: node.columns,
      }
    };
  }
  
  /**
   * Visits a detail view definition.
   * @param {import('./astNodes').DetailViewNode} node
   * @returns {object} The IR for a detail display component.
   */
  visitDetailViewNode(node) {
    return {
      component: 'DetailView',
      props: {
        fields: node.fields
      }
    };
  }

  /**
   * Visits a form action node.
   * @param {import('./astNodes').FormActionNode} node
   * @returns {object} The IR for a button that opens a form.
   */
  visitFormActionNode(node) {
    return {
      component: 'FormButton',
      props: {
        text: node.name,
        target: node.target,
        // The 'actionConfig' is a self-contained blob of data that the
        // component will use to perform its logic via the runtime context.
        actionConfig: {
          type: 'form',
          endpoint: node.endpoint,
          method: node.method,
          formSchema: node.formSchema,
          payloadTransform: node.payloadTransform,
          dataMapTransform: node.dataMapTransform
        }
      }
    };
  }

  /**
   * Visits a simple API action node.
   * @param {import('./astNodes').SimpleApiActionNode} node
   * @returns {object} The IR for a simple action button.
   */
  visitSimpleApiActionNode(node) {
    return {
      component: 'ActionButton',
      props: {
        text: node.name,
        target: node.target,
        actionConfig: {
          type: 'simple',
          endpoint: node.endpoint,
          method: node.method,
          confirmationText: node.confirmationText
        }
      }
    };
  }
  
  /**
   * Visits a navigation link action node.
   * @param {import('./astNodes').NavigationLinkActionNode} node
   * @returns {object} The IR for a navigation link (e.g., in a menu).
   */
  visitNavigationLinkActionNode(node) {
    return {
      component: 'MenuLink',
      props: {
        text: node.name,
        actionConfig: {
          type: 'navigate',
          resource: node.targetResource,
          view: node.targetView,
          id: node.targetId
        }
      }
    };
  }

  /**
   * A recursive helper method to walk the AST and collect all possible routes.
   * @param {import('./astNodes').AdminPanelNode} rootNode
   * @returns {Array<object>} A list of route definitions.
   */
  collectRoutes(rootNode) {
    const routes = [];
    
    // Inner recursive function to traverse the navigation tree
    const findResources = (items) => {
      if (!items) return;
      
      for (const item of items) {
        if (item.constructor.name === 'ResourceNode') {
          routes.push({
            path: `/resources/${item.id}`,
            // Generate the IR for the page that will be rendered at this route
            element: this.generatePageIRForResource(item)
          });
        } else if (item.constructor.name === 'ResourceGroupNode') {
          // If it's another group, recurse into its items
          findResources(item.items);
        }
      }
    };

    findResources(rootNode.navigation);
    return routes;
  }

  /**
   * Generates the IR for a resource's main page content.
   * Replaces the old `generateResourcePageIR` and is called by `collectRoutes`.
   * @param {import('./astNodes').ResourceNode} resourceNode
   * @returns {object} The IR for a resource's main page.
   */
  generatePageIRForResource(resourceNode) {
    const listViewIR = resourceNode.views.listView.accept(this);
    const globalActions = resourceNode.actions
      .filter(action => action.target === 'global')
      .map(action => action.accept(this));
    
    const itemActions = resourceNode.actions
      .filter(action => action.target === 'item')
      .map(action => action.accept(this));

    // Inject necessary props into the list view's IR
    listViewIR.props.itemActions = itemActions;
    listViewIR.props.resourceId = resourceNode.id;
    listViewIR.props.resourceEndpoint = resourceNode.endpoint;

    return {
      component: 'ResourcePageLayout',
      props: {
        title: resourceNode.name,
        globalActions: globalActions,
        listView: listViewIR,
      }
    };
  }
}