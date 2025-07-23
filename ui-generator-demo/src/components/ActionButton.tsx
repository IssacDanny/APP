import React from 'react';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

export const ActionButton: React.FC<Props> = ({ label, ...props }) => {
  return <button className="action-button" {...props}>{label}</button>;
};