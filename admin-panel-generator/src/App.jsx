import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';

import { useCompiler } from './hooks/useCompiler';
import { AppRuntimeProvider } from './context/AppRuntimeContext';
import { RenderEngine } from './runtime/RenderEngine';
import { GlobalFormModal } from './runtime/ComponentLibrary';
import { AppLoader, AppError } from './components/AppStatus';

/**
 * The main App component. It orchestrates the providers and routing,
 * while delegating compilation logic to the `useCompiler` hook.
 */
function App() {
  const { ir, error, isLoading } = useCompiler();

  if (isLoading) {
    return <AppLoader />;
  }

  if (error) {
    return <AppError error={error} />;
  }
  
  // A final guard in case the IR is somehow null after loading.
  if (!ir) {
    return <AppError error="Compiler returned empty UI definition." />;
  }

  return (
    <AppRuntimeProvider>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <AnimatePresence>
        <GlobalFormModal />
      </AnimatePresence>

      <Routes>
        <Route path="/" element={<RenderEngine ir={ir} />}>
          <Route index element={
            <div style={{ textAlign: 'center', paddingTop: '4rem', color: '#666' }}>
              <h2>Welcome to the Admin Panel</h2>
              <p>Please select a resource from the navigation menu to begin.</p>
            </div>
          }/>
          {ir.props.routes.map(route => (
            <Route 
              key={route.path}
              path={route.path} 
              element={<RenderEngine ir={route.element} />} 
            />
          ))}
          <Route path="*" element={<h2>404: Page Not Found</h2>} />
        </Route>
      </Routes>
    </AppRuntimeProvider>
  );
}

export default App;