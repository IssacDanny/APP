import React, { useState } from 'react';
import type { IChangeEvent } from '@rjsf/core';
import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';

import { FormAction } from '../engine/model';
import { ActionButton } from './ActionButton.tsx';
import { Modal } from './Modal.tsx';

interface Props {
  action: FormAction;
  context?: any; // The row data for update/delete
  onFormSubmit: (actionName: string, formData: any, context: any) => void;
}

export const FormActionButton: React.FC<Props> = ({ action, context, onFormSubmit }) => {
  // ✅ Correct: useState is now inside a React Function Component
  const [isModalOpen, setModalOpen] = useState(false);

  const handleSubmit = ({ formData }: IChangeEvent) => {
    onFormSubmit(action.name, formData, context);
    setModalOpen(false);
  };

  // Important: Check if action.formSchema exists before trying to access its properties
  if (!action.formSchema) {
    console.error("Action is missing formSchema:", action);
    return <ActionButton label={action.label} disabled />;
  }

  return (
    <>
      <ActionButton label={action.label} onClick={() => setModalOpen(true)} />
      <Modal
        title={action.formSchema.title}
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
      >
        <Form
          schema={action.formSchema}
          validator={validator}
          formData={context} // Pre-fills form for update/delete
          onSubmit={handleSubmit}
          // Added a simple submit button for the form
          children={<button type="submit" className="action-button">Submit</button>}
        />
      </Modal>
    </>
  );
};