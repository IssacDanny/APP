import React, { useState, useEffect } from 'react';
import { NavLink as RouterNavLink, Outlet, useParams, useLocation } from 'react-router-dom';
import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import jsonata from 'jsonata';
import { motion, useAnimationControls, AnimatePresence } from 'framer-motion';
import { FiShoppingCart, FiPackage, FiFileText, FiUsers, FiGrid, FiChevronRight, FiChevronDown, FiPlus } from 'react-icons/fi';

import { useAppRuntime } from '../context/AppRuntimeContext';
import { RenderEngine } from './RenderEngine';
import { Animated } from './Animated';
import { effectLibrary } from './effectLibrary';

export const componentMap = {};

// --- THIS IS THE KEY ---
const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost:4000';

// --- Helper Components ---

const Icon = ({ name }) => {
  const iconMap = {
    cart: <FiShoppingCart />, package: <FiPackage />, 'file-text': <FiFileText />,
    users: <FiUsers />, grid: <FiGrid />, default: <FiGrid />,
  };
  return iconMap[name] || iconMap.default;
};

const StatusPill = ({ status }) => {
    const statusClass = String(status).toLowerCase().replace(' ', '-');
    return <span className={`status-pill status-${statusClass}`}>{status}</span>
};

const PassThruObjectFieldTemplate = (props) => {
  return (
    <div>
      {props.properties.map(element => (
        <div key={element.content.key} className="form-property">
          {element.content}
        </div>
      ))}
    </div>
  );
};

// --- RJSF Custom Templates ---

const AnimatedFieldTemplate = (props) => {
  const { children, rawErrors = [], help, required, displayLabel, label, id } = props;
  const shakeControls = useAnimationControls();
  useEffect(() => {
    if (rawErrors.length > 0) {
      shakeControls.start("shake");
    }
  }, [rawErrors, shakeControls]);

  return (
    <Animated tag="div" effect={["cascadeItem", "fieldErrorShake"]} animate={shakeControls} className="form-group">
      {displayLabel && <label htmlFor={id}>{label}{required && <span className="required-asterisk">*</span>}</label>}
      {children}
      {help}
    </Animated>
  );
};

// =================================================================
// --- Main Components ---
// =================================================================

export const AppShell = ({ title, navigation }) => {
  const location = useLocation();
  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <h1 className="app-sidebar-header">{title}</h1>
        <nav>{navigation.map((item, index) => <RenderEngine key={index} ir={item} />)}</nav>
      </aside>
      <main className="app-main-content">
        <AnimatePresence mode="wait">
          <Animated tag={motion.div} effect="fadeInUp" key={location.pathname}>
            <Outlet />
          </Animated>
        </AnimatePresence>
      </main>
    </div>
  );
};
componentMap.AppShell = AppShell;

export const ResourcePageLayout = ({ title, globalActions, listView }) => (
  // Page transition is now handled by AppShell, so this component is simpler.
  <div>
    <header className="resource-page-header">
      <h2 className="resource-page-title">{title}</h2>
      <div className="resource-page-actions">
        {globalActions.map((action, index) => <RenderEngine key={index} ir={action} />)}
      </div>
    </header>
    <RenderEngine ir={listView} />
  </div>
);
componentMap.ResourcePageLayout = ResourcePageLayout;

export const NavSection = ({ title, children }) => (
  <div className="nav-section">
    <h3 className="nav-section-title">{title}</h3>
    <div>{children.map((childIr, index) => <RenderEngine key={index} ir={childIr} />)}</div>
  </div>
);
componentMap.NavSection = NavSection;

