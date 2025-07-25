import { ASTNode } from './astNode.js';

export class FormActionNode extends ASTNode {
  constructor(json) {
    super();
    Object.assign(this, json); // A cleaner way to assign properties
  }
  
  accept(visitor) {
    return visitor.visitFormActionNode(this);
  }
}

export class SimpleApiActionNode extends ASTNode {
  constructor(json) {
    super();
    Object.assign(this, json);
  }

  accept(visitor) {
    return visitor.visitSimpleApiActionNode(this);
  }
}

export class NavigationLinkActionNode extends ASTNode {
  constructor(json) {
    super();
    Object.assign(this, json);
  }
  
  accept(visitor) {
    return visitor.visitNavigationLinkActionNode(this);
  }
}