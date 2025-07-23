import React from 'react';

const GenericTable = ({ schema, data, rowActions = [], onRowAction = () => {} }) => {
  return (
    <table className="generic-table">
      <thead>
        <tr>
          {schema.columns.map((col) => <th key={col.key}>{col.label}</th>)}
          {rowActions.length > 0 && <th>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={row.id}>
            {schema.columns.map((col) => <td key={col.key}>{row[col.key]}</td>)}
            {rowActions.length > 0 && (
              <td className="actions-cell">
                {rowActions.map((actionName) => (
                  <button key={actionName} onClick={() => onRowAction(actionName, row)} className={`action-button ${actionName}`}>
                    {actionName.charAt(0).toUpperCase() + actionName.slice(1)}
                  </button>
                ))}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
export default GenericTable;