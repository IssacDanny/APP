// src/compiler/astNodes.js

// --- Base Class & Factory ---

/**
 * The base class for all nodes in the Abstract Syntax Tree.
 * It enforces the implementation of the accept method, crucial for the Visitor pattern.
 */
class ASTNode {
  constructor() {
    if (this.constructor === ASTNode) {
      throw new Error("ASTNode is an abstract class and cannot be instantiated directly.");
    }
  }

  /**
   * Accepts a visitor and calls the appropriate visit method on it.
   * This is the core of the Visitor pattern's double-dispatch mechanism.
   * @param {Visitor} visitor The visitor instance.
   */
  accept(visitor) {
    throw new Error("The 'accept' method must be implemented by concrete subclasses.");
  }
}



// --- Container and Structural Nodes ---

export class AdminPanelNode extends ASTNode {
  /**
   * @param {object} json The root JSON object of the entire admin panel schema.
   */
  constructor(json) {
    super();
    this.panelName = json.panelName;
    // Recursively build the navigation tree using the factory
    this.navigation = json.navigation.map(navJson => createNode(navJson));
  }

  accept(visitor) {
    return visitor.visitAdminPanelNode(this);
  }
}

class ResourceGroupNode extends ASTNode {
  /**
   * @param {object} json The JSON object for a 'resourceGroup'.
   */
  constructor(json) {
    super();
    this.type = json.type;
    this.id = json.id;
    this.title = json.title;
    this.display = json.display || 'section'; // Handle the new property

    // THE FIX: Use `json.items` and the factory for recursive/polymorphic children.
    this.items = (json.items || []).map(itemJson => createNode(itemJson));
  }

  accept(visitor) {
    return visitor.visitResourceGroupNode(this);
  }
}

class UserMenuNode extends ASTNode {
  /**
   * @param {object} json The JSON object for a 'userMenu'.
   */
  constructor(json) {
    super();
    this.type = json.type;
    this.id = json.id;
    this.title = json.title;
    // Recursively build the user menu item nodes using the factory
    this.items = (json.items || []).map(itemJson => createNode(itemJson));
  }
  
  accept(visitor) {
    return visitor.visitUserMenuNode(this);
  }
}

class ResourceNode extends ASTNode {
  /**
   * @param {object} json The JSON object for a 'resource'.
   */
  constructor(json) {
    super();
    this.id = json.id;
    this.name = json.name;
    this.endpoint = json.endpoint;

    // Build child View nodes
    this.views = {
      listView: new TableViewNode(json.views.listView),
      // Handle optional detailView
      detailView: json.views.detailView ? new DetailViewNode(json.views.detailView) : null,
    };
    
    // Recursively build the action nodes using the factory
    this.actions = json.actions.map(actionJson => createNode(actionJson));
  }

  accept(visitor) {
    return visitor.visitResourceNode(this);
  }
}


// --- View Nodes ---

class TableViewNode extends ASTNode {
  /**
   * @param {object} json The JSON object for a 'view-table'.
   */
  constructor(json) {
    super();
    this.type = json.type;
    this.columns = json.columns; // Simple properties, no child nodes
  }
  
  accept(visitor) {
    return visitor.visitTableViewNode(this);
  }
}

class DetailViewNode extends ASTNode {
  /**
   * @param {object} json The JSON object for a 'view-details'.
   */
  constructor(json) {
    super();
    this.type = json.type;
    this.fields = json.fields; // Simple properties, no child nodes
  }

  accept(visitor) {
    return visitor.visitDetailViewNode(this);
  }
}


// --- Action Nodes (The "Leaf" Nodes of the AST) ---

class FormActionNode extends ASTNode {
  /**
   * @param {object} json The JSON object for a 'formAction'.
   */
  constructor(json) {
    super();
    this.type = json.type;
    this.id = json.id;
    this.name = json.name;
    this.target = json.target;
    this.method = json.method;
    this.endpoint = json.endpoint;
    this.formSchema = json.formSchema;
    this.payloadTransform = json.payloadTransform; // May be undefined
    this.dataMapTransform = json.dataMapTransform; // May be undefined
  }
  
  accept(visitor) {
    return visitor.visitFormActionNode(this);
  }
}

class SimpleApiActionNode extends ASTNode {
  /**
   * @param {object} json The JSON object for a 'simpleApiAction'.
   */
  constructor(json) {
    super();
    this.type = json.type;
    this.id = json.id;
    this.name = json.name;
    this.target = json.target;
    this.method = json.method;
    this.endpoint = json.endpoint;
    this.confirmationText = json.confirmationText; // May be undefined
  }

  accept(visitor) {
    return visitor.visitSimpleApiActionNode(this);
  }
}

class NavigationLinkActionNode extends ASTNode {
  /**
   * @param {object} json The JSON object for a 'navigationLinkAction'.
   */
  constructor(json) {
    super();
    this.type = json.type;
    this.id = json.id;
    this.name = json.name;
    this.targetResource = json.targetResource;
    this.targetView = json.targetView;
    this.targetId = json.targetId;
  }
  
  accept(visitor) {
    return visitor.visitNavigationLinkActionNode(this);
  }
}



/**
 * A factory function that creates the appropriate AST node from a raw JSON object.
 * This is used to handle polymorphism defined by 'oneOf' in the meta-schema.
 * @param {object} jsonObject A raw JSON object with a 'type' property.
 * @returns {ASTNode} An instance of a concrete ASTNode subclass.
 */
function createNode(jsonObject) {
  if (!jsonObject || !jsonObject.type) {
    throw new Error("Cannot create a node from an object without a 'type' property.");
  }

  switch (jsonObject.type) {
    case 'resourceGroup':
      return new ResourceGroupNode(jsonObject);
    case 'resource':
      return new ResourceNode(jsonObject);
    case 'userMenu':
      return new UserMenuNode(jsonObject);
    case 'form':
      return new FormActionNode(jsonObject);
    case 'simpleAction':
      return new SimpleApiActionNode(jsonObject);
    case 'navigationLink':
      return new NavigationLinkActionNode(jsonObject);
    default:
      throw new Error(`Unknown node type: '${jsonObject.type}'`);
  }
}