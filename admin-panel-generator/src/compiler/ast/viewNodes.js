import { ASTNode } from './astNode.js';

export class TableViewNode extends ASTNode {
  constructor(json) {
    super();
    this.type = json.type;
    this.columns = json.columns;
  }
  
  accept(visitor) {
    return visitor.visitTableViewNode(this);
  }
}

export class DetailViewNode extends ASTNode {
  constructor(json) {
    super();
    this.type = json.type;
    this.fields = json.fields;
  }

  accept(visitor) {
    return visitor.visitDetailViewNode(this);
  }
}