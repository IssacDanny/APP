import React from 'react';

// Import the map that connects IR component names to actual React components.
import { componentMap } from './ComponentLibrary';

/**
 * The RenderEngine is a recursive component that translates the UI Intermediate
 * Representation (IR) into actual React components. It's the core of the
 * runtime rendering system.
 *
 * @param {object} props
 * @param {object} props.ir - The IR object for the component to render.
 *                            Example: { component: 'NavLink', props: { text: 'Products', to: '/res/products' } }
 * @param {object} [props.itemData] - Optional item-specific data passed down from a parent
 *                                  (e.g., a table row's data passed to an action button).
 * @returns {React.ReactElement | null} The rendered React component or null if rendering is not possible.
 */
export const RenderEngine = ({ ir, ...restProps }) => {
  // --- 1. Guard Clauses ---
  // If there's no IR or the IR is missing a component name, we can't render anything.
  if (!ir || !ir.component) {
    return null;
  }

  // Destructure the component name and its props from the IR.
  const { component: ComponentName, props: irProps } = ir;

  // --- 2. Component Lookup ---
  // Find the actual React component in our map.
  const Component = componentMap[ComponentName];

  // If the component name from the IR doesn't exist in our map, it's a
  // configuration error. We render a clear error message for the developer.
  if (!Component) {
    console.error(`RenderEngine Error: Component "${ComponentName}" not found in componentMap.`);
    // This visible error is extremely helpful during development.
    return (
      <div style={{ color: 'red', border: '1px solid red', padding: '8px', margin: '4px' }}>
        Error: Unknown component type '{ComponentName}'
      </div>
    );
  }

  // --- 3. Prop Combination ---
  // Combine the props defined in the IR with any additional props passed directly
  // to the RenderEngine. This is how we pass contextual data like `itemData`
  // from a table row to an `ActionButton`.
  const finalProps = { ...irProps, ...restProps };

  // --- 4. Render ---
  // Render the looked-up component with the final, combined props.
  // The components themselves (like AppShell or ResourcePageLayout) are responsible
  // for using the RenderEngine again to render their own children if those children
  // are also defined by IR.
  return <Component {...finalProps} />;
};