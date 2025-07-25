import { VisitorBase } from './VisitorBase.js';

/**
 * The UIGeneratorVisitor traverses the AST and produces a declarative
 * Intermediate Representation (IR) of the UI. This IR is a simple object
 * structure that can be consumed by a renderer.
 */
export class UIGeneratorVisitor extends VisitorBase {

  visitAdminPanelNode(node) {
    const navItemsIR = node.navigation.map(navNode => navNode.accept(this));
    return {
      component: 'AppShell',
      props: {
        title: node.panelName,
        navigation: navItemsIR,
        routes: this.collectRoutes(node),
      }
    };
  }

  visitResourceGroupNode(node) {
    const childrenIR = node.items.map(itemNode => itemNode.accept(this));
    // --- THIS LOGIC IS NEW/IMPROVED ---
    // Handle icons and choose between NavSection and NavFolder
    const componentType = node.display === 'section' ? 'NavSection' : 'NavFolder';
    return {
      component: componentType,
      props: {
        title: node.title,
        icon: node.icon, // Pass icon to IR
        children: childrenIR,
      }
    };
  }
  
  visitResourceNode(node) {
    return {
      component: 'NavLink',
      props: {
        text: node.name,
        to: `/resources/${node.id}`,
        icon: node.icon, // Pass icon to IR
      }
    };
  }
  
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

  // --- NEW HELPER METHOD ---
  /**
   * Generates the IR for a resource's detail page content.
   * @param {import('./astNodes').ResourceNode} node
   * @returns {object} The IR for the resource's detail page.
   */
  generateDetailPageIR(node) {
    if (!node.views.detailView) {
      // Graceful fallback if a detail view isn't configured
      return { component: 'div', props: { children: 'No detail view configured for this resource.' } };
    }
    
    // Visit the detailView node to get its base IR
    const detailViewIR = node.views.detailView.accept(this);
    
    // Inject necessary contextual props for the component to fetch its data
    detailViewIR.props.resourceEndpoint = node.endpoint;
    detailViewIR.props.resourceName = node.name;

    return detailViewIR;
  }

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
      component: 'DetailView', // This will map to our new <DetailView> React component
      props: {
        fields: node.fields,
      }
    };
  }

  visitFormActionNode(node) { /* ... (no changes) ... */
    return {
      component: 'FormButton',
      props: {
        text: node.name,
        target: node.target,
        actionConfig: { type: 'form', endpoint: node.endpoint, method: node.method, formSchema: node.formSchema, payloadTransform: node.payloadTransform, dataMapTransform: node.dataMapTransform }
      }
    };
  }

  visitSimpleApiActionNode(node) { /* ... (no changes) ... */
    return {
      component: 'ActionButton',
      props: {
        text: node.name,
        target: node.target,
        actionConfig: { type: 'simple', endpoint: node.endpoint, method: node.method, confirmationText: node.confirmationText }
      }
    };
  }
  
  visitNavigationLinkActionNode(node) {
    return {
      component: 'MenuLink',
      props: {
        text: node.name,
        actionConfig: {
          type: 'navigate',
          // Use the full key names to match the runtime context
          targetResource: node.targetResource,
          targetView: node.targetView,
          targetId: node.targetId
        }
      }
    };
  }

  /**
   * Recursively walks the AST and collects all possible routes for list AND detail pages.
   * @param {import('./astNodes').AdminPanelNode} rootNode
   * @returns {Array<object>} A list of route definitions for React Router.
   */
  collectRoutes(rootNode) {
    const routes = [];
    
    const findResources = (items) => {
      if (!items) return;
      
      for (const item of items) {
        if (item.constructor.name === 'ResourceNode') {
          // 1. Create the route for the LIST view (e.g., /resources/products)
          routes.push({
            path: `/resources/${item.id}`,
            element: this.generatePageIRForResource(item)
          });

          // 2. IF a detailView exists, create a DYNAMIC route for it
          //    (e.g., /resources/users/:itemId)
          if (item.views.detailView) {
            routes.push({
              path: `/resources/${item.id}/:itemId`, // The ':itemId' is a URL parameter
              element: this.generateDetailPageIR(item),
            });
          }

        } else if (item.constructor.name === 'ResourceGroupNode') {
          // Recurse into sub-folders
          findResources(item.items);
        }
      }
    };

    findResources(rootNode.navigation);
    return routes;
  }

  generatePageIRForResource(resourceNode) { /* ... (no changes) ... */
    const listViewIR = resourceNode.views.listView.accept(this);
    const globalActions = resourceNode.actions
      .filter(action => action.target === 'global')
      .map(action => action.accept(this));
    
    const itemActions = resourceNode.actions
      .filter(action => action.target === 'item')
      .map(action => action.accept(this));

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