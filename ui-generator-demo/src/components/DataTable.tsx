import React from 'react';

interface Column {
  key: string;
  label: string;
}

interface Props {
  columns: Column[];
  data: Record<string, any>[];
  renderRowActions: (item: Record<string, any>) => React.ReactNode;
}

export const DataTable: React.FC<Props> = ({ columns, data, renderRowActions }) => {
  return (
    <table className="data-table">
      <thead>
        <tr>
          {columns.map((col) => <th key={col.key}>{col.label}</th>)}
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.id}>
            {columns.map((col) => <td key={col.key}>{item[col.key]}</td>)}
            <td className="row-actions">
              {renderRowActions(item)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};