import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import jsonata from 'jsonata';
import { toast } from 'react-hot-toast';
import { useApiService } from './ApiServiceContext';

const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost:4000';
const AppRuntimeContext = createContext(null);

export function AppRuntimeProvider({ children }) {
  const navigate = useNavigate();
  const api = useApiService();
  const [modalState, setModalState] = useState({ isOpen: false, config: null, initialData: null });
  const [dataVersion, setDataVersion] = useState(1);
  const refreshData = () => setDataVersion(v => v + 1);
  
  // --- Memoized Callbacks (These are stable) ---
  const openFormModal = useCallback((actionConfig, itemData = null) => {
    setModalState({ isOpen: true, config: actionConfig, initialData: itemData });
  }, []);

  const closeModal = useCallback(() => {
    setModalState({ isOpen: false, config: null, initialData: null });
  }, []);
  
  const executeApiAction = useCallback(async (actionConfig, itemData = null, formData = null) => {
    // ... (This function's logic is correct and does not need to change)
    let { endpoint, method } = actionConfig;
    if (itemData?.id && endpoint.includes('{id}')) {
      endpoint = endpoint.replace('{id}', itemData.id);
    }

    try {
      await api.request(endpoint, { method, body: formData });
      toast.success('Action successful!');
      refreshData();
      closeModal();
      return true;
    } catch (e) {
      toast.error(`Error: ${e.message}`);
      return false;
    }
  }, [api, closeModal, refreshData]);

  const handleNavigationAction = useCallback((actionConfig) => {
    const { targetResource, targetId, targetView } = actionConfig;
    let path = `/resources/${targetResource}`;
    if (targetView === 'detailView' && targetId) { path += `/${targetId}`; }
    navigate(path);
  }, [navigate]);

  // --- Memoize the service OBJECTS ---
   const modalService = useMemo(() => ({
    open: openFormModal,
    close: closeModal,
  }), [openFormModal, closeModal]);

  const actionService = useMemo(() => ({
    execute: executeApiAction,
    navigate: handleNavigationAction,
  }), [executeApiAction, handleNavigationAction]);
  // --- Memoized Context Value ---
  const value = useMemo(() => ({
    dataVersion,
    refreshData,
    modalState, // Provide the state directly
    modalService, // Provide the stable service object
    actionService,
  }), [dataVersion, modalState, modalService, actionService]);
  return (
    <AppRuntimeContext.Provider value={value}>
      {children}
    </AppRuntimeContext.Provider>
  );
}

export const useAppRuntime = () => {
  const context = useContext(AppRuntimeContext);
  if (!context) {
    throw new Error('useAppRuntime must be used within an AppRuntimeProvider');
  }
  return context;
};