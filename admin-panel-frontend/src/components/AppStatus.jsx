import React from 'react';

export const AppLoader = () => (
  <div className="app-loader">
    <h2>Loading and Compiling UI...</h2>
  </div>
);

export const AppError = ({ error }) => (
  <div className="app-error">
    <h1>Application Failed to Load</h1>
    <p>A fatal error occurred during the compilation phase:</p>
    <pre>{error}</pre>
  </div>
);