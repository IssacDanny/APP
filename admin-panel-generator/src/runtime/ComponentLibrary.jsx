import React, { useState, useEffect } from 'react';
import { NavLink as RouterNavLink, Outlet } from 'react-router-dom';
import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import jsonata from 'jsonata';

// 1. Import the stylesheet. This makes all our classNames work.
import './runtime.css';

// 2. Import the runtime context hook to access shared services.
import { useAppRuntime } from '../context/AppRuntimeContext';

// 3. Import the RenderEngine, which will be used to render nested IR.
//    (We will create this file in the next step).
import { RenderEngine } from './RenderEngine';

/**
 * The componentMap is a "dictionary" that the RenderEngine uses to find the correct
 * React component for a given IR 'component' name. We populate it after each
*  component definition.
 */
export const componentMap = {};

// =================================================================
// --- Shell and Layout Components ---
// =================================================================

export const AppShell = ({ title, navigation }) => (
  <div className="app-shell">
    <aside className="app-sidebar">
      <h1 className="app-sidebar-header">{title}</h1>
      <nav>
        {navigation.map((item, index) => <RenderEngine key={index} ir={item} />)}
      </nav>
    </aside>
    <main className="app-main-content">
      <Outlet /> {/* This is where React Router renders the active page */}
    </main>
  </div>
);
componentMap.AppShell = AppShell;

export const ResourcePageLayout = ({ title, globalActions, listView }) => (
  <div>
    <header className="resource-page-header">
      <h2 className="resource-page-title">{title}</h2>
      <div className="resource-page-actions">
        {globalActions.map((action, index) => <RenderEngine key={index} ir={action} />)}
      </div>
    </header>
    <hr className="resource-page-divider" />
    <RenderEngine ir={listView} />
  </div>
);
componentMap.ResourcePageLayout = ResourcePageLayout;

// =================================================================
// --- Navigation Components ---
// =================================================================

export const NavSection = ({ title, children }) => (
  <div className="nav-section">
    <h3 className="nav-section-title">{title}</h3>
    {/* This component receives an array of IR objects.
        We must map over them and use RenderEngine. */}
    <div>
      {children.map((childIr, index) => <RenderEngine key={index} ir={childIr} />)}
    </div>
  </div>
);
componentMap.NavSection = NavSection;
componentMap.NavSection = NavSection; // Make sure the map entry is still there

export const NavFolder = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false); // State to track expanded/collapsed

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  // Determine the icon based on the state
  const icon = isOpen ? '▼' : '▶';

  return (
    <div className="nav-folder">
      <a href="#" className="nav-folder-toggle" onClick={handleToggle}>
        <span className="nav-folder-icon">{icon}</span>
        {title}
      </a>
      {/* Conditionally render the children based on the 'isOpen' state */}
      {isOpen && (
        <div className="nav-folder-items">
          {children.map((childIr, index) => <RenderEngine key={index} ir={childIr} />)}
        </div>
      )}
    </div>
  );
};
componentMap.NavFolder = NavFolder;

export const NavLink = ({ text, to }) => (
  <RouterNavLink to={to} className="nav-link">
    {text}
  </RouterNavLink>
);
componentMap.NavLink = NavLink;

export const UserMenu = ({ title, children }) => (
  <div className="user-menu">
    <h4 className="user-menu-title">{title}</h4>
    {/* This component also receives an array of IR objects
        and must use RenderEngine to render them. */}
    <div>
      {children.map((childIr, index) => <RenderEngine key={index} ir={childIr} />)}
    </div>
  </div>
);
componentMap.UserMenu = UserMenu;

export const MenuLink = ({ text, actionConfig }) => {
  // const { handleNavigation } = useAppRuntime(); // We would use this in a more advanced version
  const handleClick = (e) => {
    e.preventDefault();
    alert(`Navigation action triggered: ${JSON.stringify(actionConfig)}`);
  };
  return <a href="#" onClick={handleClick} className="menu-link">{text}</a>;
};
componentMap.MenuLink = MenuLink;


// =================================================================
// --- Action Components (Buttons) ---
// =================================================================

export const FormButton = ({ text, actionConfig, itemData }) => {
  const { openFormModal } = useAppRuntime();
  return <button className="btn" onClick={() => openFormModal(actionConfig, itemData)}>{text}</button>;
};
componentMap.FormButton = FormButton;

export const ActionButton = ({ text, actionConfig, itemData }) => {
  const { executeApiAction } = useAppRuntime();

  const handleClick = () => {
    if (actionConfig.confirmationText) {
      if (window.confirm(actionConfig.confirmationText)) {
        executeApiAction(actionConfig, itemData);
      }
    } else {
      executeApiAction(actionConfig, itemData);
    }
  };
  return <button className="btn" onClick={handleClick}>{text}</button>;
};
componentMap.ActionButton = ActionButton;


// =================================================================
// --- Data Display Components ---
// =================================================================

export const DataTable = ({ columns, resourceEndpoint, itemActions }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { dataVersion } = useAppRuntime(); // Get the data version from context

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3001${resourceEndpoint}`);
        if (!response.ok) throw new Error("Network response was not ok");
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        // TODO: Set an error state to display to the user
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // This effect re-runs whenever the resourceEndpoint changes OR when
    // dataVersion is incremented by a successful API action.
  }, [resourceEndpoint, dataVersion]);

  if (loading) return <p>Loading data...</p>;

  return (
    <table className="data-table">
      <thead>
        <tr>
          {columns.map(col => <th key={col.field}>{col.header}</th>)}
          {itemActions.length > 0 && <th>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {data.map(row => (
          <tr key={row.id}>
            {columns.map(col => <td key={col.field}>{row[col.field]}</td>)}
            {itemActions.length > 0 && (
              <td>
                <div className="data-table-actions">
                  {itemActions.map((actionIR, index) => (
                    // CRITICAL: Pass the row data down to the action buttons
                    <RenderEngine key={index} ir={actionIR} itemData={row} />
                  ))}
                </div>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
componentMap.DataTable = DataTable;


// =================================================================
// --- Global Modal for Forms ---
// NOTE: This component is NOT rendered by the RenderEngine.
// It is placed once in App.jsx and controlled by AppRuntimeContext.
// =================================================================

export const GlobalFormModal = () => {
  const { modalState, closeModal, executeApiAction } = useAppRuntime();
  const { isOpen, config, initialData } = modalState;

  if (!isOpen) return null;

  // Handle data mapping for pre-filling edit forms
  let formData = initialData;
  if (initialData && config.dataMapTransform) {
    try {
      formData = jsonata(config.dataMapTransform).evaluate(initialData);
    } catch(e) {
      console.error("JSONata dataMapTransform error:", e);
      // Fallback to initial data if transform fails
      formData = initialData;
    }
  }

  const handleSubmit = ({ formData }) => {
    // Pass all necessary context to the API execution function
    executeApiAction(config, initialData, formData);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3 className="modal-header">{config.formSchema.schema.title || config.name}</h3>
        <Form
          schema={config.formSchema.schema}
          uiSchema={config.formSchema.uiSchema || {}}
          formData={formData}
          validator={validator}
          onSubmit={handleSubmit}
        >
          {/* RJSF renders its own submit button by default. We provide our own for consistent styling. */}
          <div className="modal-actions">
              <button type="button" className="btn" onClick={closeModal}>Cancel</button>
              <button type="submit" className="btn btn-primary">Submit</button>
          </div>
        </Form>
      </div>
    </div>
  );
};