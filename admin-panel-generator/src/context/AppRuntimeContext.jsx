// src/context/AppRuntimeContext.js

import React, { createContext, useState, useContext, useCallback } from 'react';
import jsonata from 'jsonata';

// Define the base URL for our mock backend. In a real app, this would
// come from an environment variable.
const API_HOST = 'http://localhost:3001';

// 1. Create the context with a default value of null.
const AppRuntimeContext = createContext(null);

/**
 * The Provider component that encapsulates all the runtime logic,
 * such as API calls and modal state management.
 */
export function AppRuntimeProvider({ children }) {
  // --- State Management ---

  // State for controlling a global modal for forms.
  const [modalState, setModalState] = useState({ 
    isOpen: false, 
    config: null, 
    initialData: null 
  });

  // A simple state "version" counter. When we modify data (e.g., create, update, delete),
  // we'll increment this counter. Components that display data (like tables) can
  // watch this value and refetch their data when it changes. This is a simple
  // yet effective cache invalidation strategy.
  const [dataVersion, setDataVersion] = useState(1);


  // --- Service Functions ---

  /**
   * Opens the global modal to display a form.
   * @param {object} actionConfig - The 'formAction' configuration from the schema.
   * @param {object} [itemData=null] - The data of the specific item being edited, if any.
   */
  const openFormModal = useCallback((actionConfig, itemData = null) => {
    console.log("Opening form modal with config:", actionConfig);
    setModalState({
      isOpen: true,
      config: actionConfig,
      initialData: itemData,
    });
  }, []);

  /**
   * Closes the global modal.
   */
  const closeModal = useCallback(() => {
    setModalState({ isOpen: false, config: null, initialData: null });
  }, []);

  /**
   * The core function for making API calls to the backend.
   * It handles endpoint formatting, payload transformation, and triggers data refresh.
   * @param {object} actionConfig - The configuration for the action (form or simple).
   * @param {object} [itemData=null] - The data of the row item for context (e.g., getting the ID).
   * @param {object} [formData=null] - The data submitted from a form.
   * @returns {Promise<boolean>} A promise that resolves to true on success, false on failure.
   */
  const executeApiAction = useCallback(async (actionConfig, itemData = null, formData = null) => {
    let { endpoint, method, payloadTransform } = actionConfig;

    // Substitute {id} in the endpoint if itemData is available
    if (itemData && itemData.id && endpoint.includes('{id}')) {
      endpoint = endpoint.replace('{id}', itemData.id);
    }

    let body = formData;

    // If there's a payload transform, apply it to the form data
    if (payloadTransform && formData) {
      try {
        const expression = jsonata(payloadTransform);
        body = await expression.evaluate(formData);
      } catch (e) {
        console.error("JSONata payloadTransform error:", e);
        alert(`Error transforming data: ${e.message}`);
        return false; // Stop execution
      }
    }
    
    const url = `${API_HOST}${endpoint}`;
    console.log(`Executing API Action: ${method} ${url}`, { body });

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          // In a real app, you'd add Authorization headers here
        },
        body: body ? JSON.stringify(body) : null,
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Use the error message from the backend if available
        throw new Error(responseData.message || `API Error: ${response.statusText}`);
      }
      
      console.log('API Action Successful:', responseData);
      alert('Success!');

      // On success, increment the data version to trigger UI refreshes
      setDataVersion(v => v + 1); 
      closeModal(); // Close any open modal
      return true;

    } catch (e) {
      console.error('API Action Failed:', e);
      alert(`Error: ${e.message}`);
      return false;
    }
  }, [closeModal]); // Dependency on `closeModal`

  // The value object provided to all consuming components.
  const value = {
    // State
    modalState,
    dataVersion,

    // Service Functions
    openFormModal,
    closeModal,
    executeApiAction,
  };

  return (
    <AppRuntimeContext.Provider value={value}>
      {children}
    </AppRuntimeContext.Provider>
  );
}

/**
 * A custom hook for easy and safe consumption of the AppRuntimeContext.
 * It ensures the hook is used within a component wrapped by the AppRuntimeProvider.
 */
export const useAppRuntime = () => {
  const context = useContext(AppRuntimeContext);
  if (context === null) {
    throw new Error('useAppRuntime must be used within an AppRuntimeProvider');
  }
  return context;
};