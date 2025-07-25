// src/runtime/Animated.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { effectLibrary } from './effectLibrary';

/**
 * A generic wrapper component that applies a named animation effect
 * from the effect library to its children.
 * Now handles both entrance animations and interactive animations.
 *
 * @param {object} props
 * @param {string | string[]} props.effect - The name(s) of the effect(s) to apply.
 * @param {React.ReactNode} props.children - The content to be animated.
 * @param {string} [props.tag='div'] - The HTML tag to use for the motion component.
 */
export const Animated = ({ effect, children, tag = 'div', animate, ...restProps }) => {
  // Allow for a single effect name or an array of names
  const effectNames = Array.isArray(effect) ? effect : [effect];

  // Combine props from all requested effects
  const animationProps = effectNames.reduce((props, name) => {
    const effectProps = effectLibrary[name] || {};
    return { ...props, ...effectProps };
  }, {});

  // If no valid effects are found, just render a plain tag
  if (Object.keys(animationProps).length === 0) {
    const Tag = tag;
    return <Tag {...restProps}>{children}</Tag>;
  }

  const MotionComponent = motion[tag];

  // If an 'animate' prop is passed, it overrides the one from the library.
  // This lets us pass in animation controls.
  return (
    <MotionComponent {...animationProps} {...restProps} animate={animate || animationProps.animate}>
      {children}
    </MotionComponent>
  );
};