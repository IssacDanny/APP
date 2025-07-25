// src/App.jsx

import React, { useState, useMemo, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Our Compiler
import { parseAdminPanelSchema } from './compiler/parser';
import { UIGeneratorVisitor } from './compiler/visitor';
import sampleSchema from './schemas/sampleSchema.json';

// Our Runtime
import { AppRuntimeContext } from './context/AppRuntimeContext';
import RenderEngine from './runtime/RenderEngine';
import { FormModal, AppShell } from './runtime/ComponentLibrary';

// A simple in-memory event emitter for data refresh notifications
const createEventEmitter = () => {
  const listeners = {};
  return {
    addListener: (event, callback) => {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(callback);
    },
    removeListener: (event, callback) => {
      if (listeners[event]) {
        listeners[event] = listeners[event].filter(l => l !== callback);
      }
    },
    trigger: (event) => {
      if (listeners[event]) {
        listeners[event].forEach(l => l());
      }
    },
  };
};

function App() {
  // --- STATE MANAGEMENT ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({ actionConfig: null, initialData: null, onFinished: null });
  const eventEmitter = useMemo(() => createEventEmitter(), []);

  // --- COMPILATION ---
  // useMemo ensures the entire compilation process runs only once.
  const uiIR = useMemo(() => {
    try {
      const schemaString = JSON.stringify(sampleSchema);
      const astRoot = parseAdminPanelSchema(schemaString);
      const visitor = new UIGeneratorVisitor();
      return astRoot.accept(visitor);
    } catch (e) {
      console.error("COMPILATION FAILED:", e);
      return { error: e.message }; // Return an error object if compilation fails
    }
  }, []);

  // --- RUNTIME SERVICES IMPLEMENTATION ---
  const runtimeServices = {
    apiCall: useCallback(async (method, endpoint, body) => {
      console.log(`[API Call] ${method}: ${endpoint}`, body || '');
      // MOCK API RESPONSE
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network latency
      if (method === 'GET' && endpoint.includes('/api/v1/products/')) {
        return { id: 'prod_1', name: 'Super Widget (Updated)', stock: 99 };
      }
      console.log(`[API Success]`);
      return { success: true };
    }, []),

    openFormModal: useCallback((actionConfig, initialData, onFinished) => {
      setModalConfig({ actionConfig, initialData, onFinished });
      setIsModalOpen(true);
    }, []),

    closeModal: useCallback(() => {
      setIsModalOpen(false);
    }, []),

    addRefreshListener: useCallback((resourceId, callback) => {
      eventEmitter.addListener(`refresh-${resourceId}`, callback);
    }, [eventEmitter]),

    removeRefreshListener: useCallback((resourceId, callback) => {
      eventEmitter.removeListener(`refresh-${resourceId}`, callback);
    }, [eventEmitter]),

    triggerRefresh: useCallback((resourceId) => {
      console.log(`Triggering refresh for resource: ${resourceId}`);
      eventEmitter.trigger(`refresh-${resourceId}`);
    }, [eventEmitter]),
  };

  // --- RENDER LOGIC ---

  // Handle compilation errors gracefully
  if (uiIR.error) {
    return (
      <div className="error-display">
        <h1>Failed to Build Admin Panel</h1>
        <pre style={{ whiteSpace: 'pre-wrap', background: '#fee', padding: '1rem' }}>
          {uiIR.error}
        </pre>
      </div>
    );
  }

  // The main application render
  return (
    <AppRuntimeContext.Provider value={runtimeServices}>
      <Routes>
        <Route
          path="/"
          element={
            <AppShell
              title={uiIR.props.title}
              navigation={uiIR.props.navigation}
            />
          }
        >
          {/* 
            These are the child routes. They will be rendered inside the 
            AppShell's <Outlet /> when their path matches.
          */}
          {uiIR.props.routes.map(route => (
            <Route
              key={route.path}
              path={route.path}
              element={<RenderEngine spec={route.element} />}
            />
          ))}

          {/* 
            The default redirect now uses the 'index' prop, which is the
            correct way to specify a default child route.
          */}
          <Route
            index
            element={<Navigate to={uiIR.props.routes[0]?.path || '/'} replace />}
          />
        </Route>
      </Routes>

      {/* The global modal remains outside the routing structure, which is correct. */}
      <FormModal
        isOpen={isModalOpen}
        config={modalConfig.actionConfig}
        initialData={modalConfig.initialData}
        onFinished={modalConfig.onFinished}
        onClose={runtimeServices.closeModal}
      />
    </AppRuntimeContext.Provider>
  );
}

export default App;