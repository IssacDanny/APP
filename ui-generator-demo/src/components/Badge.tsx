import React from 'react';
import './Badge.css'; // Add some basic styling

export const Badge: React.FC<{ text: string }> = ({ text }) => {
  return <span className="badge">{text}</span>;
};