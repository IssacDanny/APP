import React from 'react';
import { motion } from 'framer-motion';
import { effectLibrary } from './effectLibrary';

/**
 * A generic wrapper component that applies named animation effects from the
 * effect library to its children. It acts as the "Effect Engine" for the UI.
 *
 * @param {object} props
 * @param {string | string[]} props.effect - The name(s) of the effect(s) from the library.
 * @param {React.ReactNode} props.children - The content to be animated.
 * @param {React.ElementType} [props.tag='div'] - The HTML tag or React component to render.
 * @param {import('framer-motion').AnimationControls} [props.animate] - External animation controls to override the default animation state.
 * @example
 * // Simple fade-in effect on a div
 * <Animated effect="fadeInUp">...</Animated>
 * @example
 * // A button with multiple interactive effects
 * <Animated tag="button" effect={["buttonPress", "clickJiggle"]} animate={controls}>...</Animated>
 */
export const Animated = ({ effect, children, tag = 'div', animate, ...restProps }) => {
  // 1. Combine props from all requested effects from the library.
  // The reduce function here iterates through the effect names (even if it's just one)
  // and merges their corresponding objects from the effectLibrary.
  const effectNames = Array.isArray(effect) ? effect : [effect];
  const animationProps = effectNames.reduce((props, name) => {
    const effectConfig = effectLibrary[name] || {};
    return { ...props, ...effectConfig };
  }, {});

  // If no valid effects were found, we render a plain, non-animated tag.
  if (Object.keys(animationProps).length === 0) {
    const PlainTag = tag;
    return <PlainTag {...restProps}>{children}</PlainTag>;
  }

  // 2. Improve Robustness: Use `motion(tag)` which works for both standard HTML
  // tags (e.g., 'div') and custom React components. `motion[tag]` only works for HTML tags.
  const MotionComponent = motion(tag);

  // 3. Improve Clarity: Explicitly combine all props.
  const finalProps = {
    ...animationProps, // Base props from the effect library
    ...restProps,     // Any other props passed in (e.g., className, onClick)
  };

  // If external animation controls are passed via the `animate` prop,
  // they take precedence over the default `animate` state from the library.
  if (animate) {
    finalProps.animate = animate;
  }

  return (
    <MotionComponent {...finalProps}>
      {children}
    </MotionComponent>
  );
};