// src/context/AppRuntimeContext.js

import { createContext, useContext } from 'react';

// Define the shape of the context for better autocompletion and clarity.
// The default values are empty functions. The actual implementations will be
// provided in App.jsx.
export const AppRuntimeContext = createContext({
  apiCall: async (method, endpoint, body) => {
    console.warn("apiCall called without a provider.");
  },
  openFormModal: (actionConfig, initialData = null, onFinished = null) => {
    console.warn("openFormModal called without a provider.");
  },
  closeModal: () => {
    console.warn("closeModal called without a provider.");
  },
  // A simple event-driven way to notify components to refetch data.
  // In a larger app, this might be a more robust state management solution.
  addRefreshListener: (resourceId, callback) => {},
  removeRefreshListener: (resourceId, callback) => {},
  triggerRefresh: (resourceId) => {},
});

// A custom hook for easy consumption of the context. This is a best practice.
export const useAppRuntime = () => {
  return useContext(AppRuntimeContext);
};