/**
 * A centralized library of reusable animation presets for Framer Motion.
 * This architecture decouples animation logic from component logic, making
 * effects easy to maintain, reuse, and customize.
 */
export const effectLibrary = {
  // =================================================================
  // --- Page & Container Load Effects ---
  // Effects for entire pages or large containers entering the view.
  // =================================================================

  /**
   * A graceful fade-in and slide-up effect for pages or large components.
   */
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.4, ease: 'easeInOut' },
  },

  /**
   * A container effect that staggers the animation of its children.
   * Used for lists, tables, and form fields.
   */
  cascadeIn: {
    variants: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.07,
        },
      },
    },
    initial: 'hidden',
    animate: 'visible',
  },

  /**
   * The animation for an individual item within a `cascadeIn` container.
   */
  cascadeItem: {
    variants: {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 100 },
      },
    },
  },

  // =================================================================
  // --- Component-Specific Effects ---
  // Tailored effects for specific UI components like modals and dropdowns.
  // =================================================================

  /**
   * Fades in the modal backdrop overlay.
   */
  modalBackdrop: {
    variants: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
    initial: 'hidden',
    animate: 'visible',
    exit: 'hidden',
  },

  /**
   * A springy scale-in animation for the modal content itself.
   */
  modalContent: {
    variants: {
      hidden: { scale: 0.95, opacity: 0 },
      visible: { scale: 1, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 300 } },
      exit: { scale: 0.95, opacity: 0, transition: { duration: 0.15 } },
    },
    initial: 'hidden',
    animate: 'visible',
    exit: 'exit',
  },

  /**
   * A smooth expand/collapse animation for dropdowns, like nav folders.
   */
  smoothDropdown: {
    variants: {
      hidden: { opacity: 0, height: 0, transition: { when: "afterChildren" } },
      visible: { opacity: 1, height: "auto", transition: { when: "beforeChildren", staggerChildren: 0.07 } },
    },
    initial: 'hidden',
    animate: 'visible',
    exit: 'hidden',
  },
  
  // =================================================================
  // --- Interactive & Feedback Effects ---
  // Effects that respond directly to user interaction.
  // =================================================================

  /**
   * A fast and clear hover/press effect for buttons. Lifts and scales.
   */
  buttonPress: {
    whileHover: { y: -4, scale: 1.03, boxShadow: "0 10px 20px -5px rgb(0 0 0 / 0.15)" },
    whileTap: { scale: 0.97, y: -2 },
    transition: { duration: 0.15, ease: "easeOut" },
  },

  /**
   * A satisfying "jiggle" animation triggered after a successful click action.
   */
  clickJiggle: {
    variants: {
      rest: { rotate: 0 },
      jiggle: {
        rotate: [0, -5, 5, -5, 5, 0],
        transition: { duration: 0.4, ease: 'easeInOut' },
      },
    },
    initial: "rest",
  },

  /**
   * A subtle 3D tilt effect for cards on hover.
   */
  interactiveTilt: {
    whileHover: {
      scale: 1.05,
      rotateX: 10,
      boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    },
    transition: { type: 'spring', stiffness: 300, damping: 20 },
  },

  /**
   * A rapid "shake" animation to indicate a validation error on a form field.
   */
  fieldErrorShake: {
    variants: {
      rest: { x: 0 },
      shake: {
        x: [0, -8, 8, -8, 8, 0],
        transition: { duration: 0.4, ease: "easeInOut" },
      },
    },
    initial: "rest",
  },
};