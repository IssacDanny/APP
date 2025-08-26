import React from 'react';
import { componentMap } from './ComponentLibrary';

/**
 * A small, dedicated component for rendering developer-facing errors.
 * @param {{ componentName: string }} props
 */
const RenderError = ({ componentName }) => (
  <div className="render-engine-error">
    <p>
      <strong>Render Error:</strong> Unknown component type '<code>{componentName}</code>'.
      Check the <code>componentMap</code> in ComponentLibrary.jsx.
    </p>
  </div>
);


/**
 * The RenderEngine is a recursive component that translates the UI Intermediate
 * Representation (IR) into a tree of actual React components. It is the
 * core of the runtime rendering system.
 *
 * @param {object} props
 * @param {object} props.ir - The IR object for the component to render.
 * @param {object} [props.restProps] - Any additional, contextual props to pass down,
 *   such as `itemData` from a table row to an action button.
 * @returns {React.ReactElement | null}
 */
export const RenderEngine = ({ ir, ...restProps }) => {
  // --- 1. Guard Clause ---
  // If there's no IR or it's not a valid object, render nothing.
  if (!ir || typeof ir !== 'object' || !ir.component) {
    return null;
  }

  const { component: ComponentName, props: irProps = {} } = ir;

  // --- 2. Component Lookup ---
  const Component = componentMap[ComponentName];

  if (!Component) {
    console.error(`RenderEngine Error: Component "${ComponentName}" not found in componentMap.`);
    // Use our new, styled error component.
    return <RenderError componentName={ComponentName} />;
  }

  // --- 3. Prop Combination ---
  // Combine props from the IR with any contextual props passed down.
  // Contextual props (restProps) take precedence.
  const finalProps = { ...irProps, ...restProps };

  // --- 4. Render ---
  // Render the looked-up component with the final props.
  // The rendered component is responsible for calling RenderEngine again
  // for any of its own children that are defined by IR.
  return <Component {...finalProps} />;
};