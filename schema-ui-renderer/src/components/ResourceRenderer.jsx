import React, { useState, useMemo } from 'react';
import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';

import GenericTable from './GenericTable';
import Modal from './Modal';

const ResourceRenderer = ({ manifest, initialData }) => {
  // === STATE ===
  const [data, setData] = useState(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState(null); // 'create', 'update', 'delete'
  const [currentItem, setCurrentItem] = useState(null); // The item being edited/deleted

  // === DERIVED CONFIGURATION (using useMemo for performance) ===
  const { viewSchema, actions } = manifest;
  const createAction = actions.create;
  const rowActions = Object.keys(actions).filter(a => a !== 'create');

  // === EVENT HANDLERS ===
  const handleOpenModal = (actionName, item = null) => {
    setCurrentAction(actionName);
    setCurrentItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentAction(null);
    setCurrentItem(null);
  };

  const handleFormSubmit = ({ formData }) => {
    console.log(`Simulating API call for action: ${currentAction}`, formData);

    if (currentAction === 'create') {
      const newItem = { ...formData, id: Date.now() }; // Create a new item with a unique ID
      setData([...data, newItem]);
    }

    if (currentAction === 'update') {
      setData(data.map(item => (item.id === currentItem.id ? { ...item, ...formData } : item)));
    }

    if (currentAction === 'delete') {
      if (formData.confirmation) { // Check if the confirmation checkbox was ticked
        setData(data.filter(item => item.id !== currentItem.id));
      }
    }
    
    handleCloseModal();
  };

  // === DYNAMIC FORM SCHEMA ===
  // Determine which schema to show based on the current action
  const formSchema = currentAction ? actions[currentAction]?.formSchema : {};

  return (
    <div className="resource-renderer">
      <header className="resource-header">
        <h1>{viewSchema.title}</h1>
        {createAction && (
          <button className="create-button" onClick={() => handleOpenModal('create')}>
            {createAction.label}
          </button>
        )}
      </header>

      <GenericTable
        schema={viewSchema}
        data={data}
        rowActions={rowActions}
        onRowAction={handleOpenModal}
      />

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={formSchema?.title}>
        {formSchema && (
          <Form
            schema={formSchema}
            formData={currentItem} // Pre-fills the form for update/delete actions
            validator={validator}
            onSubmit={handleFormSubmit}
          />
        )}
      </Modal>
    </div>
  );
};

export default ResourceRenderer;