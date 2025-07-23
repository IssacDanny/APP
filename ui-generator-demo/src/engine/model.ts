// --- Visitor Pattern Foundation ---
export interface IVisitable {
  accept(visitor: IVisitor, context?: any): any;
}

export interface IVisitor {
  visitResource(resource: Resource): any;
  // Note: We pass the resource to the view visitor for context
  visitTableView(view: TableViewSchema, resource: Resource): any;
  visitFormAction(action: FormAction, context?: any): any;
  visitRetrieveAction(action: RetrieveAction): any;
}


// --- Model Classes (AST Nodes) ---

export class Resource implements IVisitable {
  // This constructor shorthand is correct.
  constructor(
    public name: string,
    public viewSchema: ViewSchema,
    public actions: Map<string, Action>
  ) {}

  accept(visitor: IVisitor) {
    return visitor.visitResource(this);
  }
}


export abstract class ViewSchema implements IVisitable {
  constructor(public title: string, public viewType: 'table' | 'detail') {}
  

  abstract accept(visitor: IVisitor, resource: Resource): any;
}

export class TableViewSchema extends ViewSchema {
  constructor(title: string, public columns: any[]) {
    super(title, 'table');
  }

  override accept(visitor: IVisitor, resource: Resource) {
    return visitor.visitTableView(this, resource);
  }
}

export abstract class Action {
  constructor(public name: string, public label: string) {}
}

export class FormAction extends Action implements IVisitable {
  constructor(name: string, label: string, public formSchema: any) {
    super(name, label);
  }

  accept(visitor: IVisitor, context?: any) {
    return visitor.visitFormAction(this, context);
  }
}

export class RetrieveAction extends Action implements IVisitable {
  constructor(name: string, label: string) {
    super(name, label);
  }
  
  accept(visitor: IVisitor) {
    return visitor.visitRetrieveAction(this);
  }
}