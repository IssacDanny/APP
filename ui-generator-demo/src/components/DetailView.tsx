import React from 'react';
import { Badge } from './Badge'; // Create this next

interface Field {
  key: string;
  label: string;
  displayAs?: string;
}

interface Props {
  fields: Field[];
  item: Record<string, any>;
}

export const DetailView: React.FC<Props> = ({ fields, item }) => {
  if (!item) return null;

  const renderField = (field: Field) => {
    const value = item[field.key];
    switch (field.displayAs) {
      case 'badge':
        return <Badge text={value} />;
      // Add other cases for date, currency, etc.
      default:
        return <span>{value}</span>;
    }
  };

  return (
    <div className="detail-view">
      {fields.map(field => (
        <div key={field.key} className="detail-field">
          <label>{field.label}</label>
          <div>{renderField(field)}</div>
        </div>
      ))}
    </div>
  );
};