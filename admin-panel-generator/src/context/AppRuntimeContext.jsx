import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import jsonata from 'jsonata';
import { toast } from 'react-hot-toast';

const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost:3001';
const AppRuntimeContext = createContext(null);

// --- 1. Reusable API Client ---
/**
 * A centralized client for making API requests.
 * @param {string} endpoint - The API endpoint (e.g., '/products').
 * @param {object} options - Options for the fetch call (method, body, etc.).
 * @returns {Promise<any>} The JSON response from the API.
 * @throws {Error} Throws an error if the network response is not ok.
 */
async function apiClient(endpoint, { body, ...customOptions } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const config = {
    method: body ? 'POST' : 'GET',
    ...customOptions,
    headers: {
      ...headers,
      ...customOptions.headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${API_HOST}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'An API error occurred');
  }

  return data;
}

/**
 * The Provider component that encapsulates all runtime logic.
 */
export function AppRuntimeProvider({ children }) {
  const navigate = useNavigate();

  // --- State ---
  const [modalState, setModalState] = useState({ isOpen: false, config: null, initialData: null });
  const [dataVersion, setDataVersion] = useState(1);
  const refreshData = () => setDataVersion(v => v + 1);

  // --- 2. Grouped Services ---

  // Service for handling modal logic
  const modalService = {
    open: useCallback((actionConfig, itemData = null) => {
      setModalState({ isOpen: true, config: actionConfig, initialData: itemData });
    }, []),
    close: useCallback(() => {
      setModalState({ isOpen: false, config: null, initialData: null });
    }, []),
    state: modalState,
  };

  // Service for handling API and navigation actions
  const actionService = {
    execute: useCallback(async (actionConfig, itemData = null, formData = null) => {
      let { endpoint, method, payloadTransform } = actionConfig;

      if (itemData?.id && endpoint.includes('{id}')) {
        endpoint = endpoint.replace('{id}', itemData.id);
      }

      let body = formData;
      if (payloadTransform && formData) {
        try {
          body = await jsonata(payloadTransform).evaluate(formData);
        } catch (e) {
          toast.error(`Data transform error: ${e.message}`);
          return false;
        }
      }

      try {
        await apiClient(endpoint, { method, body });
        toast.success('Action successful!');
        refreshData();
        modalService.close();
        return true;
      } catch (e) {
        toast.error(`Error: ${e.message}`);
        return false;
      }
    }, [modalService]),

    navigate: useCallback((actionConfig) => {
      const { targetResource, targetId, targetView } = actionConfig;
      let path = `/resources/${targetResource}`;
      if (targetView === 'detailView' && targetId) {
        path += `/${targetId}`;
      }
      navigate(path);
    }, [navigate]),
  };

  // --- 3. Memoized Context Value ---
  const value = useMemo(() => ({
    dataVersion,
    refreshData,
    modalService,
    actionService,
  }), [dataVersion, modalService, actionService]);

  return (
    <AppRuntimeContext.Provider value={value}>
      {children}
    </AppRuntimeContext.Provider>
  );
}

/**
 * Custom hook for easy consumption of the AppRuntimeContext.
 */
export const useAppRuntime = () => {
  const context = useContext(AppRuntimeContext);
  if (!context) {
    throw new Error('useAppRuntime must be used within an AppRuntimeProvider');
  }
  return context;
};