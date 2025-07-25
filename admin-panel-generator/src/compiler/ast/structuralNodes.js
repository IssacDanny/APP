import { ASTNode } from './astNode.js';
import { createNode } from './factory.js';
import { TableViewNode, DetailViewNode } from './viewNodes.js';

export class AdminPanelNode extends ASTNode {
  constructor(json) {
    super();
    this.panelName = json.panelName;
    this.navigation = json.navigation.map(navJson => createNode(navJson));
  }

  accept(visitor) {
    return visitor.visitAdminPanelNode(this);
  }
}

export class ResourceGroupNode extends ASTNode {
  constructor(json) {
    super();
    this.type = json.type;
    this.id = json.id;
    this.title = json.title;
    this.icon = json.icon;
    this.display = json.display || 'section';
    this.items = (json.items || []).map(itemJson => createNode(itemJson));
  }

  accept(visitor) {
    return visitor.visitResourceGroupNode(this);
  }
}

export class UserMenuNode extends ASTNode {
  constructor(json) {
    super();
    this.type = json.type;
    this.id = json.id;
    this.title = json.title;
    this.items = (json.items || []).map(itemJson => createNode(itemJson));
  }
  
  accept(visitor) {
    return visitor.visitUserMenuNode(this);
  }
}

export class ResourceNode extends ASTNode {
  constructor(json) {
    super();
    this.id = json.id;
    this.name = json.name;
    this.endpoint = json.endpoint;
    this.icon = json.icon;

    this.views = {
      listView: new TableViewNode(json.views.listView),
      detailView: json.views.detailView ? new DetailViewNode(json.views.detailView) : null,
    };
    
    this.actions = (json.actions || []).map(actionJson => createNode(actionJson));
  }

  accept(visitor) {
    return visitor.visitResourceNode(this);
  }
}