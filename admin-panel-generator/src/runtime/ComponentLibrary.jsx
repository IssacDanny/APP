// src/runtime/ComponentLibrary.jsx

import React, { useState, useEffect } from 'react';
import { NavLink as RouterNavLink, Outlet } from 'react-router-dom';
import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import jsonata from 'jsonata';

import { useAppRuntime } from '../context/AppRuntimeContext.js';
import RenderEngine from './RenderEngine.jsx'; // For rendering nested IR (e.g., actions)

// --- Layout & Navigation Components ---

export const AppShell = ({ title, navigation }) => (
  <div className="app-shell">
    <aside className="sidebar">
      <h1>{title}</h1>
      <nav>
        {/* This part is fine. It renders the navigation IR. */}
        {navigation.map((navSpec, i) => <RenderEngine key={i} spec={navSpec} />)}
      </nav>
    </aside>
    <main className="content-area">
      {/* 
        This is the crucial change. 
        The <Outlet/> component from React Router will render whatever child route is active.
      */}
      <Outlet />
    </main>
  </div>
);

export const NavMenuGroup = ({ title, children }) => (
  <div className="nav-group">
    <h4>{title}</h4>
    <ul>{children}</ul>
  </div>
);

export const UserMenu = ({ title, children }) => (
  <div className="nav-group user-menu">
    <h4>{title}</h4>
    <ul>{children}</ul>
  </div>
);

export const NavLink = ({ text, to }) => (
  <li><RouterNavLink to={to}>{text}</RouterNavLink></li>
);

export const MenuLink = ({ text, actionConfig }) => {
  const handleClick = () => {
    // For now, we'll just log the action.
    // A full implementation would use the runtime context to navigate.
    console.log("Navigate action triggered:", actionConfig);
    alert(`Navigate to ${actionConfig.resource}'s ${actionConfig.view || 'detail view'}`);
  };

  return (
    <li>
      <a href="#" onClick={handleClick} style={{cursor: 'pointer'}}>{text}</a>
    </li>
  );
};

export const ResourcePageLayout = ({ title, globalActions, listView }) => (
  <div>
    <header className="page-header">
      <h2>{title}</h2>
      <div className="global-actions">
        {globalActions.map((actionSpec, i) => <RenderEngine key={i} spec={actionSpec} />)}
      </div>
    </header>
    <div className="page-content">
      <RenderEngine spec={listView} />
    </div>
  </div>
);

// --- Action & Data Components ---

export const DataTable = ({ columns, resourceId, resourceEndpoint, itemActions }) => {
  const { apiCall, addRefreshListener, removeRefreshListener } = useAppRuntime();
  const [data, setData] = useState([]);

  const fetchData = async () => {
    console.log(`Fetching data for ${resourceId}...`);
    // Mock data for now. In a real app, this would be an API call.
    // const response = await apiCall('GET', resourceEndpoint);
    const mockData = [
      { id: 'prod_1', name: 'Super Widget', stock: 100 },
      { id: 'prod_2', name: 'Mega Gizmo', stock: 42 },
    ];
    setData(mockData);
  };

  useEffect(() => {
    fetchData();
    // Listen for refresh events for this specific resource
    addRefreshListener(resourceId, fetchData);
    return () => {
      removeRefreshListener(resourceId, fetchData);
    };
  }, [resourceId]);

  return (
    <table>
      <thead>
        <tr>
          {columns.map(c => <th key={c.field}>{c.header}</th>)}
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map(item => (
          <tr key={item.id}>
            {columns.map(c => <td key={c.field}>{item[c.field]}</td>)}
            <td className="item-actions">
              {itemActions.map((actionSpec, i) => (
                <RenderEngine key={i} spec={actionSpec} contextProps={{ item, resourceId }} />
              ))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// The "Action Runtime" Button Components
export const ActionButton = ({ text, actionConfig, item, resourceId }) => {
  const { apiCall, triggerRefresh } = useAppRuntime();

  const handleClick = async () => {
    let endpoint = actionConfig.endpoint;
    if (item && item.id) {
      endpoint = endpoint.replace('{id}', item.id);
    }
    
    if (actionConfig.confirmationText && !window.confirm(actionConfig.confirmationText)) {
      return;
    }

    await apiCall(actionConfig.method, endpoint, null);
    triggerRefresh(resourceId); // Notify other components to refresh
  };
  return <button onClick={handleClick}>{text}</button>;
};

export const FormButton = ({ text, actionConfig, item, resourceId }) => {
  const { openFormModal, apiCall, triggerRefresh } = useAppRuntime();

  const handleClick = async () => {
    let initialData = {};
    if (item) { // This is an "edit" action
      // Fetch fresh data for the item to edit
      const endpoint = actionConfig.endpoint.replace('{id}', item.id);
      const itemData = await apiCall('GET', endpoint); // Mock this for now
      
      if (actionConfig.dataMapTransform) {
        // Apply inbound transformation (Service -> UI)
        const expression = jsonata(actionConfig.dataMapTransform);
        initialData = expression.evaluate(itemData || item);
      } else {
        initialData = itemData || item;
      }
    }
    
    openFormModal(actionConfig, initialData, () => {
      // This callback is executed after the form is successfully submitted.
      triggerRefresh(resourceId);

    });
  };
  return <button onClick={handleClick}>{text}</button>;
};

// A generic modal that is controlled by the main App state
export const FormModal = ({ isOpen, config, initialData, onFinished, onClose }) => {
  const { apiCall } = useAppRuntime();
  if (!isOpen || !config) return null;

  const handleSubmit = async ({ formData }) => {
    let finalPayload = formData;
    let endpoint = config.endpoint;

    if (initialData && initialData.id) {
      endpoint = endpoint.replace('{id}', initialData.id);
    }

    if (config.payloadTransform) {
      // Apply outbound transformation (UI -> Service)
      const expression = jsonata(config.payloadTransform);
      finalPayload = expression.evaluate(formData);
    }

    await apiCall(config.method, endpoint, finalPayload);
    onClose();
    if(onFinished) onFinished();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3>{config.formSchema.schema.title || 'Form'}</h3>
        <Form
          schema={config.formSchema.schema}
          uiSchema={config.formSchema.uiSchema}
          formData={initialData}
          validator={validator}
          onSubmit={handleSubmit}
        />
        <button className="close-modal" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};