export const NavFolder = ({ title, icon, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleToggle = () => setIsOpen(!isOpen);
  const ArrowIcon = isOpen ? FiChevronDown : FiChevronRight;

  return (
    <div className="nav-folder">
      <div className="nav-folder-toggle" onClick={handleToggle}>
        <Icon name={icon} />
        <span className="nav-item-text">{title}</span>
        <ArrowIcon className="nav-folder-arrow" />
      </div>
      <AnimatePresence>
        {isOpen && (
          <Animated tag="div" effect="smoothDropdown" className="nav-folder-items" key="folder-content">
            {children.map((childIr, index) => (
              <Animated tag="div" effect="cascadeItem" key={index}>
                <RenderEngine ir={childIr} />
              </Animated>
            ))}
          </Animated>
        )}
      </AnimatePresence>
    </div>
  );
};
componentMap.NavFolder = NavFolder;

export const NavLink = ({ text, to, icon }) => (
  <RouterNavLink to={to} className="nav-link">
    {({ isActive }) => (
      <>
        {isActive && (
          <motion.div className="active-nav-indicator" layoutId="activeNavIndicator" initial={false}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
        <Icon name={icon} />
        <span className="nav-item-text">{text}</span>
      </>
    )}
  </RouterNavLink>
);
componentMap.NavLink = NavLink;

export const UserMenu = ({ title, children }) => (
  <div className="user-menu">
    <h4 className="user-menu-title">{title}</h4>
    <div>{children.map((childIr, index) => <RenderEngine key={index} ir={childIr} />)}</div>
  </div>
);
componentMap.UserMenu = UserMenu;

export const MenuLink = ({ text, actionConfig }) => {
  const { actionService } = useAppRuntime(); // Use new context structure
  const handleClick = (e) => {
    e.preventDefault();
    actionService.navigate(actionConfig); // Use new context structure
  };
  return <a href="#" onClick={handleClick} className="menu-link">{text}</a>;
};
componentMap.MenuLink = MenuLink;

export const FormButton = ({ text, actionConfig, itemData }) => {
  const { modalService } = useAppRuntime(); // Use new context structure
  const controls = useAnimationControls();
  const handleClick = () => {
    modalService.open(actionConfig, itemData); // Use new context structure
    controls.start("jiggle");
  };
  return (
    <Animated tag="button" effect={["buttonPress", "clickJiggle"]} className="btn btn-primary" onClick={handleClick} animate={controls}>
      <FiPlus /> {text}
    </Animated>
  );
};
componentMap.FormButton = FormButton;

export const ActionButton = ({ text, actionConfig, itemData }) => {
  const { actionService } = useAppRuntime(); // Use new context structure
  const controls = useAnimationControls();
  const handleClick = async () => {
    let actionResult = false;
    if (actionConfig.confirmationText && window.confirm(actionConfig.confirmationText)) {
      actionResult = await actionService.execute(actionConfig, itemData); // Use new context structure
    } else if (!actionConfig.confirmationText) {
      actionResult = await actionService.execute(actionConfig, itemData); // Use new context structure
    }
    if (actionResult) {
      controls.start("jiggle");
    }
  };
  return (
    <Animated tag="button" effect={["buttonPress", "clickJiggle"]} className="btn" onClick={handleClick} animate={controls}>
      {text}
    </Animated>
  );
};
componentMap.ActionButton = ActionButton;


export const DataTable = ({ columns, resourceEndpoint, itemActions }) => {
  const [data, setData] = useState([]);
  const { dataVersion } = useAppRuntime();

  useEffect(() => {
    setData([]);
    fetch(`${API_HOST}${resourceEndpoint}`)
      .then(res => res.json())
      .then(setData);
  }, [resourceEndpoint, dataVersion]);

  const gridTemplateColumns = `${columns.map(() => '1fr').join(' ')} ${itemActions.length > 0 ? 'auto' : ''}`;

  return (
    <div className="data-list">
      <header className="data-list-header" style={{ gridTemplateColumns }}>
        {columns.map(col => <div key={col.field}>{col.header}</div>)}
      </header>
      <Animated tag="div" effect="cascadeIn" className="data-list-body">
        {data.map(row => (
          // Standardize on using the <Animated> wrapper for consistency
          <Animated tag="div" key={row.id} effect={["cascadeItem", "interactiveTilt"]}
            className="data-list-row" style={{ gridTemplateColumns }}>
            {columns.map(col => (
              <div key={col.field} className="data-list-cell">
                {col.field === 'status' ? <StatusPill status={row[col.field]} /> : row[col.field]}
              </div>
            ))}
            {itemActions.length > 0 && (
              <div className="data-list-cell data-list-actions">
                {itemActions.map((actionIR, index) => <RenderEngine key={index} ir={actionIR} itemData={row} />)}
              </div>
            )}
          </Animated>
        ))}
      </Animated>
    </div>
  );
};
componentMap.DataTable = DataTable;

const ModalForm = ({ config, initialData, onClose }) => {
  const { actionService } = useAppRuntime();
  const handleSubmit = ({ formData }) => {
    actionService.execute(config, initialData, formData);
  };

  let formData = initialData;
  if (initialData && config.dataMapTransform) {
      try { formData = jsonata(config.dataMapTransform).evaluate(initialData); }
      catch(e) { console.error("JSONata error:", e); }
  }

  // The <Animated> wrapper has been removed from here.
  return (
    <Form
      schema={config.formSchema.schema}
      uiSchema={config.formSchema.uiSchema || {}}
      formData={formData}
      validator={validator}
      onSubmit={handleSubmit}
      templates={{ FieldTemplate: AnimatedFieldTemplate, ObjectFieldTemplate: PassThruObjectFieldTemplate }}
      showErrorList={false}
    >
      <div className="modal-actions">
          <Animated tag="button" effect="buttonPress" type="button" className="btn" onClick={onClose}>Cancel</Animated>
          <Animated tag="button" effect="buttonPress" type="submit" className="btn btn-primary">Submit</Animated>
      </div>
    </Form>
  );
}

export const GlobalFormModal = () => {
  const { modalState, modalService } = useAppRuntime(); 
  const { isOpen, config, initialData } = modalState;

  if (!isOpen) return null;

  return (
    <Animated tag="div" effect="modalBackdrop" className="modal-backdrop">
      <Animated tag="div" effect="modalContent" className="modal-content" key="form-modal">
        <h3 className="modal-header">{config.formSchema.schema.title || config.name}</h3>
        <ModalForm config={config} initialData={initialData} onClose={modalService.close}/> 
      </Animated>
    </Animated>
  );
};

export const DetailView = ({ fields, resourceEndpoint, resourceName }) => {
  const { itemId } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_HOST}${resourceEndpoint}/${itemId}`)
      .then(res => res.json())
      .then(data => {
        setItem(data);
        setLoading(false);
      });
  }, [resourceEndpoint, itemId]);

  if (loading) return <p>Loading details...</p>;
  if (!item) return <p>Item not found.</p>;

  return (
    // Page transition is handled by AppShell, so no wrapper needed here
    <div>
      <h2 className="resource-page-title">{resourceName} Details</h2>
      <Animated tag="div" effect="interactiveTilt" className="detail-view-card">
        {fields.map(field => (
          <div key={field.field} className="detail-field">
            <span className="detail-field-label">{field.label}</span>
            <span className="detail-field-value">{item[field.field]}</span>
          </div>
        ))}
      </Animated>
    </div>
  );
};
componentMap.DetailView = DetailView;