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
        // We also need to define the routes for the router
        routes: this.collectRoutes(node),
      }
    };
  }

  /**
   * Visits a navigation group.
   * @param {import('./astNodes').ResourceGroupNode} node
   * @returns {object} The IR for a navigation menu group.
   */
  visitResourceGroupNode(node) {
    const resourceLinksIR = node.resources.map(resourceNode => ({
      component: 'NavLink',
      props: {
        text: resourceNode.name,
        // The 'to' prop corresponds to the route path we'll define.
        to: `/resources/${resourceNode.id}`
      }
    }));

    return {
      component: 'NavMenuGroup',
      props: {
        title: node.title,
        children: resourceLinksIR
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
   * A helper method to walk the AST and collect all possible routes
   * for the application's router.
   * @param {import('./astNodes').AdminPanelNode} rootNode
   * @returns {Array<object>} A list of route definitions.
   */
  collectRoutes(rootNode) {
    const routes = [];
    rootNode.navigation.forEach(navNode => {
      if (navNode.type === 'resourceGroup') {
        navNode.resources.forEach(resourceNode => {
          routes.push({
            path: `/resources/${resourceNode.id}`,
            // The element is the IR for the page to be rendered at this route.
            element: this.generateResourcePageIR(resourceNode)
          });
          // TODO: Add routes for detail views, e.g., `/resources/${resourceNode.id}/:itemId`
        });
      }
    });
    return routes;
  }
}