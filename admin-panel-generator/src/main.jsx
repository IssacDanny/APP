import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Keep this import
import App from './App.jsx';
import { ApiServiceProvider } from './context/ApiServiceContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ApiServiceProvider>
        <App />
      </ApiServiceProvider>
    </BrowserRouter>
  </React.StrictMode>,
);