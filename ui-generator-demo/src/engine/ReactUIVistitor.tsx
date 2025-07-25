import React from 'react';
import { Link } from 'react-router-dom';
import { type IVisitor, Resource, TableViewSchema, FormAction, RetrieveAction, DetailViewSchema } from './model';
import { FormActionButton } from '../components/FormActionButton.tsx';
import { DataTable } from '../components/DataTable.tsx';
import { DetailView } from '../components/DetailView.tsx';
// The Visitor is now stateless. It only structures the UI.
export class ReactUIVisitor implements IVisitor {
  private data: any[];
  private onFormSubmit: (actionName: string, formData: any, context: any) => void;

  constructor(data: any[], onFormSubmit: (actionName: string, formData: any, context: any) => void) {
    this.data = data;
    this.onFormSubmit = onFormSubmit;
  }

  /// This is the main entry point from the app.
  // It decides whether to render a list view or a detail view.
  visitResource(resource: Resource) {
    // We delegate to the specific view visitor.
    return resource.viewSchema.accept(this, resource);
  }

  // Renders a data table view
  visitTableView(view: TableViewSchema, resource: Resource) {
    const topLevelActions = Array.from(resource.actions.values())
      .filter(action => action.name === 'create');
      
    const rowLevelActions = Array.from(resource.actions.values())
      .filter(action => ['update', 'delete'].includes(action.name));
      
    // DYNAMICALLY INJECT LINK LOGIC!
    // If a detail view is possible (indicated by a 'retrieveByID' action),
    // we modify the columns to add a link.
    const hasDetailView = resource.actions.has('retrieveByID');
    const linkedColumns = view.columns.map(col =>
      // Let's link on the 'name' field by convention for this demo
      (col.key === 'name' && hasDetailView)
        ? { ...col, render: (item) => <Link to={`/${resource.name}/${item.id}`}>{item.name}</Link> }
        : col
    );

    return (
      <div className="resource-page">
        <h1>{view.title}</h1>
        <div className="toolbar">
          {topLevelActions.map(action => action.accept(this))}
        </div>
        <DataTable
          columns={linkedColumns}
          data={this.data}
          renderRowActions={(item) => (
            <>
              {rowLevelActions.map(action => action.accept(this, item))}
            </>
          )}
        />
      </div>
    );
  }

  // ✅ NEW METHOD: Renders a detail view
  visitDetailView(view: DetailViewSchema, resource: Resource) {
    // For a detail view, the data array will have only one item.
    const item = this.data?.[0];

    const rowLevelActions = Array.from(resource.actions.values())
      .filter(action => ['update', 'delete'].includes(action.name));

    return (
      <div className="resource-page">
        <h1>{view.title}</h1>
        <div className="toolbar">
           {rowLevelActions.map(action => action.accept(this, item))}
        </div>
        <DetailView fields={view.layout} item={item} />
      </div>
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