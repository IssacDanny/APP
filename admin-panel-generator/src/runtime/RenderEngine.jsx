// src/runtime/RenderEngine.jsx

import React from 'react';
// We will create ComponentLibrary in the next step.
import * as ComponentLibrary from './ComponentLibrary.jsx';

/**
 * The RenderEngine is a recursive component that translates an IR spec
 * into a tree of actual React components.
 * @param {{ spec: object, contextProps: object }} props
 *        - spec: The IR object for the component to render.
 *        - contextProps: Optional props to pass down to the component,
 *          like an `itemId` for actions within a table row.
 */
const RenderEngine = ({ spec, contextProps = {} }) => {
  // If spec is null, an empty array, or not an object, render nothing.
  if (!spec || typeof spec !== 'object' || Array.isArray(spec)) {
    return null;
  }

  // Look up the component class/function from our library using the IR's `component` name.
  const ComponentToRender = ComponentLibrary[spec.component];

  if (!ComponentToRender) {
    console.error(`Error: Component "${spec.component}" not found in ComponentLibrary.`);
    return <div style={{ color: 'red' }}>Component "{spec.component}" not found.</div>;
  }

  // Recursively render children if they exist in the spec.
  let renderedChildren = null;
  if (spec.props && Array.isArray(spec.props.children)) {
    renderedChildren = spec.props.children.map((childSpec, index) => (
      <RenderEngine key={index} spec={childSpec} contextProps={contextProps} />
    ));
  }
  
  // Combine the props from the IR spec with any contextual props passed down.
  const finalProps = { ...spec.props, ...contextProps };

  return (
    <ComponentToRender {...finalProps}>
      {renderedChildren}
    </ComponentToRender>
  );
};

export default RenderEngine;