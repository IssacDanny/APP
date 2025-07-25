import React, { useState, useEffect } from 'react';
import { NavLink as RouterNavLink, Outlet, useParams, useLocation } from 'react-router-dom';
import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import jsonata from 'jsonata';
import { motion, useAnimationControls, AnimatePresence } from 'framer-motion';
import { FiShoppingCart, FiPackage, FiFileText, FiUsers, FiGrid, FiChevronRight, FiChevronDown, FiPlus } from 'react-icons/fi';

// --- STYLES AND CONTEXT ---
import './runtime.css';
import { useAppRuntime } from '../context/AppRuntimeContext';

// --- CORE AND EFFECT IMPORTS ---
import { RenderEngine } from './RenderEngine';
import { Animated } from './Animated';
import { effectLibrary } from './effectLibrary';

export const componentMap = {};

// --- Reusable Icon Component ---
const iconMap = {
  cart: <FiShoppingCart />,
  package: <FiPackage />,
  'file-text': <FiFileText />,
  users: <FiUsers />,
  grid: <FiGrid />,
  default: <FiGrid />,
};
const Icon = ({ name }) => iconMap[name] || iconMap.default;

// =================================================================
// --- Shell and Layout Components ---
// =================================================================

export const AppShell = ({ title, navigation }) => {
  const location = useLocation();

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <h1 className="app-sidebar-header">{title}</h1>
        <nav>
          {navigation.map((item, index) => <RenderEngine key={index} ir={item} />)}
        </nav>
      </aside>
      <main className="app-main-content">
        {/* 3. Wrap the Outlet with AnimatePresence */}
        <AnimatePresence mode="wait">
          {/* 
            4. IMPORTANT: Wrap the Outlet in a motion.div and give it a key.
            The key tells AnimatePresence that the component has changed,
            triggering the exit/enter animations. `location.pathname` is the
            perfect unique key for a page.
          */}
          <motion.div key={location.pathname}>
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};
componentMap.AppShell = AppShell;

export const ResourcePageLayout = ({ title, globalActions, listView }) => (
  <Animated tag="div" effect="fadeInUp">
    <header className="resource-page-header">
      <h2 className="resource-page-title">{title}</h2>
      <div className="resource-page-actions">
        {globalActions.map((action, index) => <RenderEngine key={index} ir={action} />)}
      </div>
    </header>
    <RenderEngine ir={listView} />
  </Animated>
);
componentMap.ResourcePageLayout = ResourcePageLayout;

// =================================================================
// --- Navigation Components ---
// =================================================================

