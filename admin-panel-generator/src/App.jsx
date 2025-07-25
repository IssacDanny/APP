// src/App.jsx

import React, { useState, useEffect } from 'react';
import {Routes, Route } from 'react-router-dom';

// --- Compiler Imports ---
import { linkSchemas } from './compiler/linker';
import { parseAdminPanelSchema } from './compiler/parser';
import { UIGeneratorVisitor } from './compiler/visitor';

// --- Runtime Imports ---
import { AppRuntimeProvider } from './context/AppRuntimeContext';
import { RenderEngine } from './runtime/RenderEngine';
import { GlobalFormModal } from './runtime/ComponentLibrary';


/**
 * The main App component. It orchestrates the entire application lifecycle.
 */
function App() {
  // State to hold the final UI Intermediate Representation (IR)
  const [uiIR, setUiIR] = useState(null);
  // State to hold any fatal error that occurs during compilation
  const [error, setError] = useState(null);

  // This effect runs once on component mount to perform the "compilation"
  useEffect(() => {
    const compileApplication = async () => {
      try {
        // 1. Fetch the list of service schemas from our mock backend
        const response = await fetch('http://localhost:3001/api/schemas');
        if (!response.ok) {
          throw new Error(`Failed to fetch schemas: ${response.statusText}`);
        }
        const serviceSchemas = await response.json();
        console.log("✅ [Step 1/4] Fetched service schemas:", serviceSchemas);

        // 2. Link schemas into one grand schema using our linker
        const grandSchema = linkSchemas(serviceSchemas);
        console.log("✅ [Step 2/4] Linked into grand schema:", grandSchema);

        // 3. Parse the grand schema to generate the Abstract Syntax Tree (AST)
        const ast = parseAdminPanelSchema(JSON.stringify(grandSchema));
        console.log("✅ [Step 3/4] Generated AST:", ast);

        // 4. Visit the AST to generate the UI Intermediate Representation (IR)
        const visitor = new UIGeneratorVisitor();
        const generatedIr = ast.accept(visitor);
        console.log("✅ [Step 4/4] Generated UI IR:", generatedIr);
        
        setUiIR(generatedIr);

      } catch (err) {
        console.error("💥 COMPILATION FAILED:", err);
        setError(err.message);
      }
    };

    compileApplication();
  }, []); // The empty dependency array [] ensures this effect runs only once.

  // --- Conditional Rendering based on Compilation State ---

  if (error) {
    return (
      <div style={{ padding: '2rem', color: '#d32f2f', background: '#ffebee', border: '1px solid #d32f2f' }}>
        <h1>Application Failed to Load</h1>
        <p>A fatal error occurred during the compilation phase:</p>
        <pre>{error}</pre>
      </div>
    );
  }

  if (!uiIR) {
    return <div style={{ padding: '2rem', fontSize: '1.5rem' }}>Loading and Compiling UI...</div>;
  }

  // --- Successful Render ---
  // If we have the UI IR, render the full application.
  return (
    <AppRuntimeProvider>
      {/* The GlobalFormModal is placed here so it can overlay any page */}
      <GlobalFormModal />

      <Routes>
        {/* 
          This is a "Layout Route". 
          1. It matches the base path "/".
          2. It renders the AppShell via the RenderEngine.
          3. All nested <Route> components will be rendered inside the AppShell's <Outlet />.
        */}
        <Route path="/" element={<RenderEngine ir={uiIR} />} >
          
          {/* The default page shown when visiting the root URL "/" */}
          <Route index element={
            <div style={{ textAlign: 'center', paddingTop: '4rem', color: '#666' }}>
              <h2>Welcome to the Admin Panel</h2>
              <p>Please select a resource from the navigation menu to begin.</p>
            </div>
          }/>

          {/* Dynamically create a route for each resource page defined in the IR */}
          {uiIR.props.routes.map(route => (
            <Route 
              key={route.path}
              path={route.path} 
              element={<RenderEngine ir={route.element} />} 
            />
          ))}

          {/* A fallback route for any path not matched */}
          <Route path="*" element={<h2>404: Page Not Found</h2>} />

        </Route>
      </Routes>
    </AppRuntimeProvider>
  );
}

export default App;