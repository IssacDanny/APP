import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';

import { useCompiler } from './hooks/useCompiler';
import { AppRuntimeProvider } from './context/AppRuntimeContext';
import { RenderEngine } from './runtime/RenderEngine';
import { GlobalFormModal } from './runtime/ComponentLibrary';
import { AppLoader, AppError } from './components/AppStatus';

import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';


function AdminPanelLayout() {
  const { ir, error, isLoading } = useCompiler();
  const navigate = useNavigate();

  // Listen for the custom 'logout' event from the ApiService
  useEffect(() => {
      const handleLogout = () => navigate('/login');
      window.addEventListener('logout', handleLogout);
      return () => window.removeEventListener('logout', handleLogout);
  }, [navigate]);

  if (isLoading) return <AppLoader />;
  if (error) return <AppError error={error} />;
  if (!ir) return <AppError error="Compiler returned empty UI definition." />;

  // This is the protected part of the app
  return (
    <AppRuntimeProvider>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <AnimatePresence><GlobalFormModal /></AnimatePresence>

      <Routes>
        <Route path="/" element={<RenderEngine ir={ir} />}>
          <Route index element={
            <div style={{ textAlign: 'center', paddingTop: '4rem' }}>
              <h2>Welcome to the Admin Panel</h2>
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


/**
 * The main App component. It orchestrates the providers and routing,
 * while delegating compilation logic to the `useCompiler` hook.
 */
function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route 
        path="/*" 
        element={
          <ProtectedRoute>
            <AdminPanelLayout />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App;