export const NavSection = ({ title, children }) => (
  <div className="nav-section">
    <h3 className="nav-section-title">{title}</h3>
    <div>
      {children.map((childIr, index) => <RenderEngine key={index} ir={childIr} />)}
    </div>
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
      
      {/* 1. Wrap the conditional rendering with AnimatePresence */}
      <AnimatePresence>
        {isOpen && (
          // 2. Use our Animated engine with the new effect
          <Animated
            tag="div"
            effect="smoothDropdown"
            className="nav-folder-items"
            key="folder-content" // A key is needed for AnimatePresence to track the element
          >
            {/* Each child link will be animated by staggerChildren */}
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
          <motion.div
            className="active-nav-indicator"
            layoutId="activeNavIndicator"
            initial={false}
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
    <div>
      {children.map((childIr, index) => <RenderEngine key={index} ir={childIr} />)}
    </div>
  </div>
);
componentMap.UserMenu = UserMenu;

export const MenuLink = ({ text, actionConfig }) => {
  // 1. Get the new handler from our AppRuntimeContext
  const { handleNavigationAction } = useAppRuntime();

  const handleClick = (e) => {
    e.preventDefault(); // Prevent the link from navigating to "#"
    
    // 2. Call the context function with the action's config
    handleNavigationAction(actionConfig);
  };
  
  return (
    <a href="#" onClick={handleClick} className="menu-link">
      {text}
    </a>
  );
};
componentMap.MenuLink = MenuLink;


// =================================================================
// --- Action Components (Buttons) ---
// =================================================================

export const FormButton = ({ text, actionConfig, itemData }) => {
  const { openFormModal } = useAppRuntime();
  // 1. Get animation controls from the hook
  const controls = useAnimationControls();

  const handleClick = () => {
    openFormModal(actionConfig, itemData);
    // 2. Start the "jiggle" animation after the main action
    controls.start("jiggle");
  };

  return (
    <Animated
      tag="button"
      // 3. Add "clickJiggle" to the list of effects
      effect={["buttonPress", "clickJiggle"]}
      className="btn btn-primary"
      onClick={handleClick}
      // 4. Pass the controls to the Animated engine
      animate={controls}
    >
      <FiPlus /> {text}
    </Animated>
  );
};
componentMap.FormButton = FormButton;

export const ActionButton = ({ text, actionConfig, itemData }) => {
  const { executeApiAction } = useAppRuntime();
  const controls = useAnimationControls();

  const handleClick = async () => {
    let actionResult = false;
    if (actionConfig.confirmationText) {
      if (window.confirm(actionConfig.confirmationText)) {
        actionResult = await executeApiAction(actionConfig, itemData);
      }
    } else {
      actionResult = await executeApiAction(actionConfig, itemData);
    }
    
    // Only jiggle if the action was attempted and successful
    if (actionResult) {
      controls.start("jiggle");
    }
  };

  return (
    <Animated
      tag="button"
      effect={["buttonPress", "clickJiggle"]}
      className="btn"
      onClick={handleClick}
      animate={controls}
    >
      {text}
    </Animated>
  );
};
componentMap.ActionButton = ActionButton;


// =================================================================
// --- Data Display Components ---
// =================================================================

const StatusPill = ({ status }) => {
    const statusClass = String(status).toLowerCase().replace(' ', '-');
    return <span className={`status-pill status-${statusClass}`}>{status}</span>
};

export const DataTable = ({ columns, resourceEndpoint, itemActions }) => {
  const [data, setData] = useState([]);
  const { dataVersion } = useAppRuntime();

  useEffect(() => {
    setData([]);
    setTimeout(() => {
        fetch(`http://localhost:3001${resourceEndpoint}`)
        .then(res => res.json())
        .then(setData);
    }, 150)
  }, [resourceEndpoint, dataVersion]);

  const gridTemplateColumns = `${columns.map(() => '1fr').join(' ')} ${itemActions.length > 0 ? 'auto' : ''}`;

  return (
    <div className="data-list">
      <header className="data-list-header" style={{ gridTemplateColumns }}>
        {columns.map(col => <div key={col.field}>{col.header}</div>)}
      </header>
      <Animated tag="div" effect="cascadeIn" className="data-list-body">
        {data.map(row => (
          <motion.div
            key={row.id}
            effect={["cascadeItem", "interactiveTilt"]}
            className="data-list-row"
            style={{ gridTemplateColumns }}
          >
            {columns.map(col => (
              <div key={col.field} className="data-list-cell">
                {col.field === 'status' ? <StatusPill status={row[col.field]} /> : row[col.field]}
              </div>
            ))}
            {itemActions.length > 0 && (
              <div className="data-list-cell data-list-actions">
                {itemActions.map((actionIR, index) => (
                  <RenderEngine key={index} ir={actionIR} itemData={row} />
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </Animated>
    </div>
  );
};
componentMap.DataTable = DataTable;

// =================================================================
// --- Global Modal for Forms ---
// =================================================================

// 1. Create a new sub-component for the form itself.
// This allows us to use hooks like useAnimationControls.
// src/runtime/ComponentLibrary.jsx

// Find and REPLACE the ModalForm component
const ModalForm = ({ config, initialData, onClose }) => {
    const { executeApiAction } = useAppRuntime();
    const submitControls = useAnimationControls();

    // The handleSubmit function is now simpler
    const handleSubmit = async ({ formData }) => {
        const success = await executeApiAction(config, initialData, formData);
        if (success) {
            // No need to jiggle here, the modal closes.
        }
    };
    
    let formData = initialData;
    if (initialData && config.dataMapTransform) {
        try {
            formData = jsonata(config.dataMapTransform).evaluate(initialData);
        } catch(e) { console.error("JSONata error:", e); }
    }

    return (
        <Animated effect="cascadeIn">
            <Form
                schema={config.formSchema.schema}
                uiSchema={config.formSchema.uiSchema || {}}
                formData={formData}
                validator={validator}
                onSubmit={handleSubmit}
                // Update the templates prop to include our new ObjectFieldTemplate
                templates={{ 
                    FieldTemplate: AnimatedFieldTemplate,
                    ObjectFieldTemplate: PassThruObjectFieldTemplate // <-- ADD THIS LINE
                }}
                showErrorList={false} 
            >
                <div className="modal-actions">
                    <Animated tag="button" effect="buttonPress" type="button" className="btn" onClick={onClose}>Cancel</Animated>
                    <Animated tag="button" effect={["buttonPress", "clickJiggle"]} type="submit" className="btn btn-primary" animate={submitControls}>Submit</Animated>
                </div>
            </Form>
        </Animated>
    );
}

// 2. The GlobalFormModal is now much simpler.
// It handles the animation of the modal itself and renders the ModalForm inside.
export const GlobalFormModal = () => {
  const { modalState, closeModal } = useAppRuntime();
  const { isOpen, config, initialData } = modalState;

  if (!isOpen) return null;

  return (
    <Animated tag="div" effect="modalBackdrop" className="modal-backdrop">
      <Animated tag="div" effect="modalContent" className="modal-content" key="form-modal">
        <h3 className="modal-header">{config.formSchema.schema.title || config.name}</h3>
        {/* Render the new sub-component */}
        <ModalForm 
            config={config} 
            initialData={initialData}
            onClose={closeModal}
        />
      </Animated>
    </Animated>
  );
};

// --- NEW: RJSF Custom Object Template to remove the inner frame ---
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

// --- NEW: RJSF Custom Field Template for Animations ---
const AnimatedFieldTemplate = (props) => {
  // 1. Destructure ALL the important props RJSF provides
  const { id, label, children, rawErrors = [], help, required, displayLabel } = props;
  const shakeControls = useAnimationControls();

  useEffect(() => {
    if (rawErrors.length > 0) {
      shakeControls.start("shake");
    }
  }, [rawErrors, shakeControls]);

  return (
    // We add the 'form-group' class here for consistent styling
    <Animated tag="div" effect={["cascadeItem", "fieldErrorShake"]} animate={shakeControls} className="form-group">
      
      {/* 2. Render the label (the title) if it's supposed to be displayed */}
      {displayLabel && (
        <label htmlFor={id}>
          {label}
          {/* Also render a red asterisk if the field is required */}
          {required && <span className="required-asterisk">*</span>}
        </label>
      )}

      {/* 3. Render the actual input widget (this is the 'children') */}
      {children}
      
      {/* 4. Render any help text below the input */}
      {help}

    </Animated>
  );
};

// =================================================================
// --- Detail View Component ---
// =================================================================

export const DetailView = ({ fields, resourceEndpoint, resourceName }) => {
  // 1. Get the dynamic ':itemId' from the URL (e.g., 'user-123')
  const { itemId } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 2. Fetch data for this specific item
    setLoading(true);
    fetch(`http://localhost:3001${resourceEndpoint}/${itemId}`)
      .then(res => res.json())
      .then(data => {
        setItem(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch item details:", err);
        setLoading(false);
      });
  }, [resourceEndpoint, itemId]); // Refetch if the item ID or resource changes

  if (loading) return <p>Loading details...</p>;
  if (!item) return <p>Item not found.</p>;

   return (
    // 1. This outer wrapper ONLY handles the initial page load animation.
    <Animated tag="div" effect="fadeInUp">

      <h2 className="resource-page-title">{resourceName} Details</h2>

      {/* 2. This NEW inner wrapper ONLY handles the interactive tilt on the card. */}
      <Animated tag="div" effect="interactiveTilt" className="detail-view-card">
        {fields.map(field => (
          <div key={field.field} className="detail-field">
            <span className="detail-field-label">{field.label}</span>
            <span className="detail-field-value">{item[field.field]}</span>
          </div>
        ))}
      </Animated>

    </Animated>
  );
};
componentMap.DetailView = DetailView; // 4. Don't forget to add it to the map!