import { VisitorBase } from './VisitorBase.js';

/**
 * The UIGeneratorVisitor traverses the AST and produces a declarative
 * Intermediate Representation (IR) of the UI.
 */
export class UIGeneratorVisitor extends VisitorBase {
  // =================================================================
  // --- Structural Node Visitors ---
  // These methods handle the overall layout and navigation structure.
  // =================================================================

  /**
   * @param {import('./ast').AdminPanelNode} node
   */
  visitAdminPanelNode(node) {
    const navItemsIR = node.navigation.map(navNode => navNode.accept(this));
    return {
      component: 'AppShell',
      props: {
        title: node.panelName,
        navigation: navItemsIR,
        routes: this._collectRoutes(node),
      }
    };
  }

  /**
   * @param {import('./ast').ResourceGroupNode} node
   */
  visitResourceGroupNode(node) {
    const childrenIR = node.items.map(itemNode => itemNode.accept(this));
    const componentType = node.display === 'section' ? 'NavSection' : 'NavFolder';
    return {
      component: componentType,
      props: {
        title: node.title,
        icon: node.icon,
        children: childrenIR,
      }
    };
  }
  
  /**
   * @param {import('./ast').ResourceNode} node
   */
  visitResourceNode(node) {
    return {
      component: 'NavLink',
      props: {
        text: node.name,
        to: `/resources/${node.id}`,
        icon: node.icon,
      }
    };
  }
  
  /**
   * @param {import('./ast').UserMenuNode} node
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
  
  // =================================================================
  // --- View Node Visitors ---
  // These methods handle the content of pages (tables, detail views).
  // =================================================================

  /**
   * @param {import('./ast').TableViewNode} node
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
   * @param {import('./ast').DetailViewNode} node
   */
  visitDetailViewNode(node) {
    return {
      component: 'DetailView',
      props: {
        fields: node.fields,
      }
    };
  }

  // =================================================================
  // --- Action Node Visitors ---
  // These methods handle interactive elements like buttons and links.
  // =================================================================

  /**
   * @param {import('./ast').FormActionNode} node
   */
  visitFormActionNode(node) {
    return {
      component: 'FormButton',
      props: {
        text: node.name,
        target: node.target,
        // CLEANUP: Pass the entire node. The runtime component now has all the info it needs.
        actionConfig: node
      }
    };
  }

  /**
   * @param {import('./ast').SimpleApiActionNode} node
   */
  visitSimpleApiActionNode(node) {
    return {
      component: 'ActionButton',
      props: {
        text: node.name,
        target: node.target,
        actionConfig: node
      }
    };
  }
  
  /**
   * @param {import('./ast').NavigationLinkActionNode} node
   */
  visitNavigationLinkActionNode(node) {
    return {
      component: 'MenuLink',
      props: {
        text: node.name,
        actionConfig: node
      }
    };
  }

  // =================================================================
  // --- Private Helper Methods ---
  // Underscore convention indicates these are internal to the visitor.
  // =================================================================

  /**
   * Recursively walks the AST to generate all routes for React Router.
   * @param {import('./ast').AdminPanelNode} rootNode
   * @returns {Array<object>}
   */
  _collectRoutes(rootNode) {
    const routes = [];
    const findResources = (items) => {
      if (!items) return;
      for (const item of items) {
        if (item.constructor.name === 'ResourceNode') {
          // List view route
          routes.push({
            path: `/resources/${item.id}`,
            element: this._buildListPage(item)
          });
          // Detail view route (if it exists)
          if (item.views.detailView) {
            routes.push({
              path: `/resources/${item.id}/:itemId`,
              element: this._buildDetailPage(item),
            });
          }
        } else if (item.constructor.name === 'ResourceGroupNode') {
          findResources(item.items);
        }
      }
    };
    findResources(rootNode.navigation);
    return routes;
  }

  /**
   * Builds the complete IR for a resource's list page.
   * @param {import('./ast').ResourceNode} resourceNode
   * @returns {object}
   */
  _buildListPage(resourceNode) {
    const listViewIR = resourceNode.views.listView.accept(this);
    const globalActions = (resourceNode.actions || [])
      .filter(action => action.target === 'global')
      .map(action => action.accept(this));
    const itemActions = (resourceNode.actions || [])
      .filter(action => action.target === 'item')
      .map(action => action.accept(this));

    // Inject necessary props into the generated IR
    listViewIR.props.itemActions = itemActions;
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

  /**
   * Builds the complete IR for a resource's detail page.
   * @param {import('./ast').ResourceNode} resourceNode
   * @returns {object}
   */
  _buildDetailPage(resourceNode) {
    const detailViewIR = resourceNode.views.detailView.accept(this);
    detailViewIR.props.resourceEndpoint = resourceNode.endpoint;
    detailViewIR.props.resourceName = resourceNode.name;
    return detailViewIR;
  }
}