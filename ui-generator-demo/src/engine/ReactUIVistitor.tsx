import React from 'react';
import { type IVisitor, Resource, TableViewSchema, FormAction, RetrieveAction } from './model';
import { FormActionButton } from '../components/FormActionButton.tsx';
import { DataTable } from '../components/DataTable.tsx';

// The Visitor is now stateless. It only structures the UI.
export class ReactUIVisitor implements IVisitor {
  private data: any[];
  private onFormSubmit: (actionName: string, formData: any, context: any) => void;

  constructor(data: any[], onFormSubmit: (actionName: string, formData: any, context: any) => void) {
    this.data = data;
    this.onFormSubmit = onFormSubmit;
  }

  // No change here
  visitResource(resource: Resource) {
    const topLevelActions = Array.from(resource.actions.values())
      .filter(action => action.name === 'create');

    return (
      <div className="resource-page">
        <h1>{resource.viewSchema.title}</h1>
        <div className="toolbar">
          {topLevelActions.map(action => action.accept(this))}
        </div>
        {resource.viewSchema.accept(this, resource)}
      </div>
    );
  }

  // No change here
  visitTableView(view: TableViewSchema, resource: Resource) {
    const rowLevelActions = Array.from(resource.actions.values())
      .filter(action => ['update', 'delete'].includes(action.name));

    return (
      <DataTable
        columns={view.columns}
        data={this.data}
        renderRowActions={(item) => (
          <>
            {rowLevelActions.map(action => action.accept(this, item))}
          </>
        )}
      />
    );
  }

  // ✅ MAJOR CHANGE: This method is now very simple.
  // It delegates all stateful work to the FormActionButton component.
  visitFormAction(action: FormAction, context?: any) {
    return (
      <FormActionButton
        key={action.name + (context?.id || '')} // Add a key for proper rendering
        action={action}
        context={context}
        onFormSubmit={this.onFormSubmit}
      />
    );
  }

  // No change here
  visitRetrieveAction(_action: RetrieveAction) {
    return null;
  }
}